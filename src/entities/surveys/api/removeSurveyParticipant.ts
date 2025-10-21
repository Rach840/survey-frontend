import {apiFetch} from '@/shared'

export interface RemoveSurveyParticipantParams {
  surveyId: string
  enrollmentId: string
}

export async function removeSurveyParticipant({ surveyId, enrollmentId }: RemoveSurveyParticipantParams) {
  const response = await apiFetch(`/api/survey/${surveyId}/participants/${enrollmentId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to remove participant')
  }
}
