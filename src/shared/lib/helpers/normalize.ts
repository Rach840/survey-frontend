import {numberFormatter} from "@/shared";
import {SurveyResultsAnswer} from "@/entities/surveys/types";
import {TemplateSection} from "@/entities/templates/types";
import {formatDateOnly, formatDateTime} from "@/shared/lib";


export function isPlainRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type FieldDisplay = {
    label: string
    value: string
    isJson?: boolean
}

type NormalizedAnswerValue = {
    value: string
    isJson?: boolean
}

type SectionDisplay = {
    code: string
    title: string
    repeatable: boolean
    items: { key: string; heading?: string; fields: FieldDisplay[] }[]
}

export function extractRepeatHeading(repeatPath: string, index: number) {
    if (!repeatPath) {
        return `Запись ${index + 1}`
    }
    const match = repeatPath.match(/:(\d+)$/)
    if (match) {
        return `Запись ${Number(match[1]) + 1}`
    }
    const numeric = Number(repeatPath)
    if (!Number.isNaN(numeric)) {
        return `Запись ${numeric + 1}`
    }
    return `Запись ${index + 1}`
}

export function normalizeAnswerValue(answer: SurveyResultsAnswer): NormalizedAnswerValue {
    if (typeof answer.value_text === 'string' && answer.value_text.trim().length > 0) {
        return { value: answer.value_text.trim() }
    }

    if (answer.value_number !== undefined && answer.value_number !== null && !Number.isNaN(answer.value_number)) {
        return { value: numberFormatter.format(answer.value_number) }
    }

    if (answer.value_bool !== undefined && answer.value_bool !== null) {
        return { value: answer.value_bool ? 'Да' : 'Нет' }
    }

    if (typeof answer.value_datetime === 'string' && answer.value_datetime.trim().length) {
        return { value: formatDateTime(answer.value_datetime) }
    }

    if (typeof answer.value_date === 'string' && answer.value_date.trim().length) {
        return { value: formatDateOnly(answer.value_date) }
    }

    if (answer.value_json !== undefined && answer.value_json !== null) {
        if (Array.isArray(answer.value_json)) {
            if (answer.value_json.length === 0) {
                return { value: '—' }
            }
            const list = answer.value_json.map((item) => (typeof item === 'string' ? item : String(item)))
            return { value: list.join(', ') }
        }
        if (isPlainRecord(answer.value_json)) {
            return { value: JSON.stringify(answer.value_json, null, 2), isJson: true }
        }
        return { value: String(answer.value_json) }
    }

    return { value: '—' }
}

export function buildSectionDisplays(sections: TemplateSection[], answers: SurveyResultsAnswer[]): SectionDisplay[] {
    if (!answers.length) return []

    const sectionOrder = new Map<string, number>()
    const sectionMap = new Map<string, TemplateSection>()

    sections.forEach((section, index) => {
        if (!section.code) return
        sectionOrder.set(section.code, index)
        sectionMap.set(section.code, section)
    })

    const grouped = new Map<string, { repeatable: boolean; title: string; order: string[]; byRepeat: Map<string, FieldDisplay[]> }>()

    answers.forEach((answer) => {
        const sectionCode = answer.section_code || ''
        const section = sectionMap.get(sectionCode)
        const repeatKey = answer.repeat_path && answer.repeat_path.length > 0 ? answer.repeat_path : 'default'

        const normalized = normalizeAnswerValue(answer)
        const fieldDef = section?.fields.find((field) => field.code === answer.question_code)
        const label = fieldDef?.label || answer.question_code

        if (!grouped.has(sectionCode)) {
            grouped.set(sectionCode, {
                repeatable: Boolean(section?.repeatable),
                title: section?.title || sectionCode || 'Без названия',
                order: [],
                byRepeat: new Map(),
            })
        }

        const bucket = grouped.get(sectionCode)!
        if (!bucket.byRepeat.has(repeatKey)) {
            bucket.byRepeat.set(repeatKey, [])
            bucket.order.push(repeatKey)
        }

        bucket.byRepeat.get(repeatKey)!.push({
            label,
            value: normalized.value,
            isJson: normalized.isJson,
        })
    })

    const displays: SectionDisplay[] = []

    grouped.forEach((bucket, code) => {
        const repeatable = bucket.repeatable || bucket.order.length > 1
        const items = bucket.order.map((key, index) => {
            const heading = repeatable ? extractRepeatHeading(key === 'default' ? '' : key, index) : undefined
            return {
                key,
                heading,
                fields: bucket.byRepeat.get(key) ?? [],
            }
        })

        displays.push({
            code,
            title: bucket.title,
            repeatable,
            items,
        })
    })

    displays.sort((a, b) => {
        const orderA = sectionOrder.get(a.code) ?? Number.MAX_SAFE_INTEGER
        const orderB = sectionOrder.get(b.code) ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
    })

    return displays
}
