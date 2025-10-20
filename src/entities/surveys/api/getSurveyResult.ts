import {apiFetch} from '@/shared'
import type {SurveyResultsItem} from '../types'

export async function getSurveyResult(params: { surveyId: string; enrollmentId: string }): Promise<SurveyResultsItem> {
  const { surveyId, enrollmentId } = params
  const query = new URLSearchParams({ survey: surveyId, enrollment: enrollmentId })

  const response = await apiFetch(`/api/survey/result?${query.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to load survey result')
  }

  return response.json()
}
