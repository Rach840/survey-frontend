'use client'

import Link from 'next/link'
import {useMemo} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileText} from 'lucide-react'

import {useSurveyDetail} from '@/entities/surveys/model/surveyDetailQuery'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from "@/widgets/FetchError/ErrorFetch";

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

export  default  function SurveyParticipantPage({
  surveyId,
  participantId,
}: {
  surveyId: string
  participantId: string
}) {
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)

  const participant = useMemo(() => {
    const items = data?.participants ?? data?.invitations ?? []
    return items.find((item) => String(item.id) === participantId)
  }, [data?.participants, data?.invitations, participantId])

  const answers = useMemo(() => getAnswerSections(participantId), [participantId])

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

  if (isError || !data) {
    return  <ErrorFetch refetch={refetch}/>
  }

  if (!participant) {
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
        </motion.div>
      </div>
    )
  }

  const exportHref = `/api/survey/${surveyId}/participants/${participantId}/export?format=pdf`

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
      <motion.div
        className='flex flex-wrap items-center justify-between gap-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <Link href={`/admin/survey/${surveyId}/participants`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к участникам
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
      </motion.div>

      <motion.div
        className='space-y-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.1 }}
      >
        {answers.map((section) => (
          <Card key={section.title} className='border-none bg-white/85 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
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
      </motion.div>
    </div>
  )
}
