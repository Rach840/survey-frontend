'use client'

import Link from 'next/link'
import {useCallback, useMemo, useState} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileSpreadsheet, Loader2} from 'lucide-react'

import {useSurveyResults} from '@/entities/surveys/model/surveyResultsQuery'
import type {SurveyResultsAnswer, SurveyResultsItem, SurveyResultsStatistics,} from '@/entities/surveys/types'
import type {TemplateField, TemplateSection} from '@/entities/templates/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from '@/widgets/FetchError/ErrorFetch'
import {toast} from 'sonner'
import {loadXlsx} from '@/shared/lib/loadXlsx'

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  try {
    return dateTimeFormatter.format(new Date(value))
  } catch {
    return value
  }
}

const numberFormatter = new Intl.NumberFormat('ru-RU')

function formatNumber(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return '0'
  return numberFormatter.format(value)
}

function normalizePercentage(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return 0
  const scaled = value <= 1 ? value * 100 : value
  return Math.max(0, Math.min(100, Math.round(scaled)))
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

type FieldMeta = {
  sectionTitle: string
  fieldLabel: string
}

type FieldLookup = {
  resolve: (sectionCode: string | null | undefined, questionCode: string) => FieldMeta
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

function formatAverageDuration(stats: SurveyResultsStatistics): string | null {
  if (stats.average_completion_duration && stats.average_completion_duration.trim()) {
    return stats.average_completion_duration
  }

  const seconds = stats.average_completion_seconds
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return null
  }

  if (seconds < 60) {
    return `${seconds.toFixed(seconds < 10 ? 2 : 1)} с`
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    return `${minutes.toFixed(minutes < 10 ? 1 : 0)} мин`
  }

  const hours = minutes / 60
  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)} ч`
  }

  const days = hours / 24
  return `${days.toFixed(days < 10 ? 1 : 0)} д`
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

type MetricCard = {
  label: string
  value: string
  percentage?: number
}

function mapMetrics(stats: SurveyResultsStatistics | undefined): MetricCard[] {
  if (!stats) return []
  const completion = normalizePercentage(stats.completion_rate)
  const overall = normalizePercentage(stats.overall_progress)
  return [
    { label: 'Всего приглашений', value: formatNumber(stats.total_enrollments) },
    { label: 'Начали заполнение', value: formatNumber(stats.responses_started) },
    { label: 'В процессе', value: formatNumber(stats.responses_in_progress) },
    { label: 'Завершили', value: formatNumber(stats.responses_submitted) },
    { label: 'Конверсия', value: `${completion}%`, percentage: completion },
    { label: 'Общий прогресс', value: `${overall}%`, percentage: overall },
  ]
}

function getSubmittedResults(results: SurveyResultsItem[] | undefined) {
  if (!results) return []
  return results.filter((item) => item.response?.state === 'submitted')
}

export default function SurveyResultsPage({surveyId}: { surveyId: string }) {
  const {data, isLoading, isError, refetch} = useSurveyResults(surveyId)
  const survey = data?.survey
  const stats = data?.statistics
  const [isExporting, setIsExporting] = useState(false)
  const allResults = useMemo(() => data?.results ?? [], [data?.results])
  const submittedResults = useMemo(() => getSubmittedResults(allResults), [allResults])
  const metrics = useMemo(() => mapMetrics(stats), [stats])
  const formSections = useMemo(() => coerceTemplateSections(survey?.form_snapshot_json), [survey?.form_snapshot_json])
  const fieldLookup = useMemo(() => createFieldLookup(formSections), [formSections])
  const handleExport = useCallback(async () => {
    const exportResults = getSubmittedResults(allResults)

    if (!exportResults.length) {
      toast.info('Нет завершённых ответов для экспорта')
      return
    }

    setIsExporting(true)

    try {
      const XLSX = await loadXlsx()

      const responsesSheet = XLSX.utils.json_to_sheet(
        exportResults.map((item, index) => ({
          '#': index + 1,
          'ID участника': item.enrollment.id,
          ФИО: item.enrollment.full_name ?? '',
          Email: item.enrollment.email ?? '',
          Канал: item.response.channel ?? '',
          'Статус ответа': item.response.state,
          'Начато заполнение': formatDateTime(item.response.started_at),
          'Отправлено': formatDateTime(item.response.submitted_at),
        })),
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, responsesSheet, 'Responses')

      const answersRows = exportResults.flatMap((item) =>
        item.answers.map((answer) => {
          const meta = fieldLookup.resolve(answer.section_code, answer.question_code)

          return {
            'ID участника': item.enrollment.id,
            ФИО: item.enrollment.full_name ?? '',
            Email: item.enrollment.email ?? '',
            Секция: meta.sectionTitle,
            Вопрос: meta.fieldLabel,
            'Код вопроса': answer.question_code,
            Повтор: answer.repeat_path ?? '',
            Ответ: formatAnswerValue(answer),
          }
        }),
      )

      if (answersRows.length) {
        const answersSheet = XLSX.utils.json_to_sheet(answersRows)
        XLSX.utils.book_append_sheet(workbook, answersSheet, 'Answers')
      }

      XLSX.writeFile(workbook, `survey-${surveyId}-results.xlsx`)
      toast.success('Файл сформирован')
    } catch (error) {
      console.error('survey results export error', error)
      toast.error('Не удалось сформировать файл')
    } finally {
      setIsExporting(false)
    }
  }, [allResults, fieldLookup, surveyId])
  const averageDuration = stats ? formatAverageDuration(stats) : null

  if (isLoading) {
    return (
      <div className='min-h-screen  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
        <motion.div
          className='space-y-6'
          initial='hidden'
          animate='show'
          variants={fadeUpVariants}
          transition={fadeTransition}
        >
          <Skeleton className='h-24 w-full rounded-2xl' />
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <Skeleton className='h-24 rounded-2xl' />
            <Skeleton className='h-24 rounded-2xl' />
            <Skeleton className='h-24 rounded-2xl' />
            <Skeleton className='h-24 rounded-2xl' />
            <Skeleton className='h-24 rounded-2xl' />
            <Skeleton className='h-24 rounded-2xl' />
          </div>
          <Skeleton className='h-64 w-full rounded-2xl' />
        </motion.div>
      </div>
    )
  }

  if (isError || !survey || !stats) {
    return <ErrorFetch refetch={refetch}/>
  }

  return (
    <div className='min-h-screen space-y-8  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
      <motion.div
        className='flex items-center justify-between'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <Link href='/admin/survey' className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к анкетам
          </span>
        </Link>
        <Button className='gap-2' onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <FileSpreadsheet className='h-4 w-4' />
          )}
          {isExporting ? 'Формирование...' : 'Экспортировать в Excel'}
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
            <CardTitle className='text-2xl font-semibold text-gray-900'>{survey.title}</CardTitle>
            <CardDescription className='text-gray-600'>
              Создана {formatDateTime(survey.created_at)} · Всего приглашений {formatNumber(stats.total_enrollments)}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 py-6'>
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className='rounded-xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm'
                >
                  <div className='text-xs uppercase tracking-wide text-gray-500'>{metric.label}</div>
                  <div className='mt-2 text-2xl font-semibold text-gray-900'>{metric.value}</div>
                  {typeof metric.percentage === 'number' ? (
                    <div className='mt-3 h-2 rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]'
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {averageDuration ? (
              <div className='rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700'>
                Среднее время заполнения: <span className='font-medium'>{averageDuration}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.1 }}
      >
        <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
          <CardHeader className='border-b pb-6'>
            <CardTitle className='text-lg font-semibold text-gray-900'>Результаты участников</CardTitle>
            <CardDescription className='text-gray-600'>
              Список участников, которые завершили прохождение анкеты. Откройте ответы, чтобы посмотреть детали.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            {submittedResults.length === 0 ? (
              <div className='p-6 text-sm text-gray-500'>Здесь появятся участники, завершившие анкету.</div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200 text-left'>
                  <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    <tr>
                      <th className='px-4 py-3'>Участник</th>
                      <th className='px-4 py-3'>Email</th>
                      <th className='px-4 py-3'>Канал</th>
                      <th className='px-4 py-3'>Отправлено</th>
                      <th className='px-4 py-3 text-right'>Ответы</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {submittedResults.map((item) => (
                      <tr key={item.enrollment.id} className='text-sm text-gray-700'>
                        <td className='px-4 py-3'>
                          <div className='font-medium text-gray-900'>{item.enrollment.full_name || '—'}</div>
                          <div className='text-xs text-gray-500'>ID: {item.enrollment.id}</div>
                        </td>
                        <td className='px-4 py-3'>{item.enrollment.email || '—'}</td>
                        <td className='px-4 py-3 capitalize'>{item.response.channel ?? '—'}</td>
                        <td className='px-4 py-3'>{formatDateTime(item.response.submitted_at)}</td>
                        <td className='px-4 py-3 text-right'>
                          <Button asChild size='sm' variant='outline'>
                            <Link href={`/admin/survey/${surveyId}/results/${item.enrollment.id}`}>Просмотреть</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
