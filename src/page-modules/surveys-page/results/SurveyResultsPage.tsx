'use client'

import Link from 'next/link'
import {useMemo} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileSpreadsheet} from 'lucide-react'

import {useSurveyResults} from '@/entities/surveys/model/surveyResultsQuery'
import type {SurveyResultsItem, SurveyResultsStatistics} from '@/entities/surveys/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from '@/widgets/FetchError/ErrorFetch'

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
  const submittedResults = useMemo(() => getSubmittedResults(data?.results), [data?.results])
  const metrics = useMemo(() => mapMetrics(stats), [stats])

  const exportHref = `/api/survey/${surveyId}/export?format=excel`
  const averageDuration = stats ? formatAverageDuration(stats) : null

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
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
    <div className='min-h-screen space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
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
        <Button asChild className='gap-2'>
          <a href={exportHref} download>
            <FileSpreadsheet className='h-4 w-4' />
            Экспортировать в Excel
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
