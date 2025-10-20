import {apiFetch} from '@/shared'

export interface AddSurveyParticipantPayload {
  surveyId: string
  full_name: string
  email?: string
  phone?: string
}

export async function addSurveyParticipant({ surveyId, ...payload }: AddSurveyParticipantPayload) {
  const query = new URLSearchParams({ survey: surveyId })
  const response = await apiFetch(`/api/survey/enrollment?${query.toString()}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to add participant')
  }

  return response.json()
}
