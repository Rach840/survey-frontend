import {apiFetch} from "@/shared"
import type {Template} from "@/entities/templates/types"

export async function getTemplateByMe(): Promise<Template[] | []> {
    const response = await apiFetch('/api/template/getByUser')
    if (response.status === 401) return []
    if (!response.ok) throw new Error('Failed to load profile')
    return response.json()
}
