import {Button, Card, CardContent, CardHeader, CardTitle} from '@/shared'
import Link from 'next/link'
import {BarChart3, FileSpreadsheet, Pencil} from 'lucide-react'
import type {SurveyResult} from '@/entities/surveys/types'

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  open: 'Открыта',
  closed: 'Закрыта',
  archived: 'Архив',
}

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

export default function SurveyCard({survey}: {survey: SurveyResult}) {
  const surveyInfo = survey.survey
  const status = surveyInfo.status?.toLowerCase() ?? 'draft'
  const statusBadge = statusTone[status] ?? statusTone.draft
  const statusLabel = statusLabels[status] ?? 'Статус не задан'
  console.log(surveyInfo)
  const createdAt = dateFormatter.format(new Date(surveyInfo.created_at))

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
        <CardTitle className='text-xl text-slate-900'>{surveyInfo.title}</CardTitle>
      </CardHeader>
      <CardContent className='relative space-y-6 py-6'>
        <div className='grid grid-cols-2 gap-4 text-sm text-slate-700'>
          <div>
            <span className='text-xs uppercase tracking-wide text-slate-500'>Идентификатор</span>
            <div className='mt-1 font-medium text-slate-900'>#{surveyInfo.id}</div>
          </div>
          <div>
            <span className='text-xs uppercase tracking-wide text-slate-500'>Режим</span>
            <div className='mt-1 capitalize text-slate-900'>{surveyInfo.mode === 'bot' ? 'Бот' : 'Админ'}</div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Link href={`/admin/survey/${surveyInfo.id}`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>
              <BarChart3 className='h-4 w-4' />
              Статистика
            </Button>
          </Link>
          <Link href={`/admin/survey/${surveyInfo.id}?edit=true`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>
              <Pencil className='h-4 w-4' />
              Редактировать
            </Button>
          </Link>
          <Link href={`/admin/survey/${surveyInfo.id}/results`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>
              <FileSpreadsheet className='h-4 w-4' />
              Результаты
            </Button>
          </Link>
          <Link href={`/admin/survey/${surveyInfo.id}/participants`}>
            <Button variant='outline' className='w-full gap-2 transition-transform hover:-translate-y-0.5'>

              Участники
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
