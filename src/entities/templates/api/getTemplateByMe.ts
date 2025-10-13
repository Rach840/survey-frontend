import {apiFetch} from "@/shared";

export type UserDTO = { id: string; email: string; full_name?: string }

export async function getTemplateByMe(): Promise<Template[] | null> {
    const r = await apiFetch<Template[]>('/api/template/getByUser')
        const res =  await r.json()
    console.log(
        'asdfasdfadsf'
    )
    console.log(res)
    if (r.status === 401) return null
    if (!r.ok) throw new Error('Failed to load profile')
    return res
}