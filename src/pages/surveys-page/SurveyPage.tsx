'use client'

import Link from 'next/link'
import { BarChart3, FileSpreadsheet, Pencil, Plus, Users } from 'lucide-react'

import { useSurveys} from '@/entities/surveys/model/surveys'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Input } from '@/shared/ui/input'
import {SurveyCard} from "@/entities/surveys/ui";

const statusTone: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

function getCompletionRate(invited: number, submitted: number) {
  if (!invited) return 0
  return Math.round((submitted / invited) * 100)
}

export function SurveyPage() {

  const {data:surveys, isLoading} = useSurveys()
  const totalSurveys = surveys?.length
  const completedSurveys = surveys?.filter((survey) => survey.status === 'completed').length
  const activeSurveys = surveys?.filter((survey) => survey.status === 'in_progress').length

  return (
    <div className='space-y-8 px-4'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Панель администратора анкет</h1>
          <p className='text-gray-600'>Отслеживайте прогресс, управляйте анкетами и контролируйте экспорт результатов.</p>
        </div>
        <Link href='/admin/survey/create'>
          <Button variant={"form"} size={'lg'} className='gap-2 text-lg'>
            <Plus className='h-4 w-4' />
            Новая анкета
          </Button>
        </Link>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <Card>
          <CardContent className=''>
            <h2 className='text-sm text-gray-500'>Всего анкет</h2>
            <p className='mt-2 text-3xl font-semibold text-gray-900'>{totalSurveys}</p>
            <p className='text-xs text-gray-500'>Завершено: {completedSurveys}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=''>
            <h2 className='text-sm text-gray-500'>Активные</h2>
            <p className='mt-2 text-3xl font-semibold text-gray-900'>{activeSurveys}</p>
            {/*<p className='text-xs text-gray-500'>В работе участников: {inProgressTotal}</p>*/}
          </CardContent>
        </Card>
        <Card>
          <CardContent className=''>
            <h2 className='text-sm text-gray-500'>Приглашено участников</h2>
            {/*<p className='mt-2 text-3xl font-semibold text-gray-900'>{invitedTotal}</p>*/}
            {/*<p className='text-xs text-gray-500'>Завершили: {submittedTotal}</p>*/}
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader className='border-b pb-6'>
          <CardTitle className='text-lg font-semibold text-gray-900'>Фильтры списка</CardTitle>
          <CardDescription>Отберите анкеты по статусу, дате или названию.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4 '>
          <Select defaultValue='all'>
            <SelectTrigger className='w-[220px]'>
              <SelectValue placeholder='Все статусы' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Все статусы</SelectItem>
              <SelectItem value='not_started'>Не начато</SelectItem>
              <SelectItem value='in_progress'>В процессе</SelectItem>
              <SelectItem value='completed'>Завершено</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue='date'>
            <SelectTrigger className='w-[220px]'>
              <SelectValue placeholder='По дате создания' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='date'>По дате создания</SelectItem>
              <SelectItem value='name'>По названию</SelectItem>
              <SelectItem value='status'>По статусу</SelectItem>
            </SelectContent>
          </Select>
          <div className='flex-1 min-w-[240px]'>
            <Input placeholder='Поиск анкет…' className='w-full' />
          </div>
          <Button variant='link' className='h-auto px-0 text-[#2563eb]'>
            Сбросить
          </Button>
        </CardContent>
      </Card>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {!isLoading &&  surveys?.map((survey) => {
          // const completionRate = getCompletionRate(survey.metrics.invited, survey.metrics.submitted)
          // const tone = statusTone[survey.status] ?? statusTone.not_started

          return (
              <SurveyCard key={survey.id} survey={survey} />
          )
        })}
      </div>
    </div>
  )
}
