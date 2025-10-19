let loader: Promise<NonNullable<typeof window.XLSX>> | null = null

const XLSX_CDN_SRC = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'

export function loadXlsx(): Promise<NonNullable<typeof window.XLSX>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('XLSX доступен только в браузере'))
  }
  if (window.XLSX) {
    return Promise.resolve(window.XLSX)
  }
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = XLSX_CDN_SRC
      script.async = true
      script.onload = () => {
        if (window.XLSX) {
          resolve(window.XLSX)
        } else {
          reject(new Error('Не удалось загрузить библиотеку XLSX'))
        }
      }
      script.onerror = () => {
        reject(new Error('Ошибка загрузки скрипта XLSX'))
      }
      document.head.appendChild(script)
    })
  }
  return loader
}
