import { apiFetch } from '@/shared'
import type { Template } from '../types'

export async function getTemplateById(id: string): Promise<Template> {
  const response = await apiFetch(`/api/template/${id}`)

  if (!response.ok) {
    throw new Error('Failed to load template')
  }

  return response.json()
}
