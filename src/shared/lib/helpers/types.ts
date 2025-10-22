import {SurveyMode, SurveyStatus} from "@/entities/surveys/types";

export type MetricCard = {
    label: string
    value: string
    percentage?: number
}

export type EditFormState = {
    title: string
    mode: SurveyMode
    status: SurveyStatus
    maxParticipants: string
    publicSlug: string
    startsAt: string
    endsAt: string
}

export type SnapshotField = {
    code?: string
    label?: string
    title?: string
    type?: string
    required?: boolean
}

export type SnapshotSection = {
    code?: string
    title?: string
    repeatable?: boolean
    fields: SnapshotField[]
}

export const enrollmentLabels: Record<string, string> = {
    invited: 'Приглашён',
    pending: 'Ожидает',
    approved: 'Одобрен',
    active: 'Активен',
    rejected: 'Отклонён',
    removed: 'Удалён',
    expired: 'Истёк',
}

export const responseLabels: Record<string, string> = {
    in_progress: 'В процессе',
    submitted: 'Завершено',
}
