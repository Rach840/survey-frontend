type JsPdfConstructor = new (...args: unknown[]) => JsPdfInstance

type JsPdfGlobal = {
  jsPDF: JsPdfConstructor & {
    API: {
      addFileToVFS: (filename: string, data: string) => void
      addFont: (filename: string, fontName: string, fontStyle: string) => void
    }
  }
}

type JsPdfHtmlOptions = {
  callback?: (doc: JsPdfInstance) => void
  margin?: number | [number, number, number, number]
  autoPaging?: 'text' | 'slice'
  x?: number
  y?: number
  width?: number
  windowWidth?: number
  html2canvas?: {
    scale?: number
    useCORS?: boolean
    backgroundColor?: string | null
    onclone?: (doc: Document) => void
  }
}

export type JsPdfInstance = {
  setFont: (font: string, style?: string) => void
  setFontSize: (size: number) => void
  setLineHeightFactor: (value: number) => void
  splitTextToSize: (text: string, maxSize: number) => string[]
  text: (text: string | string[], x: number, y: number) => void
  addPage: () => void
  save: (filename: string) => void
  addFileToVFS: (filename: string, data: string) => void
  addFont: (filename: string, fontName: string, fontStyle: string) => void
  html: (element: HTMLElement | string, options?: JsPdfHtmlOptions) => Promise<void>
  internal: {
    pageSize: {
      getWidth: () => number
      getHeight: () => number
    }
  }
}

let jsPdfLoader: Promise<JsPdfGlobal> | null = null
let html2CanvasLoader: Promise<void> | null = null

const JSPDF_CDN_SRC = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
const HTML2CANVAS_CDN_SRC = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'

function loadJsPdfScript(): Promise<JsPdfGlobal> {
  if (window.jspdf?.jsPDF) {
    return Promise.resolve(window.jspdf)
  }

  if (!jsPdfLoader) {
    jsPdfLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = JSPDF_CDN_SRC
      script.async = true
      script.onload = () => {
        if (window.jspdf?.jsPDF) {
          resolve(window.jspdf)
        } else {
          reject(new Error('Не удалось загрузить библиотеку jsPDF'))
        }
      }
      script.onerror = () => {
        reject(new Error('Ошибка загрузки скрипта jsPDF'))
      }
      document.head.appendChild(script)
    })
  }

  return jsPdfLoader
}

function loadHtml2CanvasScript(): Promise<void> {
  if (window.html2canvas) {
    return Promise.resolve()
  }

  if (!html2CanvasLoader) {
    html2CanvasLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = HTML2CANVAS_CDN_SRC
      script.async = true
      script.onload = () => {
        if (window.html2canvas) {
          resolve()
        } else {
          reject(new Error('Не удалось загрузить библиотеку html2canvas'))
        }
      }
      script.onerror = () => {
        reject(new Error('Ошибка загрузки скрипта html2canvas'))
      }
      document.head.appendChild(script)
    })
  }

  return html2CanvasLoader
}

export async function loadJsPdf(): Promise<JsPdfGlobal> {
  if (typeof window === 'undefined') {
    throw new Error('jsPDF доступен только в браузере')
  }

  const global = await loadJsPdfScript()
  await loadHtml2CanvasScript()
  return global
}

type FontDefinition = {
  path: string
  vfsName: string
  fontName: string
  fontStyle: 'normal' | 'bold'
}

const PDF_FONT_NAME = 'LiberationSans'

const FONT_DEFINITIONS: FontDefinition[] = [
  {
    path: '/fonts/LiberationSans-Regular.ttf',
    vfsName: 'LiberationSans-Regular.ttf',
    fontName: PDF_FONT_NAME,
    fontStyle: 'normal',
  },
  {
    path: '/fonts/LiberationSans-Bold.ttf',
    vfsName: 'LiberationSans-Bold.ttf',
    fontName: PDF_FONT_NAME,
    fontStyle: 'bold',
  },
]

type CachedFont = {
  definition: FontDefinition
  data: string
}

let cachedFonts: CachedFont[] | null = null
let fontsLoading: Promise<void> | null = null

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 8192
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

async function ensureFontDataLoaded() {
  if (cachedFonts) return cachedFonts

  if (!fontsLoading) {
    fontsLoading = (async () => {
      const fonts: CachedFont[] = []

      for (const font of FONT_DEFINITIONS) {
        const response = await fetch(font.path)
        if (!response.ok) {
          throw new Error(`Не удалось загрузить шрифт (${font.path})`)
        }

        const buffer = await response.arrayBuffer()
        const data = arrayBufferToBase64(buffer)
        fonts.push({ definition: font, data })
      }

      cachedFonts = fonts
    })().catch((error) => {
      fontsLoading = null
      cachedFonts = null
      throw error
    })
  }

  await fontsLoading
  return cachedFonts ?? []
}

export async function ensureCyrillicFont(doc: JsPdfInstance): Promise<string> {
  const fonts = await ensureFontDataLoaded()

  fonts.forEach(({ definition, data }) => {
    doc.addFileToVFS(definition.vfsName, data)
    doc.addFont(definition.vfsName, definition.fontName, definition.fontStyle)
  })

  doc.setFont(PDF_FONT_NAME, 'normal')
  return PDF_FONT_NAME
}

export async function getPdfFontCss(): Promise<string> {
  const fonts = await ensureFontDataLoaded()

  return fonts
    .map(({ definition, data }) => {
      const weight = definition.fontStyle === 'bold' ? 700 : 400
      const format = definition.vfsName.endsWith('.ttf') ? 'truetype' : 'opentype'
      return `@font-face { font-family: '${definition.fontName}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url('data:font/${format};base64,${data}') format('${format}'); }`
    })
    .join('\n')
}

declare global {
  interface Window {
    jspdf?: JsPdfGlobal
    html2canvas?: (element: HTMLElement, options?: unknown) => Promise<HTMLCanvasElement>
  }
}
