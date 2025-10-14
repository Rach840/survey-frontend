import { apiFetch } from '@/shared'
import type { SurveyDetail } from '../types'

export async function getSurveyDetail(id: string): Promise<SurveyDetail> {
  const response = await apiFetch(`/api/survey/${id}`)

  if (!response.ok) {
    throw new Error('Failed to load survey')
  }

  return response.json()
}
