import {apiFetch} from "@/shared"
import {User} from "@/entities/user/types";

export async function getAllUsers(): Promise<User[] | null> {
    const response = await apiFetch('/api/users/')
    if (response.status === 401) return null
    if (!response.ok) throw new Error('Failed to load profile')
    return response.json()
}
