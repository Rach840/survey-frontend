import { apiFetch } from "@/shared"
import type { Template } from "@/entities/templates/types"

export type UserDTO = { id: string; email: string; full_name?: string }

export async function getTemplateByMe(): Promise<Template[] | null> {
    const response = await apiFetch('/api/template/getByUser')
    if (response.status === 401) return null
    if (!response.ok) throw new Error('Failed to load profile')
    return response.json()
}
