export const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

export function formatDateTime(value?: string | null) {
    if (!value) return '—'
    try {
        return dateTimeFormatter.format(new Date(value))
    } catch {
        return value
    }
}
export const dateFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' })
export function formatDateOnly(value?: string | null) {
    if (!value) return '—'
    try {
        const parsed = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`)
        return dateFormatter.format(parsed)
    } catch {
        return value
    }
}