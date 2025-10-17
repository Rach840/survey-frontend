import type {PublicSurveySubmitPayload} from '../types'

export async function submitPublicSurveyResponse(
  token: string,
  payload: PublicSurveySubmitPayload,
) {
  const response = await fetch(
    `/api/public/survey/${encodeURIComponent(token)}/responses`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const error = new Error(errorText || 'Failed to submit survey response') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json().catch(() => ({ ok: true }))
}
