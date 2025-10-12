export type UserDTO = { id: string; email: string; full_name?: string }

export async function getMe(): Promise<UserDTO | null> {
    const res = await fetch('/api/me', { credentials: 'include', cache: 'no-store' })
    if (res.status === 401) return null
    if (!res.ok) throw new Error('Failed to load profile')
    return res.json()
}