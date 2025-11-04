'use client'

import Link from 'next/link'
import {useMemo, useState} from 'react'
import {motion} from 'motion/react'
import {ArrowLeft, FileSpreadsheet, Loader2} from 'lucide-react'

import {useSurveyResults} from '@/entities/surveys/model/surveyResultsQuery'
import type {SurveyResultsItem, SurveyResultsStatistics,} from '@/entities/surveys/types'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Button} from '@/shared/ui/button'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from '@/widgets/FetchError/ErrorFetch'

import {formatDateTime, formatNumber} from "@/shared/lib";
import {Metrics} from "@/entities/surveys/ui/metrics/metrics";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/shared/ui/table";
import {useResultExcelExport} from "@/features/survey/export-survey";


function formatAverageDuration(stats: SurveyResultsStatistics): string | null {
  if (stats.average_completion_duration && stats.average_completion_duration.trim()) {
    return stats.average_completion_duration
  }

  const seconds = stats.average_completion_seconds
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return null
  }

  if (seconds < 60) {
    return `${seconds.toFixed(seconds < 10 ? 2 : 1)} с`
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    return `${minutes.toFixed(minutes < 10 ? 1 : 0)} мин`
  }

  const hours = minutes / 60
  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)} ч`
  }

  const days = hours / 24
  return `${days.toFixed(days < 10 ? 1 : 0)} д`
}


function getSubmittedResults(results: SurveyResultsItem[] | undefined) {
  if (!results) return []
  return results.filter((item) => item.response?.state === 'submitted')
}

export default function SurveyResultsPage({surveyId}: { surveyId: string }) {
  const {data, isLoading, isError, refetch} = useSurveyResults(surveyId)
  const survey = data?.survey
  const stats = data?.statistics
  const [isExporting, setIsExporting] = useState(false)
  const allResults = useMemo(() => data?.results ?? [], [data?.results])
  const submittedResults = useMemo(() => getSubmittedResults(allResults), [allResults])
const handleExport = useResultExcelExport(survey, allResults, setIsExporting)

  const averageDuration = stats ? formatAverageDuration(stats) : null

  if (isLoading) {
    return (
      <div className='min-h-screen  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
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
    <div className='min-h-screen space-y-8  px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
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
        <Button className='gap-2' onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <FileSpreadsheet className='h-4 w-4' />
          )}
          {isExporting ? 'Формирование...' : 'Экспортировать в Excel'}
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
              <Metrics stats={stats}/>
            </div>
            {averageDuration ? (
              <div className='rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700'>
                Среднее время заполнения: <span className='font-medium'>{averageDuration}</span>
              </div>
            ) : null}
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
            <CardTitle className='text-lg font-semibold text-gray-900'>Результаты участников</CardTitle>
            <CardDescription className='text-gray-600'>
              Список участников, которые завершили прохождение анкеты. Откройте ответы, чтобы посмотреть детали.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            {submittedResults.length === 0 ? (
              <div className='p-6 text-sm text-gray-500'>Здесь появятся участники, завершившие анкету.</div>
            ) : (
              <div className='overflow-x-auto'>

                <Table className={"min-w-full divide-y divide-gray-200 text-left"}>
                  <TableHeader className={'bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'}>
                    <TableRow>
                      <TableHead className="px-4 py-3 w-[100px]">Участник</TableHead>
                      <TableHead className={"px-4 py-3"}>Email</TableHead>
                      <TableHead className={"px-4 py-3"}>Канал</TableHead>
                      <TableHead className={"px-4 py-3"}>Отправлено</TableHead>
                      <TableHead  className="px-4 py-3 text-right">Ответы</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={"divide-y divide-gray-100"}>
                    {submittedResults.map((item) => (
                        <TableRow key={item.enrollment.id} className='text-sm text-gray-700'>
                          <TableCell className='px-4 py-3'>
                            <div className='font-medium text-gray-900'>{item.enrollment.full_name || '—'}</div>
                            <div className='text-xs text-gray-500'>ID: {item.enrollment.id}</div>
                          </TableCell>
                          <TableCell className='px-4 py-3'>{item.enrollment.email || '—'}</TableCell>
                          <TableCell className='px-4 py-3 capitalize'>{item.response.channel ?? '—'}</TableCell>
                          <TableCell className='px-4 py-3'>{formatDateTime(item.response.submitted_at)}</TableCell>
                          <TableCell className='px-4 py-3 text-right'>
                            <Button asChild size='sm' variant='outline'>
                              <Link href={`/admin/survey/${surveyId}/results/${item.enrollment.id}`}>Просмотреть</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
