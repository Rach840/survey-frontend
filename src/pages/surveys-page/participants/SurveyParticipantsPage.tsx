'use client'

import Link from 'next/link'
import {useState} from 'react'
import {ArrowLeft, RefreshCcw} from 'lucide-react'

import {useSurveyDetail} from '@/entities/surveys/model/surveyDetailQuery'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {CopyButton} from "@/components/ui/shadcn-io/copy-button";

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

export  default  function SurveyParticipantsPage({ surveyId }: { surveyId: string }) {
  const [stateFilter, setStateFilter] = useState<string>('all')
  const { data, isLoading, isError, refetch } = useSurveyDetail(surveyId)

  const participants = data?.invitations ?? []
  const filteredParticipants =
    stateFilter === 'all'
      ? participants
      : participants.filter((participant) => participant.state === stateFilter)

  if (isLoading) {
    return (
      <div className='space-y-4 p-8'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-12 w-64' />
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className='p-8'>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='space-y-3 p-6'>
            <CardTitle className='text-lg text-red-700'>Не удалось загрузить участников</CardTitle>
            <CardDescription className='text-red-600'>Попробуйте обновить страницу или повторите попытку позже.</CardDescription>
            <div className='flex gap-3'>
              <Button onClick={() => refetch()} variant='outline' className='gap-2'>
                <RefreshCcw className='h-4 w-4' />
                Повторить запрос
              </Button>
              <Link href={`/admin/survey/${surveyId}`}>
                <Button variant='ghost' className='gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  Назад к анкете
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
        <Link href={`/admin/survey/${surveyId}`} className='text-sm text-gray-600 hover:text-gray-900'>
          <span className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Назад к анкете
          </span>
        </Link>
        <Link href={`/admin/survey/${surveyId}/results`} className='text-sm text-[#2563eb] hover:underline'>
          Смотреть результаты и экспорт
        </Link>
      </div>

      <Card>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-2xl font-semibold text-gray-900'>Участники анкеты</CardTitle>
          <CardDescription className='text-gray-600'>Следите за статусами и открывайте карточки для экспорта в PDF.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 py-6'>
          {/*<div className='flex flex-wrap items-center gap-4'>*/}
          {/*  <div className='inline-flex items-center gap-2 text-sm text-gray-600'>*/}
          {/*    <Filter className='h-4 w-4' />*/}
          {/*    Фильтр по статусу*/}
          {/*  </div>*/}
          {/*  <Select value={stateFilter} onValueChange={setStateFilter}>*/}
          {/*    <SelectTrigger className='w-[220px]'>*/}
          {/*      <SelectValue placeholder='Все статусы' />*/}
          {/*    </SelectTrigger>*/}
          {/*    <SelectContent>*/}
          {/*      <SelectItem value='all'>Все статусы</SelectItem>*/}
          {/*      {Object.entries(enrollmentLabels).map(([key, label]) => (*/}
          {/*        <SelectItem key={key} value={key}>*/}
          {/*          {label}*/}
          {/*        </SelectItem>*/}
          {/*      ))}*/}
          {/*    </SelectContent>*/}
          {/*  </Select>*/}
          {/*  {stateFilter !== 'all' ? (*/}
          {/*    <Button variant='link' className='h-auto px-0 text-[#2563eb]' onClick={() => setStateFilter('all')}>*/}
          {/*      Сбросить фильтр*/}
          {/*    </Button>*/}
          {/*  ) : null}*/}
          {/*</div>*/}

          {filteredParticipants.length === 0 ? (
            <div className='rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-gray-500'>
              Нет участников с выбранным статусом.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 text-left'>
                <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <tr>
                    <th className='px-4 py-3'>Участник</th>
                    <th className='px-4 py-3'>Контакты</th>
                    <th className='px-4 py-3'>Статус</th>
                    <th className='px-4 py-3'>Ссылка Приглашения</th>
                    <th className='px-4 py-3 text-right'>Карточка</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 text-sm text-gray-700'>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.enrollment_id} className='transition-colors hover:bg-slate-50'>
                      <td className='px-4 py-3'>
                        <div className='font-medium text-gray-900'>{participant.full_name}</div>
                        <div className='text-xs text-gray-500'>Источник: {participant.source === 'bot' ? 'бот' : 'админ'}</div>
                      </td>
                      <td className='px-4 py-3'>{participant.email ?? '—'}</td>
                      <td className='px-4 py-3'>
                        <div>{enrollmentLabels[participant.state] ?? participant.state}</div>
                        <div className='text-xs text-gray-500'>
                          {participant.responseState ? responseLabels[participant.responseState] ?? participant.responseState : '—'}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <CopyButton content={`http://localhost:3000/survey/${participant.token}`} variant={"secondary"} size="md" />
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
    </div>
  )
}
