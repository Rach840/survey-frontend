import {Template} from "@/entities/templates/types";

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
  snapshot_version: number
  template_id?: number | null
  templateTitle?: string | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
  stats: SurveyStats
  participants: SurveyParticipant[]
}
export interface Survey {
  id: number,
  owner_id: number,
  template_id: number,
  snapshot_version: number,
  form_snapshot_json: Template,
  title: string,
  mode: string,
  status: string,
  description?: string | null,
  created_at: string
}

export type UpdateSurveyPayload = Partial<{
  title: string
  description: string | null
  status: SurveyStatus
  maxParticipants: number | null
  startsAt: string | null
  endsAt: string | null
}>
