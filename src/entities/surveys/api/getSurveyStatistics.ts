import {apiFetch} from '@/shared'
import type {SurveyStatisticsResponse} from '../types'

export async function getSurveyStatistics(id: string): Promise<SurveyStatisticsResponse> {
  const response = await apiFetch(`/api/survey/${id}`)

  if (!response.ok) {
    throw new Error('Failed to load survey statistics')
  }

  return response.json()
}
