import {apiFetch} from '@/shared'
import type {SurveyResultsPayload} from '../types'

export async function getSurveyResults(id: string): Promise<SurveyResultsPayload> {
  const response = await apiFetch(`/api/survey/${id}/results`)

  if (!response.ok) {
    throw new Error('Failed to load survey')
  }

  return response.json()
}
