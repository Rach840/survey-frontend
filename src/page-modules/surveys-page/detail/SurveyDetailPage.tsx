'use client'

import {useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import {motion} from 'motion/react'
import {ArrowLeft, RefreshCcw} from 'lucide-react'

import {useSurveyStatistics} from '@/entities/surveys/model/surveyStatisticsQuery'
import type {SurveyStatus} from '@/entities/surveys/types'
import {Button} from '@/shared/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'

import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import ErrorFetch from "@/widgets/FetchError/ErrorFetch";
import {defaultStats, formatDateTime, formatNumber, normalizeFormSections, truncateToken} from "@/shared";
import {statusLabels} from "@/entities/templates/types";
import {ChangeForm} from "@/features/survey/ui/change-form/ChangeForm";
import {Metrics} from "@/entities/surveys/ui/metrics/metrics";


const statusTone: Record<SurveyStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  open: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  archived: 'bg-slate-200 text-slate-700',
}

const fadeInitial = fadeUpVariants.hidden
const fadeAnimate = fadeUpVariants.show



export default function SurveyDetailPage({
  surveyId,
  autoOpenEdit = false,
}: {
  surveyId: string
  autoOpenEdit?: boolean
}) {
  const {data, isLoading, isError, refetch} = useSurveyStatistics(surveyId)

  const [editOpen, setEditOpen] = useState(false)


  const survey = data?.survey
  const invitations = useMemo(() => data?.invitations ?? [], [data?.invitations])
  const formSections = useMemo(() => normalizeFormSections(survey?.form_snapshot_json), [survey?.form_snapshot_json])

  const invitationInsights = useMemo(() => {
    if (!invitations.length) {
      return { total: 0, active: 0, expired: 0, expiringSoon: 0, nextExpiration: null as string | null }
    }

    const now = Date.now()
    const soonThreshold = now + 72 * 60 * 60 * 1000
    let expired = 0
    let expiringSoon = 0
    let nextExpiration: number | null = null

    invitations.forEach((invitation) => {
      if (!invitation.expires_at) return
      const timestamp = new Date(invitation.expires_at).getTime()
      if (Number.isNaN(timestamp)) return
      if (timestamp < now) {
        expired += 1
        return
      }
      if (timestamp <= soonThreshold) {
        expiringSoon += 1
      }
      if (nextExpiration === null || timestamp < nextExpiration) {
        nextExpiration = timestamp
      }
    })

    const active = invitations.length - expired

    return {
      total: invitations.length,
      active,
      expired,
      expiringSoon,
      nextExpiration: nextExpiration ? new Date(nextExpiration).toISOString() : null,
    }
  }, [invitations])

  useEffect(() => {
    if (!autoOpenEdit || !survey) return
    setEditOpen(true)
  }, [autoOpenEdit, survey])

  const renderSkeleton = () => (
    <motion.div
      className='space-y-6'
      initial={fadeInitial}
      animate={fadeAnimate}
      transition={fadeTransition}
    >
      <Skeleton className='h-24 w-full rounded-2xl' />
      <div className='grid gap-4 md:grid-cols-3'>
        <Skeleton className='h-24 rounded-2xl' />
        <Skeleton className='h-24 rounded-2xl' />
        <Skeleton className='h-24 rounded-2xl' />
      </div>
      <Skeleton className='h-48 w-full rounded-2xl' />
    </motion.div>
  )



  const renderContent = () => {
    if (isLoading || !survey ) {
      return renderSkeleton()
    }
    
    const surveyStatus = (survey.status as SurveyStatus) ?? 'draft'
    const nextExpirationDisplay = formatDateTime(invitationInsights.nextExpiration)
    const stats = data?.statistics ?? defaultStats

    return (
      <motion.div
        className='space-y-6'
        initial={fadeInitial}
        animate={fadeAnimate}
        transition={fadeTransition}
      >
        <Card className='border-none  shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
          <CardHeader className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-2'>
              <div className='flex flex-wrap items-center gap-3'>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusTone[surveyStatus] ?? statusTone.draft}`}>
                  {statusLabels[surveyStatus]}
                </span>
                <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700'>
                  {survey.mode === 'bot' ? 'Режим бота' : 'Админ режим'}
                </span>
              </div>
              <CardTitle className='text-2xl'>{survey.title}</CardTitle>
              {survey.description ? (
                <CardDescription className='max-w-2xl text-gray-600'>{survey.description}</CardDescription>
              ) : null}
              <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                <span>ID анкеты: {survey.id}</span>
                <span>Версия шаблона: {survey.snapshot_version}</span>
                <span>ID Шаблона: {survey.template_id ?? survey.template_id ?? '—'}</span>
                <span>Создана: {survey.created_at}</span>
                <span>Максимум участников: {survey.max_participants ?? '—'}</span>
                <span>Старт: {survey.starts_at}</span>
                <span>Завершение: {survey.ends_at}</span>
                <span>Всего приглашений: {formatNumber(stats.total_enrollments)}</span>

              </div>
            </div>
            <ChangeForm survey={survey} editOpen={editOpen} setEditOpen={setEditOpen} />

          </CardHeader>
        </Card>

        <motion.div
          className='grid gap-4 md:grid-cols-3'
          initial={fadeInitial}
          animate={fadeAnimate}
          transition={{ ...fadeTransition, delay: 0.05 }}
        >
          <Metrics nextExpirationDisplay={nextExpirationDisplay} expiringSoon={invitationInsights.expiringSoon} stats={data}/>
        </motion.div>

        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate}
          transition={{ ...fadeTransition, delay: 0.1 }}
        >
          <Card className='border-none bg-white/90 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle>Структура анкеты</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {formSections.length === 0 ? (
                <div className='rounded-lg border border-dashed border-slate-200 p-6 text-sm text-gray-500'>
                  Структура формы не найдена в снимке анкеты.
                </div>
              ) : (
                formSections.map((section, sectionIndex) => (
                  <div
                    key={section.code ?? section.title ?? `section-${sectionIndex}`}
                    className='rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 shadow-sm'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div>
                        <div className='text-sm font-semibold text-gray-900'>{section.title ?? section.code ?? 'Без названия'}</div>
                        <div className='text-xs text-gray-500'>Код: {section.code ?? '—'}</div>
                      </div>
                      {section.repeatable ? (
                        <span className='inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700'>
                          Повторяемый блок
                        </span>
                      ) : null}
                    </div>
                    {section.fields.length ? (
                      <ul className='mt-3 space-y-2'>
                        {section.fields.map((field, fieldIndex: number) => {
                          const fieldKey = field.code ?? field.title ?? field.label ?? `field-${fieldIndex}`
                          return (
                            <li key={fieldKey} className='rounded-lg bg-white/70 px-3 py-2 shadow-sm ring-1 ring-slate-200/60'>
                              <div className='flex items-start justify-between gap-2'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {field.label ?? field.title ?? field.code ?? 'Поле без названия'}
                                </div>
                                {field.required ? (
                                  <span className='inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-rose-700'>
                                    Обязательное
                                  </span>
                                ) : null}
                              </div>
                              <div className='mt-1 text-xs text-gray-500'>
                                Тип: {field.type ?? '—'} • Код: {field.code ?? '—'}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <div className='mt-3 rounded-lg border border-dashed border-slate-200/80 px-3 py-2 text-xs text-gray-500'>
                        В разделе нет полей.
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate}
          transition={{ ...fadeTransition, delay: 0.12 }}
        >
          <Card className='border-none bg-white/90 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle>Приглашения</CardTitle>
              <CardDescription>Список приглашённых участников и срок действия их ссылок.</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              {invitations.length === 0 ? (
                <div className='p-6 text-sm text-gray-500'>Пока нет приглашений для отображения.</div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 text-left'>
                    <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      <tr>
                        <th className='px-4 py-3'>Участник</th>
                        <th className='px-4 py-3'>Email</th>
                        <th className='px-4 py-3'>Срок действия</th>
                        <th className='px-4 py-3'>Токен</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                      {invitations.map((invitation) => {
                        const tokenDisplay = truncateToken(invitation.token)
                        return (
                          <tr key={invitation.enrollment_id} className='text-sm text-gray-700'>
                            <td className='px-4 py-3'>
                              <div className='font-medium text-gray-900'>{invitation.full_name || '—'}</div>
                              <div className='text-xs text-gray-500'>ID: {invitation.enrollment_id}</div>
                            </td>
                            <td className='px-4 py-3'>{invitation.email || '—'}</td>
                            <td className='px-4 py-3'>{formatDateTime(invitation.expires_at)}</td>
                            <td className='px-4 py-3 font-mono text-xs text-gray-600' title={invitation.token}>
                              {tokenDisplay}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className='min-h-screen   px-4 pb-16 pt-10 sm:px-8 lg:px-12'>
      <motion.div
        className='mb-6 flex items-center justify-between'
        initial={fadeInitial}
        animate={fadeAnimate}
        transition={fadeTransition}
      >
        <Link href='/admin/survey' className='inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900'>
          <ArrowLeft className='h-4 w-4' /> Назад к списку
        </Link>
        <Button variant='ghost' size='icon' onClick={() => refetch()}>
          <RefreshCcw className='h-4 w-4' />
        </Button>
      </motion.div>

      {isError ? <ErrorFetch refetch={refetch}/> : renderContent()}
    </div>
  )
}

