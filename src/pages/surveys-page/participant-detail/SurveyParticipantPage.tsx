'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowLeft, FileText, RefreshCcw } from 'lucide-react'

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

type AnswerSection = {
  title: string
  fields: { label: string; value: string }[]
}

const mockAnswerMap: Record<string, AnswerSection[]> = {
  default: [
    {
      title: 'Персональные данные',
      fields: [
        { label: 'Фамилия', value: 'Иванов' },
        { label: 'Имя', value: 'Иван' },
        { label: 'Отчество', value: 'Иванович' },
      ],
    },
    {
      title: 'Контакты',
      fields: [
        { label: 'Email', value: 'ivanov@example.com' },
        { label: 'Телефон', value: '+7 (900) 000-00-00' },
      ],
    },
    {
      title: 'Дополнительная информация',
      fields: [
        { label: 'Опыт', value: '5 лет' },
        { label: 'Комментарии', value: 'Готов к дополнительным задачам.' },
      ],
    },
  ],
}

function getAnswerSections(participantId: string): AnswerSection[] {
  return mockAnswerMap[participantId] ?? mockAnswerMap.default
}

export function SurveyParticipantPage({
  surveyId,
  participantId,
}: {
  surveyId: string
  participantId: string
}) {
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)

  const participant = useMemo(
    () => data?.participants.find((item) => String(item.id) === participantId),
    [data?.participants, participantId],
  )

  const answers = useMemo(() => getAnswerSections(participantId), [participantId])

  if (isLoading) {
    return (
      <div className='space-y-4 p-8'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className='p-8'>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='space-y-3 p-6'>
            <CardTitle className='text-lg text-red-700'>Не удалось загрузить данные участника</CardTitle>
            <CardDescription className='text-red-600'>Попробуйте обновить страницу или повторите попытку позже.</CardDescription>
            <div className='flex gap-3'>
              <Button onClick={() => refetch()} variant='outline' className='gap-2'>
                <RefreshCcw className='h-4 w-4' />
                Повторить запрос
              </Button>
              <Link href={`/admin/survey/${surveyId}/participants`}>
                <Button variant='ghost' className='gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  Назад к списку участников
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className='p-8'>
        <Card>
          <CardContent className='space-y-3 p-6'>
            <CardTitle className='text-lg text-gray-900'>Участник не найден</CardTitle>
            <CardDescription className='text-gray-600'>Проверьте ссылку или вернитесь к списку участников.</CardDescription>
            <Link href={`/admin/survey/${surveyId}/participants`}>
              <Button variant='outline' className='gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Вернуться назад
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const exportHref = `/api/survey/${surveyId}/participants/${participantId}/export?format=pdf`

  return (
    <div className='space-y-8 p-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <Link href={`/admin/survey/${surveyId}/participants`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к участникам
          </span>
        </Link>
        <Button asChild className='gap-2'>
          <a href={exportHref} download>
            <FileText className='h-4 w-4' />
            Экспортировать в PDF
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-2xl font-semibold text-gray-900'>{participant.fullName}</CardTitle>
          <CardDescription className='text-gray-600'>Карточка с данными анкеты и статусом прохождения.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 py-6 md:grid-cols-2'>
          <div className='space-y-2 text-sm text-gray-600'>
            <div className='text-xs uppercase tracking-wide text-gray-500'>Email</div>
            <div className='text-base font-medium text-gray-900'>{participant.email ?? '—'}</div>
          </div>
          <div className='space-y-2 text-sm text-gray-600'>
            <div className='text-xs uppercase tracking-wide text-gray-500'>Статус участия</div>
            <div className='text-base font-medium text-gray-900'>
              {enrollmentLabels[participant.state] ?? participant.state}
            </div>
            <div className='text-xs text-gray-500'>
              {participant.responseState ? responseLabels[participant.responseState] ?? participant.responseState : '—'}
            </div>
          </div>
          <div className='space-y-2 text-sm text-gray-600'>
            <div className='text-xs uppercase tracking-wide text-gray-500'>Прогресс</div>
            <div className='text-base font-medium text-gray-900'>{participant.progress}%</div>
            <div className='h-2 rounded-full bg-gray-200'>
              <div
                className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]'
                style={{ width: `${participant.progress}%` }}
              />
            </div>
          </div>
          <div className='space-y-2 text-sm text-gray-600'>
            <div className='text-xs uppercase tracking-wide text-gray-500'>Активность</div>
            <div>Последнее действие: {formatDateTime(participant.lastActivity)}</div>
            <div>Отправлено: {formatDateTime(participant.submittedAt)}</div>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        {answers.map((section) => (
          <Card key={section.title}>
            <CardHeader className='border-b pb-4'>
              <CardTitle className='text-lg font-semibold text-gray-900'>{section.title}</CardTitle>
              <CardDescription className='text-gray-500'>Ответы участника</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 py-4'>
              {section.fields.map((field) => (
                <div key={field.label} className='grid gap-1 text-sm text-gray-600 md:grid-cols-[240px_1fr]'>
                  <div className='font-medium text-gray-900'>{field.label}</div>
                  <div className='rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-gray-700'>
                    {field.value}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
