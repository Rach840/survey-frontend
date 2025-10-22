import type {StartPublicSurveyPayload} from '../types'

export async function startPublicSurveySession(payload: StartPublicSurveyPayload) {
  const response = await fetch('/survey/start', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const error = new Error(errorText || 'Failed to start survey session') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json().catch(() => ({ ok: true }))
}
