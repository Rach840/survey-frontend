'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowLeft, FileSpreadsheet, RefreshCcw } from 'lucide-react'

import { useSurveyDetail } from '@/entities/surveys/model/surveyDetailQuery'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const enrollmentLabels: Record<string, string> = {
  invited: 'Приглашён',
  pending: 'Ожидает',
  approved: 'Одобрен',
  active: 'Активен',
  rejected: 'Отклонён',
  removed: 'Удалён',
  expired: 'Истёк',
}

const responseLabels: Record<string, string> = {
  in_progress: 'В процессе',
  submitted: 'Завершено',
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  try {
    return dateTimeFormatter.format(new Date(value))
  } catch {
    return value
  }
}

export function SurveyResultsPage({ surveyId }: { surveyId: string }) {
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)

  const stats = data?.stats
  const participants = data?.participants ?? []

  const completionRate = useMemo(() => {
    if (!stats || !stats.invited) return 0
    return Math.round((stats.submitted / stats.invited) * 100)
  }, [stats])

  const exportHref = `/api/survey/${surveyId}/export?format=excel`

  if (isLoading) {
    return (
      <div className='space-y-6 p-8'>
        <Skeleton className='h-24 w-full' />
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
        </div>
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (isError || !data || !stats) {
    return (
      <div className='p-8'>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='space-y-3 p-6'>
            <CardTitle className='text-lg text-red-700'>Не удалось загрузить результаты</CardTitle>
            <CardDescription className='text-red-600'>Попробуйте обновить страницу или повторите попытку позже.</CardDescription>
            <div className='flex gap-3'>
              <Button onClick={() => refetch()} variant='outline' className='gap-2'>
                <RefreshCcw className='h-4 w-4' />
                Повторить запрос
              </Button>
              <Link href='/admin/survey'>
                <Button variant='ghost' className='gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  К списку анкет
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-8 p-8'>
      <div className='flex items-center justify-between'>
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
      </div>

      <Card>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-2xl font-semibold text-gray-900'>{data.title}</CardTitle>
          <CardDescription className='text-gray-600'>Сводная статистика по результатам анкетирования.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-4'>
          <div>
            <div className='text-sm text-gray-500'>Приглашено</div>
            <div className='text-3xl font-semibold text-gray-900'>{stats.invited}</div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Активно</div>
            <div className='text-3xl font-semibold text-gray-900'>{stats.inProgress}</div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Завершили</div>
            <div className='text-3xl font-semibold text-gray-900'>{stats.submitted}</div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Конверсия</div>
            <div className='text-3xl font-semibold text-gray-900'>{completionRate}%</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-lg font-semibold text-gray-900'>Результаты участников</CardTitle>
          <CardDescription className='text-gray-600'>Соберите обратную связь или откройте карточку участника для экспорта в PDF.</CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          {participants.length === 0 ? (
            <div className='p-6 text-sm text-gray-500'>Пока нет участников для отображения.</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 text-left'>
                <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <tr>
                    <th className='px-4 py-3'>Участник</th>
                    <th className='px-4 py-3'>Контакты</th>
                    <th className='px-4 py-3'>Статус</th>
                    <th className='px-4 py-3'>Прогресс</th>
                    <th className='px-4 py-3'>Изменено</th>
                    <th className='px-4 py-3 text-right'>Действия</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {participants.map((participant) => (
                    <tr key={participant.id} className='text-sm text-gray-700'>
                      <td className='px-4 py-3'>
                        <div className='font-medium text-gray-900'>{participant.fullName}</div>
                        <div className='text-xs text-gray-500'>Источник: {participant.source === 'bot' ? 'бот' : 'админ'}</div>
                      </td>
                      <td className='px-4 py-3'>{participant.email ?? '—'}</td>
                      <td className='px-4 py-3 text-sm'>
                        <div>{enrollmentLabels[participant.state] ?? participant.state}</div>
                        <div className='text-xs text-gray-500'>
                          {participant.responseState ? responseLabels[participant.responseState] ?? participant.responseState : '—'}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-2 rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]'
                            style={{ width: `${participant.progress}%` }}
                          />
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div>{formatDateTime(participant.lastActivity)}</div>
                        <div className='text-xs text-gray-500'>Завершено: {formatDateTime(participant.submittedAt)}</div>
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Link href={`/admin/survey/${surveyId}/participants/${participant.id}`} className='text-sm font-medium text-[#2563eb] hover:underline'>
                          Открыть карточку
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
