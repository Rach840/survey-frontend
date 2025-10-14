import { apiFetch } from "@/shared"

export type UserDTO = { id: string; email: string; full_name?: string }

export async function getMe(): Promise<UserDTO | null> {
    const response = await apiFetch('/api/me')
    if (response.status === 401) return null
    if (!response.ok) throw new Error('Failed to load profile')
    return response.json()
}
