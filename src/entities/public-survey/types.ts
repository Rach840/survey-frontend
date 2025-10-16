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

export type PublicSurveySubmitPayload = {
  answers: Record<string, unknown>
  channel?: 'web' | 'tg_webapp' | 'api'
}
