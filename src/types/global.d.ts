
declare global {
  interface Window {
    XLSX?: {
      read(data: ArrayBuffer | Uint8Array, opts: { type: 'array' }): {
        SheetNames: string[]
        Sheets: Record<string, unknown>
      }
      utils: {
        sheet_to_json<T = Record<string, unknown>>(sheet: unknown, opts?: { defval?: unknown }): T[]
        json_to_sheet(data: unknown[], opts?: { header?: string[] }): unknown
        book_new(): unknown
        book_append_sheet(workbook: unknown, worksheet: unknown, name?: string): void
      }
      writeFile(workbook: unknown, filename: string): void
    }
  }
}

export {}
