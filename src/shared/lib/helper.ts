import {TemplateField, TemplateSection} from "@/entities/templates/types";
import {SurveyResult} from "@/entities/surveys/types";
import {SnapshotField, SnapshotSection} from "@/shared/lib";
import {isPlainRecord} from "@/shared";

type MetricCard = {
    label: string
    value: string
    percentage?: number
}
export const defaultStats = {
    total_enrollments: 0,
    responses_started: 0,
    responses_submitted: 0,
    responses_in_progress: 0,
    completion_rate: 0,
    overall_progress: 0,
}



export  function helper(snapshot: unknown, ): TemplateSection[] {
    if (!snapshot) return []

    const fromArray = (sections: unknown[]): TemplateSection[] =>
        sections
            .map((section, sectionIndex) => {
                if (!isPlainRecord(section)) return null

                const fieldsSource = Array.isArray(section.fields) ? section.fields : []
                const fields = fieldsSource
                    .map((field, fieldIndex) => {
                        if (!isPlainRecord(field)) return null
                        const options = Array.isArray(field.options)
                            ? field.options
                                .filter(isPlainRecord)
                                .map((option) => ({
                                    code: typeof option.code === 'string' ? option.code : String(option.code ?? ''),
                                    label: typeof option.label === 'string' ? option.label : String(option.label ?? option.code ?? ''),
                                }))
                            : undefined

                        const code = typeof field.code === 'string' ? field.code : ''
                        const label = typeof field.label === 'string' ? field.label : code

                        return {
                            id: typeof field.id === 'string' ? field.id : `${sectionIndex}-${fieldIndex}`,
                            code,
                            type: typeof field.type === 'string' ? (field.type as TemplateField['type']) : 'text',
                            label,
                            required: field.required === true,
                            options,
                        }
                    })
                    .filter(Boolean) as TemplateField[]

                const code = typeof section.code === 'string' ? section.code : ''
                const title =
                    typeof section.title === 'string'
                        ? section.title
                        : code
                            ? code
                            : `Секция ${sectionIndex + 1}`

                return {
                    id: typeof section.id === 'string' ? section.id : `${sectionIndex}`,
                    code,
                    title,
                    repeatable: section.repeatable === true,
                    min: typeof section.min === 'number' ? section.min : undefined,
                    max: typeof section.max === 'number' ? section.max : undefined,
                    fields,
                }
            })
            .filter(Boolean) as TemplateSection[]

    if (Array.isArray(snapshot)) {
        return fromArray(snapshot)
    }

    if (typeof snapshot === 'string') {
        try {
            const parsed = JSON.parse(snapshot)
            return Array.isArray(parsed) ? fromArray(parsed) : []
        } catch {
            return []
        }
    }

    if (isPlainRecord(snapshot)) {
        if (Array.isArray(snapshot.published_schema_json)) {
            return fromArray(snapshot.published_schema_json)
        }
        if (Array.isArray(snapshot.draft_schema_json)) {
            return fromArray(snapshot.draft_schema_json)
        }
    }

    return []
}

export const numberFormatter = new Intl.NumberFormat('ru-RU')
export function formatNumber(value?: number | null) {
    if (value === undefined || value === null || Number.isNaN(value)) return '0'
    return numberFormatter.format(value)
}

export function normalizePercentage(value?: number | null) {
    if (value === undefined || value === null || Number.isNaN(value)) return 0
    const scaled = value <= 1 ? value * 100 : value
    return Math.max(0, Math.min(100, Math.round(scaled)))
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export function coerceField(field: unknown): SnapshotField | null {
    if (!isRecord(field)) return null
    const code = typeof field['code'] === 'string' ? (field['code'] as string) : undefined
    const label = typeof field['label'] === 'string' ? (field['label'] as string) : undefined
    const title = typeof field['title'] === 'string' ? (field['title'] as string) : undefined
    const type = typeof field['type'] === 'string' ? (field['type'] as string) : undefined
    const required = field['required'] === true
    return {
        code,
        label,
        title,
        type,
        required,
    }
}

export function coerceSection(section: unknown): SnapshotSection | null {
    if (!isRecord(section)) return null
    const fieldsRaw = Array.isArray(section['fields']) ? (section['fields'] as unknown[]) : []
    const fields = fieldsRaw.map(coerceField).filter(Boolean) as SnapshotField[]
    return {
        code: typeof section['code'] === 'string' ? (section['code'] as string) : undefined,
        title: typeof section['title'] === 'string' ? (section['title'] as string) : undefined,
        repeatable: section['repeatable'] === true,
        fields,
    }
}

export function extractSections(sections: unknown[]): SnapshotSection[] {
    return sections.map(coerceSection).filter(Boolean) as SnapshotSection[]
}

export function normalizeFormSections(snapshot: SurveyResult['survey']['form_snapshot_json']): SnapshotSection[] {
    if (!snapshot) return []

    if (Array.isArray(snapshot)) {
        return extractSections(snapshot)
    }

    if (typeof snapshot === 'string') {
        try {
            const parsed = JSON.parse(snapshot)
            if (Array.isArray(parsed)) {
                return extractSections(parsed)
            }
        } catch {
            return []
        }
    }

    if (isRecord(snapshot)) {
        const published = snapshot['published_schema_json']
        if (Array.isArray(published) && published.length) {
            return extractSections(published)
        }

        const draft = snapshot['draft_schema_json']
        if (Array.isArray(draft)) {
            return extractSections(draft)
        }
    }

    return []
}

export function truncateToken(token?: string | null) {
    if (!token) return '—'
    if (token.length <= 22) return token
    return `${token.slice(0, 12)}…${token.slice(-6)}`
}

export function readSurveyProp<T = unknown>(survey: SurveyResult['survey'] | undefined, ...keys: string[]): T | undefined {
    if (!survey) return undefined
    const record = survey as unknown as Record<string, unknown>
    for (const key of keys) {
        if (key in record) {
            return record[key] as T
        }
    }
    return undefined
}
