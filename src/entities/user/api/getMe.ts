import {apiFetch} from "@/shared";

export type UserDTO = { id: string; email: string; full_name?: string }

export async function getMe(): Promise<UserDTO | null> {
    const r = await apiFetch<UserDTO>('/api/me')
    if (r.status === 401) return null
    if (!r.ok) throw new Error('Failed to load profile')
    return await r.json()
}