'use client'

import {useMemo, useState} from 'react'
import Link from 'next/link'
import {Plus} from 'lucide-react'
import {motion} from 'motion/react'

import {useSurveys} from '@/entities/surveys/model/surveys'
import type {Survey} from '@/entities/surveys/types'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/shared/ui/select'
import {Input} from '@/shared/ui/input'
import SurveyCard from '@/entities/surveys/ui'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'

type SortOption = 'date' | 'name' | 'status'

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  open: 'Открыта',
  closed: 'Закрыта',
  archived: 'Архив',
}

export default function SurveyPage() {
  const {data: surveys, isLoading} = useSurveys()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [search, setSearch] = useState('')

  const totalSurveys = surveys?.length ?? 0
  const activeSurveys = surveys?.filter((survey) => survey.status === 'open').length ?? 0
  const completedSurveys = surveys?.filter((survey) => survey.status === 'closed').length ?? 0

  const filteredSurveys = useMemo(() => {
    if (!surveys) return []

    let list: Survey[] = [...surveys]

    if (statusFilter !== 'all') {
      list = list.filter((survey) => survey.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      list = list.filter((survey) =>
        survey.title.toLowerCase().includes(term) || (survey.description ?? '').toLowerCase().includes(term),
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title, 'ru')
      }

      if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      }

      const first = new Date(a.created_at).getTime()
      const second = new Date(b.created_at).getTime()
      return second - first
    })

    return list
  }, [surveys, statusFilter, search, sortBy])

  const uniqueStatuses = useMemo(() => {
    if (!surveys) return []
    const values = Array.from(new Set(surveys.map((survey) => survey.status)))
    return values
  }, [surveys])

  return (
    <div className='space-y-8 px-4 pb-16 pt-10 sm:px-8 lg:px-12  min-h-screen'>
      <motion.div
        className='flex flex-wrap items-start justify-between gap-4'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={fadeTransition}
      >
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Панель администратора анкет</h1>
          <p className='text-gray-600'>Отслеживайте прогресс, управляйте анкетами и контролируйте экспорт результатов.</p>
        </div>
        <Link href='/admin/survey/create'>
          <Button variant='form' size='lg' className='gap-2 text-lg'>
            <Plus className='h-4 w-4' />
            Новая анкета
          </Button>
        </Link>
      </motion.div>

      <motion.div
        className='grid gap-4 md:grid-cols-2 xl:grid-cols-2'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.05 }}
      >
        <Card className='border-none bg-white/80 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
          <CardContent className='space-y-3 py-6'>
            <h2 className='text-sm font-medium text-slate-500'>Всего анкет</h2>
            <p className='text-3xl font-semibold text-slate-900'>{totalSurveys}</p>
            <p className='text-xs text-slate-500'>Завершено: {completedSurveys}</p>
          </CardContent>
        </Card>
        <Card className='border-none bg-white/80 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
          <CardContent className='space-y-3 py-6'>
            <h2 className='text-sm font-medium text-slate-500'>Активные</h2>
            <p className='text-3xl font-semibold text-slate-900'>{activeSurveys}</p>
            <p className='text-xs text-slate-500'>Следите за прогрессом вовлечения.</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.1 }}
      >
      <Card className='border-none bg-white/90 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm rounded-2xl'>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-lg font-semibold text-gray-900'>Фильтры списка</CardTitle>
          <CardDescription>Отберите анкеты по статусу, дате или названию.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[220px]'>
              <SelectValue placeholder='Все статусы'>
                {statusFilter === 'all' ? 'Все статусы' : statusLabels[statusFilter] ?? statusFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Все статусы</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status] ?? status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className='w-[220px]'>
              <SelectValue placeholder='Сортировка'>
                {sortBy === 'date' ? 'По дате создания' : sortBy === 'name' ? 'По названию' : 'По статусу'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='date'>По дате создания</SelectItem>
              <SelectItem value='name'>По названию</SelectItem>
              <SelectItem value='status'>По статусу</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex min-w-[240px] flex-1'>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Поиск анкет…'
              className='w-full'
            />
          </div>

          <Button
            variant='link'
            className='h-auto px-0 text-[#2563eb]'
            onClick={() => {
              setStatusFilter('all')
              setSortBy('date')
              setSearch('')
            }}
          >
            Сбросить
          </Button>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'
        initial='hidden'
        animate='show'
        variants={fadeUpVariants}
        transition={{ ...fadeTransition, delay: 0.15 }}
      >
        {isLoading ? (
          Array.from({length: 6}).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className='h-56 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60'
            />
          ))
        ) : filteredSurveys.length === 0 ? (
          <div className='col-span-full rounded-lg border border-dashed border-slate-200 p-8 text-center text-gray-500'>
            Подходящих анкет не найдено.
          </div>
        ) : (
          filteredSurveys.map((survey) => <SurveyCard key={survey.id} survey={survey} />)
        )}
      </motion.div>
    </div>
  )
}
