import type { TemplateSection } from '@/entities/templates/types'
import type {
  EnrollmentState,
  ResponseState,
  SurveyMode,
  SurveyStatus,
} from '@/entities/surveys/types'

export interface PublicSurveyDetails {
  id: number
  title: string
  description?: string | null
  status: SurveyStatus
  mode: SurveyMode
  snapshotVersion: number
  formSnapshot: TemplateSection[]
  startsAt?: string | null
  endsAt?: string | null
}

export interface PublicSurveyEnrollment {
  id: number
  fullName: string
  email?: string | null
  phone?: string | null
  telegramChatId?: number | null
  state: EnrollmentState
}

export interface PublicSurveyResponse {
  id: number
  state: ResponseState
  submittedAt?: string | null
  answers?: Record<string, unknown>
}

export interface PublicSurveySession {
  survey: PublicSurveyDetails
  enrollment: PublicSurveyEnrollment
  response?: PublicSurveyResponse
}

export interface SurveySubmissionAnswer {
  question_code: string
  section_code?: string
  repeat_path?: string
  value_text?: string
  value_number?: number
  value_bool?: boolean
  value_date?: string
  value_datetime?: string
  value_json?: unknown
}

export interface PublicSurveySubmitPayload {
  token: string
  channel?: 'web' | 'tg_webapp' | 'api'
  answers: SurveySubmissionAnswer[]
}

export interface StartPublicSurveyPayload {
  token: string
  channel?: string
}
