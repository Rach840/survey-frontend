'use client'

import {useMemo, useState} from 'react'
import Link from 'next/link'
import {motion} from 'motion/react'
import {ArrowLeft, FileSpreadsheet, Filter} from 'lucide-react'

import {useSurveyDetail} from '@/entities/surveys/model/surveyDetailQuery'
import type {SurveyParticipant} from '@/entities/surveys/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/shared/ui/select'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import {toast} from 'sonner'
import {loadXlsx} from '@/shared/lib/loadXlsx'

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

export default function SurveyParticipantsPage({ surveyId }: { surveyId: string }) {
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)
  const participants = useMemo<SurveyParticipant[]>(
    () => data?.participants ?? data?.invitations ?? [],
    [data?.participants, data?.invitations],
  )
  const [stateFilter, setStateFilter] = useState<string>('all')

  const handleExport = async () => {
    if (!participants.length) {
      toast.info('Список участников пуст')
      return
    }

    try {
      const XLSX = await loadXlsx()
      const worksheet = XLSX.utils.json_to_sheet(
        participants.map((participant, index) => ({
          index: index + 1,
          fullName: participant.fullName,
          email: participant.email ?? '',
          state: participant.state,
          responseState: participant.responseState ?? '',
        })),
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants')
      XLSX.writeFile(workbook, `survey-${surveyId}-participants.xlsx`)
    } catch (error) {
      console.error('participants export error', error)
      toast.error('Не удалось сформировать файл')
    }
  }

  const filteredParticipants = useMemo(() => {
    if (stateFilter === 'all') {
      return participants
    }
    return participants.filter((participant) => participant.state === stateFilter)
  }, [participants, stateFilter])

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
          <Skeleton className='h-12 w-64 rounded-2xl' />
          <Skeleton className='h-64 w-full rounded-2xl' />
        </motion.div>
      </div>
    )
  }

  if (isError || !data) {

  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
      <motion.div
        className='flex flex-wrap items-center justify-between gap-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <Link href={`/admin/survey/${surveyId}`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к анкете
          </span>
        </Link>
        <div className='flex items-center gap-3'>
          <Link href={`/admin/survey/${surveyId}/results`} className='text-sm text-[#2563eb] hover:underline'>
            Смотреть результаты
          </Link>
          <Button variant='outline' className='gap-2' onClick={handleExport}>
            <FileSpreadsheet className='h-4 w-4' />
            Экспортировать список
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.05 }}
      >
      <Card className='border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-2xl font-semibold text-gray-900'>Участники анкеты</CardTitle>
          <CardDescription className='text-gray-600'>Следите за статусами и открывайте карточки для экспорта в PDF.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 py-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='inline-flex items-center gap-2 text-sm text-gray-600'>
              <Filter className='h-4 w-4' />
              Фильтр по статусу
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className='w-[220px]'>
                <SelectValue placeholder='Все статусы' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Все статусы</SelectItem>
                {Object.entries(enrollmentLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stateFilter !== 'all' ? (
              <Button variant='link' className='h-auto px-0 text-[#2563eb]' onClick={() => setStateFilter('all')}>
                Сбросить фильтр
              </Button>
            ) : null}
          </div>

          {filteredParticipants.length === 0 ? (
            <div className='rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-gray-500'>
              Участники пока не найдены.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 text-left'>
                <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <tr>
                    <th className='px-4 py-3'>Участник</th>
                    <th className='px-4 py-3'>Контакты</th>
                    <th className='px-4 py-3'>Статус</th>
                    <th className='px-4 py-3 text-right'>Карточка</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 text-sm text-gray-700'>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className='transition-colors hover:bg-slate-50'>
                      <td className='px-4 py-3'>
                        <div className='font-medium text-gray-900'>{participant.fullName}</div>
                        <div className='text-xs text-gray-500'>Источник: {participant.source === 'bot' ? 'бот' : 'админ'}</div>
                      </td>
                      <td className='px-4 py-3'>{participant.email ?? '—'}</td>
                      <td className='px-4 py-3'>
                        <div>{enrollmentLabels[participant.state] ?? participant.state}</div>
                        <div className='text-xs text-gray-500'>
                          {participant.responseState ? responseLabels[participant.responseState] ?? participant.responseState : '—'}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Link
                          href={`/admin/survey/${surveyId}/participants/${participant.id}`}
                          className='text-sm font-medium text-[#2563eb] hover:underline'
                        >
                          Открыть
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
      </motion.div>
    </div>
  )
}
