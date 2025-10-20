import {apiFetch} from '@/shared'

export interface ExtendEnrollmentTokenParams {
  surveyId: string
  enrollmentId: string
  expiresAt: string
}

export async function extendEnrollmentToken({ surveyId, enrollmentId, expiresAt }: ExtendEnrollmentTokenParams) {
  const query = new URLSearchParams({ survey: surveyId, enrollment: enrollmentId })
  const response = await apiFetch(`/api/survey/enrollment/extend?${query.toString()}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ expires_at: expiresAt }),
  })

  if (!response.ok) {
    throw new Error('Failed to extend token')
  }

  return response.json()
}
