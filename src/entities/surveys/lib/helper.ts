import {TemplateField, TemplateSection} from "@/entities/templates/types";
import {SurveySubmissionAnswer} from "@/entities/public-survey";
import {isPlainRecord} from "@/shared";
import {DraftPayload} from "@/entities/surveys/types";

type SubmissionAnswerValue = Partial<Omit<SurveySubmissionAnswer, 'question_code' | 'section_code' | 'repeat_path'>>

export function mapFieldValue(field: TemplateField, raw: unknown): SubmissionAnswerValue | null {
    if (raw === undefined || raw === null) {
        return null
    }

    const fieldType = field.type as TemplateField['type'] | 'checkbox'

    if (typeof raw === 'string' && raw.trim().length === 0) {
        return null
    }

    switch (fieldType) {
        case 'number': {
            if (typeof raw === 'number' && !Number.isNaN(raw)) {
                return { value_number: raw }
            }
            if (typeof raw === 'string') {
                const numeric = Number(raw)
                if (!Number.isNaN(numeric)) {
                    return { value_number: numeric }
                }
            }
            return null
        }
        case 'date': {
            if (typeof raw === 'string') {
                return { value_date: raw }
            }
            return null
        }
        case 'select_one':
        case 'text': {
            if (typeof raw === 'string') {
                return { value_text: raw }
            }
            if (typeof raw === 'number' || typeof raw === 'boolean') {
                return { value_text: String(raw) }
            }
            break
        }
        case 'select_multiple': {
            if (Array.isArray(raw)) {
                const filtered = raw.filter((item) => {
                    if (item === null || item === undefined) {
                        return false
                    }
                    if (typeof item === 'string') {
                        return item.trim().length > 0
                    }
                    return true
                })
                if (filtered.length === 0) {
                    return null
                }
                return { value_json: filtered }
            }
            if (typeof raw === 'string') {
                return { value_json: [raw] }
            }
            if (isPlainRecord(raw)) {
                const keys = Object.keys(raw)
                if (keys.length === 0) {
                    return null
                }
                return { value_json: raw }
            }
            break
        }
        case 'checkbox': {
            if (typeof raw === 'boolean') {
                return { value_bool: raw }
            }
            if (raw === 0 || raw === 1) {
                return { value_bool: Boolean(raw) }
            }
            return null
        }
        default:
            break
    }

    if (typeof raw === 'boolean') {
        return { value_bool: raw }
    }
    if (typeof raw === 'number') {
        if (Number.isNaN(raw)) {
            return null
        }
        return { value_number: raw }
    }
    if (typeof raw === 'string') {
        return { value_text: raw }
    }
    if (Array.isArray(raw)) {
        if (raw.length === 0) {
            return null
        }
        return { value_json: raw }
    }
    if (isPlainRecord(raw)) {
        const keys = Object.keys(raw)
        if (keys.length === 0) {
            return null
        }
        return { value_json: raw }
    }

    return null
}

export function buildSubmissionAnswers(sections: TemplateSection[], values: Record<string, unknown>): SurveySubmissionAnswer[] {
    const answers: SurveySubmissionAnswer[] = []

    for (const section of sections) {
        const sectionValue = values[section.code]

        if (Array.isArray(sectionValue)) {
            sectionValue.forEach((entry, index) => {
                if (!isPlainRecord(entry)) {
                    return
                }

                section.fields.forEach((field) => {
                    const fieldValue = mapFieldValue(field, entry[field.code])
                    if (!fieldValue) {
                        return
                    }

                    answers.push({
                        question_code: field.code,
                        section_code: section.code,
                        repeat_path: `${section.code}:${index}`,
                        ...fieldValue,
                    })
                })
            })

            continue
        }

        if (!isPlainRecord(sectionValue)) {
            continue
        }

        section.fields.forEach((field) => {
            const fieldValue = mapFieldValue(field, sectionValue[field.code])
            if (!fieldValue) {
                return
            }

            answers.push({
                question_code: field.code,
                section_code: section.code,
                ...fieldValue,
            })
        })
    }

    return answers
}

export function readDraft(key: string): DraftPayload | null {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        const parsed = JSON.parse(raw) as DraftPayload
        if (!parsed || typeof parsed !== 'object' || typeof parsed.values !== 'object') {
            return null
        }
        return {
            updatedAt: Number(parsed.updatedAt) || Date.now(),
            values: parsed.values,
        }
    } catch (error) {
        console.warn('Failed to read survey draft', error)
        return null
    }
}

export function writeDraft(key: string, values: Record<string, unknown>) {
    try {
        const payload: DraftPayload = {
            updatedAt: Date.now(),
            values,
        }
        localStorage.setItem(key, JSON.stringify(payload))
    } catch (error) {
        console.warn('Failed to persist survey draft', error)
    }
}

export function clearDraft(key: string) {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.warn('Failed to clear survey draft', error)
    }
}
