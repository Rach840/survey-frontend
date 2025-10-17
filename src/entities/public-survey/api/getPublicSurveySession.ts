import type {PublicSurveySession} from '../types'
import type {TemplateSection} from '@/entities/templates/types'
import type {EnrollmentState, ResponseState, SurveyMode, SurveyStatus,} from '@/entities/surveys/types'

type RawSurveyBlock = {
  id: number
  title: string
  description?: string | null
  status: SurveyStatus
  mode: SurveyMode
  snapshot_version: number
  form_snapshot_json?: TemplateSection[] | null
  starts_at?: string | null
  ends_at?: string | null
}

type RawEnrollmentBlock = {
  id: number
  full_name: string
  email?: string | null
  phone?: string | null
  telegram_chat_id?: number | null
  state: EnrollmentState
}

type RawResponseBlock = {
  id: number
  state: ResponseState
  submitted_at?: string | null
  answers_json?: Record<string, unknown>
  answers?: Record<string, unknown>
}

type RawPublicSurveySession = {
  survey: RawSurveyBlock
  enrollment: RawEnrollmentBlock
  response?: RawResponseBlock | null
}

function normalizeAnswers(block?: RawResponseBlock | null) {
  if (!block) return undefined
  const answers = block.answers_json ?? block.answers
  if (answers && typeof answers === 'object') {
    return answers
  }
  return undefined
}

function mapSession(raw: RawPublicSurveySession): PublicSurveySession {
  return {
    survey: {
      id: raw.survey.id,
      title: raw.survey.title,
      description: raw.survey.description ?? null,
      status: raw.survey.status,
      mode: raw.survey.mode,
      snapshotVersion: raw.survey.snapshot_version,
      formSnapshot: raw.survey.form_snapshot_json ?? [],
      startsAt: raw.survey.starts_at ?? null,
      endsAt: raw.survey.ends_at ?? null,
    },
    enrollment: {
      id: raw.enrollment.id,
      fullName: raw.enrollment.full_name,
      email: raw.enrollment.email ?? null,
      phone: raw.enrollment.phone ?? null,
      telegramChatId: raw.enrollment.telegram_chat_id ?? null,
      state: raw.enrollment.state,
    },
    response: raw.response
      ? {
          id: raw.response.id,
          state: raw.response.state,
          submittedAt: raw.response.submitted_at ?? null,
          answers: normalizeAnswers(raw.response),
        }
      : undefined,
  }
}

export async function getPublicSurveySession(
  token: string,
): Promise<PublicSurveySession> {
  console.log(token)
  const response = await fetch(`/api/public/survey/${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    const error = new Error(detail || 'Failed to load public survey') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const data = (await response.json()) as RawPublicSurveySession
  return mapSession(data)
}
