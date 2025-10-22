import {apiFetch} from '@/shared'
import type {SurveyDetail, UpdateSurveyPayload} from '../types'

export async function updateSurvey(
  id: string,
  payload: UpdateSurveyPayload,
): Promise<SurveyDetail> {
  console.log(payload)
  const response = await apiFetch(`/api/survey/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to update survey')
  }

  return response.json()
}
