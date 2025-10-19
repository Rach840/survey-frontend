'use client'

import Link from 'next/link'
import {useMemo} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileSpreadsheet} from 'lucide-react'
import type {SurveyInvitationSummary} from '@/entities/surveys/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import {useSurveyResults} from "@/entities/surveys/model/surveyResultsQuery";
import ErrorFetch from "@/widgets/FetchError/ErrorFetch";

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

function truncateToken(token?: string | null) {
  if (!token) return '—'
  if (token.length <= 16) return token
  return `${token.slice(0, 10)}…${token.slice(-4)}`
}

type MetricCard = {
  label: string
  value: string
  percentage?: number
}

export default function SurveyResultsPage({surveyId}: { surveyId: string }) {
  const {data, isLoading, isError, refetch} = useSurveyResults(surveyId)
  console.log('Педик',data)
  const survey = data?.survey
  const stats = data?.statistics
  const invitations = useMemo<SurveyInvitationSummary[]>(
    () => data?.invitations ?? [],
    [data?.invitations],
  )

  const metrics = useMemo<MetricCard[]>(() => {
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
  }, [stats])

  const exportHref = `/api/survey/${surveyId}/export?format=excel`

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
            <CardTitle className='text-lg font-semibold text-gray-900'>Приглашённые участники</CardTitle>
            <CardDescription className='text-gray-600'>Отслеживайте, кому отправлены приглашения и когда они истекают.</CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            {invitations.length === 0 ? (
              <div className='p-6 text-sm text-gray-500'>Пока нет приглашений для отображения.</div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200 text-left'>
                  <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    <tr>
                      <th className='px-4 py-3'>Участник</th>
                      <th className='px-4 py-3'>Email</th>
                      <th className='px-4 py-3'>Срок действия</th>
                      <th className='px-4 py-3'>Токен</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {invitations.map((invitation) => (
                      <tr key={invitation.enrollment_id} className='text-sm text-gray-700'>
                        <td className='px-4 py-3'>
                          <div className='font-medium text-gray-900'>{invitation.full_name || '—'}</div>
                          <div className='text-xs text-gray-500'>ID: {invitation.enrollment_id}</div>
                        </td>
                        <td className='px-4 py-3'>{invitation.email || '—'}</td>
                        <td className='px-4 py-3'>{formatDateTime(invitation.expires_at)}</td>
                        <td className='px-4 py-3 font-mono text-xs text-gray-600' title={invitation.token}>
                          {truncateToken(invitation.token)}
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
