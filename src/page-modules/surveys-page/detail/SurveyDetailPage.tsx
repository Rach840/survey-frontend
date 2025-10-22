'use client'

import {useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import {motion} from 'motion/react'
import {ArrowLeft, Edit3, RefreshCcw} from 'lucide-react'

import {useSurveyStatistics} from '@/entities/surveys/model/surveyStatisticsQuery'
import {useSurveyUpdate} from '@/features/survey/update-survey'
import type {SurveyMode, SurveyStatus} from '@/entities/surveys/types'
import {Button} from '@/shared/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import {Input} from '@/shared/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/shared/ui/select'
import {Skeleton} from '@/shared/ui/skeleton'
import {fadeTransition, fadeUpVariants} from '@/shared/ui/page-transition'
import {toast} from 'sonner'
import ErrorFetch from "@/widgets/FetchError/ErrorFetch";
import {
  createMetrics,
  defaultStats,
  formatDateTime,
  formatNumber,
  normalizeFormSections,
  readSurveyProp,
  truncateToken
} from "@/shared";
import {EditFormState} from "@/shared/lib";
import {statusLabels} from "@/entities/templates/types";


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
  const {mutateAsync, isPending} = useSurveyUpdate(surveyId)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<EditFormState | null>(null)

  const survey = data?.survey
  const invitations = useMemo(() => data?.invitations ?? [], [data?.invitations])
  const metrics = useMemo(() => createMetrics(data), [data])
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
    if (!survey) {
      setForm(null)
      return
    }

    const maxParticipantsValue = readSurveyProp<number | string>(survey, 'max_participants', 'maxParticipants')
    const startsAtValue = readSurveyProp<string>(survey, 'starts_at', 'startsAt')
    const endsAtValue = readSurveyProp<string>(survey, 'ends_at', 'endsAt')
    const publicSlugValue = readSurveyProp<string>(survey, 'public_slug', 'publicSlug')

    setForm({
      title: survey.title,
      mode: (survey.mode as SurveyMode) ?? 'admin',
      status: (survey.status as SurveyStatus) ?? 'draft',
      maxParticipants: maxParticipantsValue !== undefined && maxParticipantsValue !== null ? String(maxParticipantsValue) : '',
      publicSlug: publicSlugValue ?? '',
      startsAt: toInputDateTime(startsAtValue ?? null),
      endsAt: toInputDateTime(endsAtValue ?? null),
    })
  }, [survey])

  useEffect(() => {
    if (!autoOpenEdit || !survey) return
    setEditOpen(true)
  }, [autoOpenEdit, survey])

  const handleChange = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleSave = async () => {
    if (!form) return

    const title = form.title.trim()
    if (!title) {
      toast.error('Укажите название анкеты')
      return
    }

    const mode = form.mode
    const maxParticipantsValue = form.maxParticipants.trim() ? Number(form.maxParticipants) : null
    if (maxParticipantsValue !== null && (Number.isNaN(maxParticipantsValue) || maxParticipantsValue < 0)) {
      toast.error('Введите корректное число участников')
      return
    }

    const startsAtIso = parseDateTime(form.startsAt)
    const endsAtIso = parseDateTime(form.endsAt)
    const slug = form.publicSlug.trim()
    console.log('dasdasdsad',startsAtIso,endsAtIso)
    const payload = {
      title,
      invitationMode: mode,
      status: form.status,
      max_participants: maxParticipantsValue,
      public_slug: slug || null,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
    }

    try {
      await mutateAsync(payload)
      toast.success('Анкета обновлена')
      setEditOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Не удалось сохранить изменения')
    }
  }

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
    if (isLoading || !survey || !form) {
      return renderSkeleton()
    }

    const surveyStatus = (survey.status as SurveyStatus) ?? 'draft'
    const statusBadge = statusTone[surveyStatus] ?? statusTone.draft

    const rawMaxParticipants = readSurveyProp<number | string>(survey, 'max_participants', 'maxParticipants') ?? null
    const rawStartsAt = readSurveyProp<string>(survey, 'starts_at', 'startsAt') ?? null
    const rawEndsAt = readSurveyProp<string>(survey, 'ends_at', 'endsAt') ?? null
    const rawTemplateTitle = readSurveyProp<string>(survey, 'template_title', 'templateTitle') ?? null
    const rawCreatedAt = readSurveyProp<string>(survey, 'created_at', 'createdAt') ?? null

    const createdAtDisplay = formatDateTime(rawCreatedAt)
    const startsAtDisplay = formatDateTime(rawStartsAt)
    const endsAtDisplay = formatDateTime(rawEndsAt)
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
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
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
                <span>Шаблон: {rawTemplateTitle ?? survey.template_id ?? '—'}</span>
                <span>Создана: {createdAtDisplay}</span>
                <span>Максимум участников: {rawMaxParticipants ?? '—'}</span>
                <span>Старт: {startsAtDisplay}</span>
                <span>Завершение: {endsAtDisplay}</span>
                <span>Всего приглашений: {formatNumber(stats.total_enrollments)}</span>
              </div>
            </div>
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
              <SheetTrigger asChild>
                <Button variant='outline' className='gap-2'>
                  <Edit3 className='h-4 w-4' />
                  Редактировать
                </Button>
              </SheetTrigger>
              <SheetContent className='flex flex-col' side='right'>
                <SheetHeader>
                  <SheetTitle>Редактирование анкеты</SheetTitle>
                  <SheetDescription>
                    Обновите основные параметры. Изменения сохранятся сразу после подтверждения.
                  </SheetDescription>
                </SheetHeader>
                <div className='flex-1 space-y-4 overflow-y-auto p-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700' htmlFor='survey-title'>
                      Название
                    </label>
                    <Input
                      id='survey-title'
                      value={form.title}
                      onChange={(event) => handleChange('title', event.target.value)}
                      placeholder='Название анкеты'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>Режим приглашений</label>
                    <Select value={form.mode} onValueChange={(value: SurveyMode) => handleChange('mode', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите режим' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='admin'>Администратор</SelectItem>
                        <SelectItem value='bot'>Бот</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>Статус</label>
                    <Select value={form.status} onValueChange={(value: SurveyStatus) => handleChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите статус' />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(statusLabels) as SurveyStatus[]).map((status,key:number) => (
                          <SelectItem key={key} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700' htmlFor='survey-slug'>
                      Публичный идентификатор
                    </label>
                    <Input
                      id='survey-slug'
                      value={form.publicSlug}
                      onChange={(event) => handleChange('publicSlug', event.target.value)}
                      placeholder='Например, team-onboarding'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700' htmlFor='survey-max'>
                      Максимум участников
                    </label>
                    <Input
                      id='survey-max'
                      type='number'
                      min={1}
                      value={form.maxParticipants}
                      onChange={(event) => handleChange('maxParticipants', event.target.value)}
                      placeholder='Не ограничено'
                    />
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700' htmlFor='survey-start'>
                        Дата начала
                      </label>
                      <Input
                        id='survey-start'
                        type='datetime-local'
                        value={form.startsAt}
                        onChange={(event) => handleChange('startsAt', event.target.value)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700' htmlFor='survey-end'>
                        Дата завершения
                      </label>
                      <Input
                        id='survey-end'
                        type='datetime-local'
                        value={form.endsAt}
                        onChange={(event) => handleChange('endsAt', event.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button onClick={handleSave} disabled={isPending} className='w-full gap-2'>
                    {isPending ? <RefreshCcw className='h-4 w-4 animate-spin' /> : <Edit3 className='h-4 w-4' />}
                    {isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardHeader>
        </Card>

        <motion.div
          className='grid gap-4 md:grid-cols-3'
          initial={fadeInitial}
          animate={fadeAnimate}
          transition={{ ...fadeTransition, delay: 0.05 }}
        >
          {metrics.map((metric) => (
            <Card key={metric.label} className='border-none bg-white/85 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
              <CardContent className='p-6'>
                <div className='text-xs uppercase tracking-wide text-gray-500'>{metric.label}</div>
                <div className='text-2xl font-semibold text-gray-900'>{metric.value}</div>
                {typeof metric.percentage === 'number' ? (
                  <div className='mt-3 h-2 rounded-full bg-gray-200'>
                    <div
                      className='h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]'
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={fadeInitial}
          animate={fadeAnimate}
          transition={{ ...fadeTransition, delay: 0.08 }}
        >
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='border-none bg-white/90 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg font-semibold text-gray-900'>Технические детали</CardTitle>
                <CardDescription>Идентификаторы и даты помогут при отладке или поддержке.</CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Владелец</div>
                  <div className='mt-1 text-sm text-gray-900'>{survey.owner_id ?? '—'}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>ID шаблона</div>
                  <div className='mt-1 text-sm text-gray-900'>{survey.template_id ?? '—'}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Создана</div>
                  <div className='mt-1 text-sm text-gray-900'>{createdAtDisplay}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Ближайший старт</div>
                  <div className='mt-1 text-sm text-gray-900'>{startsAtDisplay}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Завершение</div>
                  <div className='mt-1 text-sm text-gray-900'>{endsAtDisplay}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Максимум участников</div>
                  <div className='mt-1 text-sm text-gray-900'>{rawMaxParticipants ?? '—'}</div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-none bg-white/90 shadow-md ring-1 ring-slate-200/60 backdrop-blur-sm'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg font-semibold text-gray-900'>Состояние приглашений</CardTitle>
                <CardDescription>
                  Активных: {invitationInsights.active} • Истекших: {invitationInsights.expired} • Истекают в 72ч: {invitationInsights.expiringSoon}
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Всего приглашений</div>
                  <div className='mt-1 text-sm text-gray-900'>{invitationInsights.total}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Активно сейчас</div>
                  <div className='mt-1 text-sm text-gray-900'>{invitationInsights.active}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Истекают скоро</div>
                  <div className='mt-1 text-sm text-gray-900'>{invitationInsights.expiringSoon}</div>
                </div>
                <div>
                  <div className='text-xs uppercase tracking-wide text-gray-500'>Ближайшее истечение</div>
                  <div className='mt-1 text-sm text-gray-900'>{nextExpirationDisplay}</div>
                </div>
              </CardContent>
            </Card>
          </div>
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

function toInputDateTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseDateTime(value: string) {
  if (!value) return null
  const iso = new Date(value)
  if (Number.isNaN(iso.getTime())) return null
  return iso.toISOString()
}
