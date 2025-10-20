'use client'

import Link from 'next/link'
import {useMemo} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileText} from 'lucide-react'

import {useSurveyResult} from '@/entities/surveys/model/surveyResultQuery'
import type {EnrollmentState, ResponseState, SurveyResultsAnswer} from '@/entities/surveys/types'
import type {TemplateField, TemplateSection} from '@/entities/templates/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from '@/widgets/FetchError/ErrorFetch'

const enrollmentLabels: Partial<Record<EnrollmentState, string>> = {
  invited: 'Приглашён',
  pending: 'Ожидает',
  approved: 'Одобрен',
  active: 'Активен',
  rejected: 'Отклонён',
  removed: 'Удалён',
  expired: 'Истёк',
}

const responseLabels: Partial<Record<ResponseState, string>> = {
  in_progress: 'В процессе',
  submitted: 'Завершено',
}

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' })
const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  try {
    return dateTimeFormatter.format(new Date(value))
  } catch {
    return value
  }
}

function formatDateOnly(value?: string | null) {
  if (!value) return '—'
  try {
    const parsed = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`)
    return dateFormatter.format(parsed)
  } catch {
    return value
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function coerceTemplateSections(snapshot: unknown): TemplateSection[] {
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

function extractRepeatHeading(repeatPath: string, index: number) {
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

function normalizeAnswerValue(answer: SurveyResultsAnswer): NormalizedAnswerValue {
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

function buildSectionDisplays(sections: TemplateSection[], answers: SurveyResultsAnswer[]): SectionDisplay[] {
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

export default function SurveyResultDetailPage({
  surveyId,
  enrollmentId,
}: {
  surveyId: string
  enrollmentId: string
}) {
  const { data, isLoading, isError, refetch } = useSurveyResult(surveyId, enrollmentId)

  const survey = data?.survey
  const enrollment = data?.enrollment
  const response = data?.response
  const answers = useMemo(() => data?.answers ?? [], [data?.answers])

  const formSections = useMemo(() => coerceTemplateSections(survey?.form_snapshot_json), [survey?.form_snapshot_json])

  const sectionDisplays = useMemo(() => buildSectionDisplays(formSections, answers), [formSections, answers])

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
        <motion.div
          className='space-y-4'
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={fadeTransition}
        >
          <Skeleton className='h-20 w-full rounded-2xl' />
          <Skeleton className='h-32 w-full rounded-2xl' />
          <Skeleton className='h-64 w-full rounded-2xl' />
        </motion.div>
      </div>
    )
  }

  if (isError) {
    return <ErrorFetch refetch={refetch} />
  }

  if (!survey || !enrollment || !response) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
        <motion.div
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={fadeTransition}
        >
          <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
            <CardContent className='space-y-3 p-6'>
              <CardTitle className='text-lg text-gray-900'>Ответ не найден</CardTitle>
              <CardDescription className='text-gray-600'>Проверьте ссылку или вернитесь к списку результатов.</CardDescription>
              <Link href={`/admin/survey/${surveyId}/results`}>
                <Button variant='outline' className='gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  Вернуться назад
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const exportHref = `/api/survey/${surveyId}/participants/${enrollment.id}/export?format=pdf`

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
      <motion.div
        className='flex flex-wrap items-center justify-between gap-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <Link href={`/admin/survey/${surveyId}/results`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к результатам
          </span>
        </Link>
        <Button asChild className='gap-2 shadow-sm transition-transform hover:-translate-y-0.5'>
          <a href={exportHref} download>
            <FileText className='h-4 w-4' />
            Экспортировать в PDF
          </a>
        </Button>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.05 }}
      >
        <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
          <CardHeader className='border-b pb-6'>
            <CardTitle className='text-2xl font-semibold text-gray-900'>{enrollment.full_name || 'Без имени'}</CardTitle>
            <CardDescription className='text-gray-600'>Ответ участника на анкету «{survey.title}».</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 py-6 md:grid-cols-2'>
            <div className='space-y-2 text-sm text-gray-600'>
              <div className='text-xs uppercase tracking-wide text-gray-500'>Email</div>
              <div className='text-base font-medium text-gray-900'>{enrollment.email ?? '—'}</div>
            </div>
            <div className='space-y-2 text-sm text-gray-600'>
              <div className='text-xs uppercase tracking-wide text-gray-500'>Статус участия</div>
              <div className='text-base font-medium text-gray-900'>
                {enrollmentLabels[enrollment.state] ?? enrollment.state}
              </div>
              <div className='text-xs text-gray-500'>
                {response.state ? responseLabels[response.state] ?? response.state : '—'}
              </div>
            </div>
            <div className='space-y-2 text-sm text-gray-600'>
              <div className='text-xs uppercase tracking-wide text-gray-500'>Канал</div>
              <div className='text-base font-medium text-gray-900'>{response.channel ?? '—'}</div>
            </div>
            <div className='space-y-2 text-sm text-gray-600'>
              <div className='text-xs uppercase tracking-wide text-gray-500'>Время прохождения</div>
              <div>Начал: {formatDateTime(response.started_at)}</div>
              <div>Отправил: {formatDateTime(response.submitted_at)}</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className='space-y-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.1 }}
      >
        {sectionDisplays.length === 0 ? (
          <Card className='border-none bg-white/85 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
            <CardContent className='p-6 text-sm text-gray-600'>Ответы не найдены.</CardContent>
          </Card>
        ) : (
          sectionDisplays.map((section) => (
            <Card key={section.code || section.title} className='border-none bg-white/85 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
              <CardHeader className='border-b pb-4'>
                <CardTitle className='text-lg font-semibold text-gray-900'>{section.title}</CardTitle>
                <CardDescription className='text-gray-500'>Ответы участника</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 py-4'>
                {section.items.map((item, index) => (
                  <div key={item.key || index} className='space-y-3'>
                    {item.heading ? (
                      <div className='text-sm font-semibold text-gray-700'>{item.heading}</div>
                    ) : null}
                    {item.fields.map((field, fieldIndex) => (
                      <div key={`${field.label}-${fieldIndex}`} className='grid gap-1 text-sm text-gray-600 md:grid-cols-[240px_1fr]'>
                        <div className='font-medium text-gray-900'>{field.label}</div>
                        {field.isJson ? (
                          <pre className='rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-gray-700'>
                            {field.value}
                          </pre>
                        ) : (
                          <div className='rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-gray-700'>
                            {field.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  )
}
