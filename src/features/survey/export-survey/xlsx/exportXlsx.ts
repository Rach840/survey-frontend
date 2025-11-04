import {Survey, SurveyResultsAnswer, SurveyResultsItem} from "@/entities/surveys/types";
import {enrollmentLabels, formatDateTime, helper, loadXlsx, responseLabels} from "@/shared";
import {useCallback, useMemo} from "react";
import {toast} from "sonner";
import {TemplateSection} from "@/entities/templates/types";

export function useResultExcelExport(survey: Survey,allResults: SurveyResultsItem[], setIsExporting: (v:boolean)=> void) {
    const formSections = useMemo(() => helper(survey?.form_snapshot_json), [survey?.form_snapshot_json])
    const fieldLookup = useMemo(() => createFieldLookup(formSections), [formSections])
    const fieldColumns = useMemo(
        () => buildFieldColumns(formSections, allResults, fieldLookup),
        [formSections, allResults, fieldLookup],
    )
    return useCallback(async () => {
        const exportResults = allResults

        if (!exportResults.length) {
            toast.info('Нет данных для экспорта')
            return
        }

        setIsExporting(true)

        try {
            const XLSX = await loadXlsx()

            const rows = exportResults.map((item, index) => {
                const answersIndex = buildAnswerIndex(item.answers)
                const baseRow: Record<string, string | number> = {
                    '#': index + 1,
                    'ID участника': item.enrollment.id,
                    'ФИО': item.enrollment.full_name ?? '',
                    "Email": item.enrollment.email ?? '',
                    'Статус участия': enrollmentLabels[item.enrollment.state] ?? item.enrollment.state,
                    'Статус ответа': responseLabels[item.response.state] ?? item.response.state,
                    "Канал": item.response.channel ?? '',
                    'Начато заполнение': formatDateTime(item.response.started_at),
                    "Отправлено": formatDateTime(item.response.submitted_at),
                }

                fieldColumns.forEach((column) => {
                    const value = column.keys
                        .map((key) => answersIndex.get(key))
                        .find((entry) => entry !== undefined && entry !== null && entry !== '')
                    baseRow[column.header] = value ?? ''
                })

                return baseRow
            })

            const sheet = XLSX.utils.json_to_sheet(rows)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, sheet, 'результаты')

            XLSX.writeFile(workbook, `анкета-${survey.id}-результаты.xlsx`)
            toast.success('Файл сформирован')
        } catch (error) {
            console.error('ошибка экспорта', error)
            toast.error('Не удалось сформировать файл')
        } finally {
            setIsExporting(false)
        }
    }, [allResults, fieldColumns, survey?.id])


}

type FieldLookup = {
    resolve: (sectionCode: string | null | undefined, questionCode: string) => FieldMeta
}

type FieldColumn = {
    header: string
    keys: string[]
}
type FieldMeta = {
    sectionTitle: string
    fieldLabel: string
}
function createFieldLookup(sections: TemplateSection[]): FieldLookup {
    const exactMap = new Map<string, FieldMeta>()
    const fallbackMap = new Map<string, FieldMeta>()

    sections.forEach((section) => {
        const sectionCode = section.code || ''
        const sectionTitle = section.title || sectionCode || 'Без секции'

        section.fields.forEach((field) => {
            const meta: FieldMeta = {
                sectionTitle,
                fieldLabel: field.label || field.code,
            }

            exactMap.set(`${sectionCode}::${field.code}`, meta)
            if (!fallbackMap.has(field.code)) {
                fallbackMap.set(field.code, meta)
            }
        })
    })

    return {
        resolve(sectionCode, questionCode) {
            const normalizedSection = sectionCode ?? ''
            const direct = exactMap.get(`${normalizedSection}::${questionCode}`)
            if (direct) return direct

            const fallback = fallbackMap.get(questionCode)
            if (fallback) return fallback

            return {
                sectionTitle: normalizedSection || 'Без секции',
                fieldLabel: questionCode,
            }
        },
    }
}

function ensureUniqueHeader(
    baseLabel: string,
    sectionTitle: string,
    usedHeaders: Set<string>,
    fallbackIndex: number,
): string {
    const label = baseLabel.trim().length > 0 ? baseLabel.trim() : `Поле ${fallbackIndex}`
    if (!usedHeaders.has(label)) {
        usedHeaders.add(label)
        return label
    }

    const withSection = sectionTitle.trim().length > 0 ? `${label} (${sectionTitle.trim()})` : label
    if (!usedHeaders.has(withSection)) {
        usedHeaders.add(withSection)
        return withSection
    }

    let suffix = 2
    let candidate = `${withSection} #${suffix}`
    while (usedHeaders.has(candidate)) {
        suffix += 1
        candidate = `${withSection} #${suffix}`
    }
    usedHeaders.add(candidate)
    return candidate
}

function buildFieldColumns(
    sections: TemplateSection[],
    results: SurveyResultsItem[],
    fieldLookup: FieldLookup,
): FieldColumn[] {
    const columns: FieldColumn[] = []
    const usedHeaders = new Set<string>()
    const knownKeys = new Set<string>()

    const registerColumn = (meta: FieldMeta, rawKeys: string[]) => {
        const keys = Array.from(new Set(rawKeys.filter(Boolean)))
        if (keys.length === 0) return
        const hasNewKey = keys.some((key) => !knownKeys.has(key))
        if (!hasNewKey) return

        const header = ensureUniqueHeader(meta.fieldLabel || '', meta.sectionTitle || '', usedHeaders, columns.length + 1)

        columns.push({ header, keys })
        keys.forEach((key) => knownKeys.add(key))
    }

    sections.forEach((section, sectionIndex) => {
        const sectionCode = section.code ?? ''
        const sectionTitle = section.title || sectionCode || `Секция ${sectionIndex + 1}`

        section.fields.forEach((field, fieldIndex) => {
            const questionCode = field.code || `field_${sectionIndex}_${fieldIndex}`
            const meta: FieldMeta = {
                sectionTitle,
                fieldLabel: field.label || questionCode || `Поле ${columns.length + 1}`,
            }

            registerColumn(meta, [
                `${sectionCode}::${questionCode}`,
                field.code ? `::${field.code}` : '',
                field.code ?? '',
            ])
        })
    })

    results.forEach((item) => {
        item.answers.forEach((answer) => {
            const meta = fieldLookup.resolve(answer.section_code ?? undefined, answer.question_code)
            registerColumn(meta, [
                `${answer.section_code ?? ''}::${answer.question_code}`,
                `::${answer.question_code}`,
                answer.question_code,
            ])
        })
    })

    return columns
}


function buildAnswerIndex(answers: SurveyResultsAnswer[]): Map<string, string> {
    const buckets = new Map<string, Set<string>>()

    answers.forEach((answer) => {
        if (!answer.question_code) return
        const value = formatAnswerValue(answer)
        const normalized = value === '—' ? '' : value
        if (!normalized) return

        const keys = [
            `${answer.section_code ?? ''}::${answer.question_code}`,
            `::${answer.question_code}`,
            answer.question_code,
        ]

        keys.forEach((key) => {
            if (!key) return
            if (!buckets.has(key)) {
                buckets.set(key, new Set<string>())
            }
            buckets.get(key)!.add(normalized)
        })
    })

    const index = new Map<string, string>()
    buckets.forEach((values, key) => {
        index.set(key, Array.from(values).join('\n'))
    })

    return index
}

function formatAnswerValue(answer: SurveyResultsAnswer): string {
    if (typeof answer.value_text === 'string' && answer.value_text.trim().length > 0) {
        return answer.value_text.trim()
    }

    if (answer.value_number !== undefined && answer.value_number !== null && !Number.isNaN(answer.value_number)) {
        return String(answer.value_number)
    }

    if (answer.value_bool !== undefined && answer.value_bool !== null) {
        return answer.value_bool ? 'Да' : 'Нет'
    }

    if (typeof answer.value_datetime === 'string' && answer.value_datetime.trim().length) {
        return formatDateTime(answer.value_datetime)
    }

    if (typeof answer.value_date === 'string' && answer.value_date.trim().length) {
        return answer.value_date
    }

    if (answer.value_json !== undefined && answer.value_json !== null) {
        if (Array.isArray(answer.value_json)) {
            if (answer.value_json.length === 0) {
                return '—'
            }
            return answer.value_json
                .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
                .join(', ')
        }

        if (typeof answer.value_json === 'object') {
            try {
                return JSON.stringify(answer.value_json)
            } catch {
                return String(answer.value_json)
            }
        }

        return String(answer.value_json)
    }

    return '—'
}

