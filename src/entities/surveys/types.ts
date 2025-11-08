export type SurveyStatus = 'draft' | 'open' | 'closed' | 'archived'
export type SurveyMode = 'admin' | 'bot'
export type EnrollmentState =
  | 'invited'
  | 'pending'
  | 'approved'
  | 'active'
  | 'removed'
  | 'rejected'
  | 'expired'
export type ResponseState = 'in_progress' | 'submitted'
export type DraftPayload = {
  updatedAt: number
  values: Record<string, unknown>
}
export interface SurveyStats {
  invited: number
  pending: number
  active: number
  inProgress: number
  submitted: number
  expired: number
}

export interface SurveyParticipant {
  enrollment_id: number
  full_name: string
  email?: string
  source: 'questioner' | 'bot'
  state: EnrollmentState
  responseState?: ResponseState | null
  progress: number
  lastActivity?: string | null
  submittedAt?: string | null
  expires_at?: string | null
  token: string
}

export interface SurveyDetail {
  id: number
  title: string
  description?: string | null
  status: SurveyStatus
  mode: SurveyMode
  snapshot_version: number
  template_id?: number | null
  templateTitle?: string | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
  stats: SurveyStats
  invitations?: SurveyParticipant[]
  participants?: SurveyParticipant[]
}

export interface Survey {
  id: number
  owner_id: number
  template_id: number
  snapshot_version: number
  form_snapshot_json?: unknown
  title: string
  mode: string
  status: string
  description?: string | null
  max_participants?: number | null
  starts_at?: string | null
  ends_at?: string | null
  created_at: string

}
export interface SurveyWithStatistic {
  survey: Survey
  statistics: SurveyResultsStatistics
}

export interface SurveyInvitationSummary {
  enrollment_id: number
  token: string
  expires_at: string
  full_name: string
  email: string
}

export interface SurveyResultsStatistics {
  total_enrollments: number
  responses_started: number
  responses_submitted: number
  responses_in_progress: number
  completion_rate: number
  overall_progress: number
  average_completion_seconds?: number | null
  average_completion_duration?: string | null
}

export interface SurveyResult {
  survey: Survey
  statistics: SurveyResultsStatistics
  invitations?: SurveyInvitationSummary[]
}

export type SurveyStatisticsResponse = SurveyResult

export interface SurveyResultsEnrollment {
  id: number
  survey_id: number
  full_name: string
  email?: string | null
  phone?: string | null
  state: EnrollmentState
  token_expires_at?: string | null
  use_limit?: number | null
  used_count?: number | null
}

export interface SurveyResultsResponseMeta {
  id: number
  survey_id: number
  enrollment_id: number
  state: ResponseState
  channel?: string | null
  started_at?: string | null
  submitted_at?: string | null
}

export interface SurveyResultsAnswer {
  question_code: string
  section_code?: string | null
  repeat_path?: string | null
  value_text?: string | null
  value_number?: number | null
  value_bool?: boolean | null
  value_date?: string | null
  value_datetime?: string | null
  value_json?: unknown
}

export interface SurveyResultsItem {
  survey: Survey
  enrollment: SurveyResultsEnrollment
  response: SurveyResultsResponseMeta
  answers: SurveyResultsAnswer[]
}

export interface SurveyResultsPayload {
  survey: Survey
  results: SurveyResultsItem[]
  statistics: SurveyResultsStatistics
}

export type UpdateSurveyPayload = {
  title?: string
  invitationMode?: SurveyMode
  status?: SurveyStatus
  maxParticipants?: number | null
  publicSlug?: string | null
  startsAt?: string | null
  endsAt?: string | null
}
