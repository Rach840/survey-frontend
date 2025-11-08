import {Button, Card, CardContent, CardHeader, CardTitle} from '@/shared'
import Link from 'next/link'
import {BarChart3, FileSpreadsheet, Pencil} from 'lucide-react'

import type {SurveyWithStatistic} from '@/entities/surveys/types'
import {statusLabels} from '@/entities/templates/types'
import {normalizePercentage} from '@/shared/lib'


const statusTone: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  open: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-rose-100 text-rose-700',
  archived: 'bg-amber-100 text-amber-600',
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('ru-RU')
export default function SurveyCard({ data }: { data: SurveyWithStatistic }) {
  const { survey, statistics } = data
  const status = survey.status?.toLowerCase() ?? 'draft'
  const statusBadge = statusTone[status] ?? statusTone.draft
  const statusLabel = statusLabels[status] ?? 'Статус не задан'
  const createdAt = dateFormatter.format(new Date(survey.created_at))
  const overallProgress = normalizePercentage(statistics?.overall_progress)
  const completedCount = statistics?.responses_submitted ?? 0
  const totalParticipants = statistics?.total_enrollments ?? 0
  const inProgressCount = statistics?.responses_in_progress ?? 0
  const completionSummary = totalParticipants > 0
    ? `${numberFormatter.format(completedCount)} из ${numberFormatter.format(totalParticipants)}`
    : numberFormatter.format(completedCount)

  return (
    <Card className='group relative overflow-hidden border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'>
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2563eb]/0 via-transparent to-[#a855f7]/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
      <CardHeader className='relative border-b pb-6'>
        <div className='flex items-start justify-between gap-3 text-sm'>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge}`}>
            {statusLabel}
          </span>
          <span className='text-xs text-slate-500'>Создана {createdAt}</span>
        </div>
        <CardTitle className='text-xl text-slate-900'>{survey.title}</CardTitle>
      </CardHeader>
      <CardContent className='relative space-y-6 py-6'>
        <div className='grid grid-cols-2 gap-4 text-sm text-slate-700'>
          <div>
            <span className='text-xs uppercase tracking-wide text-slate-500'>Идентификатор</span>
            <div className='mt-1 font-medium text-slate-900'>#{survey.id}</div>
          </div>
          <div>
            <span className='text-xs uppercase tracking-wide text-slate-500'>Режим</span>
            <div className='mt-1 capitalize text-slate-900'>{survey.mode === 'bot' ? 'Бот' : 'Админ'}</div>
          </div>
        </div>

        <div className='space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-inner'>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Прогресс</span>
            <span className='text-sm font-semibold text-slate-900'>{overallProgress}%</span>
          </div>
          <div className='h-2 rounded-full bg-slate-200'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#a855f7] transition-all duration-300'
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className='flex flex-wrap items-center justify-between text-xs text-slate-600'>
            <span>Завершили: {completionSummary}</span>
            <span>В процессе: {numberFormatter.format(inProgressCount)}</span>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Link href={`/questioner/survey/${survey.id}`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>
              <BarChart3 className='h-4 w-4' />
              Статистика
            </Button>
          </Link>
          <Link href={`/questioner/survey/${survey.id}?edit=true`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>
              <Pencil className='h-4 w-4' />
              Редактировать
            </Button>
          </Link>
          <Link href={`/questioner/survey/${survey.id}/results`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>
              <FileSpreadsheet className='h-4 w-4' />
              Результаты
            </Button>
          </Link>
          <Link href={`/questioner/survey/${survey.id}/participants`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>

              Участники
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
