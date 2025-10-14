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

export interface SurveyStats {
  invited: number
  pending: number
  active: number
  inProgress: number
  submitted: number
  expired: number
}

export interface SurveyParticipant {
  id: number
  fullName: string
  email?: string
  source: 'admin' | 'bot'
  state: EnrollmentState
  responseState?: ResponseState | null
  progress: number
  lastActivity?: string | null
  submittedAt?: string | null
}

export interface SurveyDetail {
  id: number
  title: string
  description?: string | null
  status: SurveyStatus
  mode: SurveyMode
  snapshotVersion: number
  templateId?: number | null
  templateTitle?: string | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
  stats: SurveyStats
  participants: SurveyParticipant[]
}

export type UpdateSurveyPayload = Partial<{
  title: string
  description: string | null
  status: SurveyStatus
  maxParticipants: number | null
  startsAt: string | null
  endsAt: string | null
}>
