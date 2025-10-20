import {apiFetch} from '@/shared'

export interface RemoveSurveyParticipantParams {
  surveyId: string
  enrollmentId: string
}

export async function removeSurveyParticipant({ surveyId, enrollmentId }: RemoveSurveyParticipantParams) {
  const query = new URLSearchParams({ survey: surveyId, enrollment: enrollmentId })
  const response = await apiFetch(`/api/survey/enrollment?${query.toString()}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to remove participant')
  }
}
