'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {AlertCircle, CheckCircle2, Loader2, PlayCircle, RefreshCcw} from 'lucide-react'
import {toast} from 'sonner'

import type {PublicSurveySession, SurveySubmissionAnswer} from '@/entities/public-survey'
import {
  publicSurveySessionKey,
  startPublicSurveySession,
  submitPublicSurveyResponse,
  usePublicSurveySession,
} from '@/entities/public-survey'
import {sectionsToDynamicForm} from '@/entities/templates/lib/toDynamicForm'
import {statusLabels} from '@/entities/templates/types'
import {GeneratedForm} from '@/features/template/generated'
import {buildSubmissionAnswers, clearDraft, readDraft, writeDraft} from '@/entities/surveys/lib'
import {enrollmentLabels, responseLabels, formatDateTime} from '@/shared/lib'
import {Button} from '@/shared/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Skeleton} from '@/shared/ui/skeleton'

type SurveyPageProps = {
  token?: string
}

const STORAGE_PREFIX = 'survey-response:v1:'
const AUTOSAVE_DELAY = 600






export  default  function SurveyPage({token }: SurveyPageProps) {
  if (!token) {
    return <TokenMissingNotice />
  }
  return <SurveyPageContent token={token} />
}

type SurveyPageContentProps = {
  token: string
}

function SurveyPageContent({  token }: SurveyPageContentProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, refetch } = usePublicSurveySession( token)
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>()
  const autosaveTimer = useRef<number | null>(null)

  const enrollmentState = data?.enrollment.state
  const responseState = data?.response?.state
  const hasResponse = Boolean(data?.response)
  const isSubmitted = responseState === 'submitted'
  const isExpired = enrollmentState === 'expired'
  const hasStarted = hasResponse || enrollmentState === 'pending' || enrollmentState === 'active'
  const shouldShowIntro = Boolean(data) && !isSubmitted && !isExpired && !hasStarted

  const storageKey = useMemo(() => {
    if (!data || !hasStarted) return undefined
    return `${STORAGE_PREFIX}${token}:${data.enrollment.id}`
  }, [data, hasStarted, token])

  const shouldShowForm = Boolean(data) && !isSubmitted && !isExpired && !shouldShowIntro
  const formSections = data?.survey.formSnapshot

  useEffect(() => {
    if (!data || !storageKey || !shouldShowForm) {
      setInitialValues(undefined)
      return
    }

    const answersFromServer =
      data.response?.answers && typeof data.response.answers === 'object'
        ? (data.response.answers as Record<string, unknown>)
        : {}

    const draft = readDraft(storageKey)
    const merged = draft?.values ? { ...answersFromServer, ...draft.values } : answersFromServer
    setInitialValues(Object.keys(merged).length > 0 ? merged : undefined)
  }, [data, shouldShowForm, storageKey])

  useEffect(() => {
    if (!storageKey || !isSubmitted) return
    clearDraft(storageKey)
  }, [storageKey, isSubmitted])

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current)
      }
    }
  }, [])

  const startMutation = useMutation({
    mutationFn: () => startPublicSurveySession({
      token,
      channel: 'general',
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: publicSurveySessionKey(token),
      })
      toast.success('Анкетирование начато')
    },
    onError: () => {
      toast.error('Не удалось начать анкетирование. Попробуйте ещё раз.')
    },
  })

  const handleStart = useCallback(() => {
    if (startMutation.isPending) return
    startMutation.mutate()
  }, [startMutation])

  const mutation = useMutation({
    mutationFn: async (answers: SurveySubmissionAnswer[]) => {
      return submitPublicSurveyResponse({
        token,
        channel: 'web',
        answers,
      })
    },
    onSuccess: async () => {
      if (storageKey) {
        clearDraft(storageKey)
      }
      await queryClient.invalidateQueries({
        queryKey: publicSurveySessionKey(token),
      })
      toast.success('Анкета успешно завершена')
    },
    onError: () => {
      toast.error('Не удалось отправить ответы. Попробуйте ещё раз.')
    },
  })

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (isSubmitted) {
        toast.info('Ответ уже отправлен.')
        return
      }

      if (!shouldShowForm) {
        toast.error('Анкетирование ещё не начато. Нажмите «Начать анкетирование».')
        return
      }

      if (!formSections) {
        toast.error('Не удалось определить структуру анкеты.')
        return
      }

      const answers = buildSubmissionAnswers(formSections, values)
      await mutation.mutateAsync(answers)
    },
    [formSections, isSubmitted, mutation, shouldShowForm],
  )

  const handleChange = useCallback(
    (values: Record<string, unknown>) => {
      if (!storageKey || isSubmitted) return
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current)
      }
      autosaveTimer.current = window.setTimeout(() => {
        writeDraft(storageKey, values)
      }, AUTOSAVE_DELAY)
    },
    [storageKey, isSubmitted],
  )

  const schema = useMemo(() => {
    if (!data?.survey.formSnapshot || data.survey.formSnapshot.length === 0) {
      return null
    }
    return sectionsToDynamicForm(data.survey.title, data.survey.formSnapshot)
  }, [data])

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-50 px-4 py-12'>
        <div className='mx-auto flex max-w-3xl flex-col gap-6'>
          <Skeleton className='h-32 w-full rounded-xl' />
          <Skeleton className='h-[520px] w-full rounded-xl' />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    const message =
      (error as Error & { status?: number })?.status === 401
        ? 'Ссылка недействительна или срок действия приглашения истёк.'
        : (error instanceof Error && error.message) || 'Не удалось загрузить анкету.'
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
        <Card className='max-w-lg border-red-200 bg-red-50'>
          <CardHeader className='flex items-start gap-2'>
            <AlertCircle className='h-5 w-5 text-red-500' />
            <div>
              <CardTitle className='text-red-700'>Ошибка загрузки анкеты</CardTitle>
              <CardDescription className='text-red-600'>{message}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant='outline' className='gap-2' onClick={() => refetch()}>
              <RefreshCcw className='h-4 w-4' />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  if (isExpired) {
    return <SurveyExpiredNotice session={data} onRetry={() => refetch()} />
  }

  if (isSubmitted) {
    return <SurveyCompletionScreen session={data} onReload={() => refetch()} />
  }

  if (shouldShowIntro) {
    return (
      <SurveyStartScreen
        session={data}
        onStart={handleStart}
        isStarting={startMutation.isPending}
      />
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 px-4 py-12'>
      <div className='mx-auto flex max-w-3xl flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-semibold text-gray-900'>{data.survey.title}</CardTitle>
            <CardDescription className='text-gray-600'>
              {data.survey.description || 'Заполните форму, чтобы отправить ответы организатору.'}
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-xs uppercase text-gray-500'>Участник</p>
              <p className='text-sm font-medium text-gray-900'>{data.enrollment.fullName}</p>
              {data.enrollment.state ? (
                <p className='text-xs text-gray-500'>
                  {enrollmentLabels[data.enrollment.state] ?? data.enrollment.state}
                </p>
              ) : null}
            </div>
            <div>
              <p className='text-xs uppercase text-gray-500'>Статус анкеты</p>
              <p className='text-sm font-medium text-gray-900'>
                {statusLabels[data.survey.status] ?? data.survey.status}
              </p>
              {data.response?.state ? (
                <p className='text-xs text-gray-500'>
                  {responseLabels[data.response.state] ?? data.response.state}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {schema ? (
          <GeneratedForm
            schema={schema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onChange={handleChange}
            submitLabel='Завершить анкету'
            submittingLabel='Отправляем...'
            hideResetButton={false}
            isSubmitting={mutation.isPending}
            isReadOnly={false}
            showSubmissionPreview={false}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg text-gray-900'>Анкета пока не содержит вопросов</CardTitle>
              <CardDescription className='text-gray-600'>
                Обратитесь к организатору для уточнения статуса анкеты.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}

type SurveyStartScreenProps = {
  session: PublicSurveySession
  onStart: () => void
  isStarting: boolean
}

function SurveyStartScreen({ session, onStart, isStarting }: SurveyStartScreenProps) {
  const { survey, enrollment } = session
  const contact = enrollment.email ?? enrollment.phone ?? '—'
  const closesAt = survey.endsAt ? formatDateTime(survey.endsAt) : null

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
      <Card className='w-full max-w-2xl border-none bg-white/90 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm'>
        <CardHeader className='space-y-4'>
          <div className='flex items-start gap-3'>
            <div className='rounded-full bg-indigo-100 p-2 text-indigo-600'>
              <PlayCircle className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-2xl font-semibold text-gray-900'>{survey.title}</CardTitle>
              <CardDescription className='text-gray-600'>
                {survey.description || 'Проверьте данные и начните прохождение анкеты.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-4 text-sm text-gray-700 sm:grid-cols-2'>
            <div>
              <p className='text-xs uppercase text-gray-500'>Участник</p>
              <p className='mt-1 font-medium text-gray-900'>{enrollment.fullName}</p>
              {enrollment.state ? (
                <p className='text-xs text-gray-500'>
                  {enrollmentLabels[enrollment.state] ?? enrollment.state}
                </p>
              ) : null}
            </div>
            <div>
              <p className='text-xs uppercase text-gray-500'>Контакты</p>
              <p className='mt-1 font-medium text-gray-900'>{contact}</p>
              {enrollment.email && enrollment.phone ? (
                <p className='text-xs text-gray-500'>{enrollment.phone}</p>
              ) : null}
            </div>
            <div>
              <p className='text-xs uppercase text-gray-500'>Статус анкеты</p>
              <p className='mt-1 font-medium text-gray-900'>
                {statusLabels[survey.status] ?? survey.status}
              </p>
              <p className='text-xs text-gray-500'>
                Формат: {survey.mode === 'bot' ? 'Через бота' : 'Администратор'}
              </p>
            </div>
            {closesAt ? (
              <div>
                <p className='text-xs uppercase text-gray-500'>Доступно до</p>
                <p className='mt-1 font-medium text-gray-900'>{closesAt}</p>
                <p className='text-xs text-gray-500'>После этого ответы могут не приниматься.</p>
              </div>
            ) : null}
          </div>
          <div className='space-y-2'>
            <Button
              className='w-full gap-2 text-base font-medium'
              size='lg'
              onClick={onStart}
              disabled={isStarting}
            >
              {isStarting ? <Loader2 className='h-4 w-4 animate-spin' /> : <PlayCircle className='h-4 w-4' />}
              {isStarting ? 'Запускаем...' : 'Начать анкетирование'}
            </Button>
            <p className='text-center text-xs text-gray-500'>
              Нажимая кнопку, вы подтверждаете, что данные участника корректны и готовы к отправке.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type SurveyExpiredNoticeProps = {
  session: PublicSurveySession
  onRetry: () => void
}

function SurveyExpiredNotice({ session, onRetry }: SurveyExpiredNoticeProps) {
  const expiresAt = session.survey.endsAt ? formatDateTime(session.survey.endsAt) : null

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
      <Card className='w-full max-w-xl border-red-200 bg-red-50 shadow-lg ring-1 ring-red-200/60'>
        <CardHeader className='flex items-start gap-3'>
          <AlertCircle className='h-6 w-6 text-red-500' />
          <div>
            <CardTitle className='text-lg font-semibold text-red-700'>Приглашение недействительно</CardTitle>
            <CardDescription className='text-sm text-red-600'>
              {session.enrollment.fullName}, срок действия вашего приглашения истёк
              {expiresAt && expiresAt !== '—' ? ` ${expiresAt}.` : '.'} Обратитесь к организатору за новой ссылкой.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between'>
          <span className='text-xs sm:max-w-[60%]'>Если вы считаете, что это ошибка, обновите страницу или запросите повторное приглашение.</span>
          <Button variant='outline' className='gap-2' onClick={onRetry}>
            <RefreshCcw className='h-4 w-4' />
            Обновить
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

type SurveyCompletionScreenProps = {
  session: PublicSurveySession
  onReload: () => void
}

function SurveyCompletionScreen({ session, onReload }: SurveyCompletionScreenProps) {
  const submittedAt = session.response?.submittedAt ? formatDateTime(session.response.submittedAt) : null

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
      <Card className='w-full max-w-2xl border-none bg-white/90 shadow-lg ring-1 ring-emerald-200/70 backdrop-blur-sm'>
        <CardHeader className='flex flex-col items-center gap-3 text-center'>
          <div className='rounded-full bg-emerald-100 p-3 text-emerald-600'>
            <CheckCircle2 className='h-6 w-6' />
          </div>
          <CardTitle className='text-2xl font-semibold text-gray-900'>Анкета пройдена</CardTitle>
          <CardDescription className='text-gray-600'>
            Спасибо, {session.enrollment.fullName}! Ваши ответы отправлены организатору
            {submittedAt && submittedAt !== '—' ? ` ${submittedAt}.` : '.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-gray-600'>
          <p>
            Сохраните подтверждение о прохождении или закройте страницу. При необходимости вы можете обновить данные, чтобы повторно загрузить ответы.
          </p>
          <Button variant='outline' className='w-full gap-2 sm:w-auto' onClick={onReload}>
            <RefreshCcw className='h-4 w-4' />
            Обновить данные
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function TokenMissingNotice() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12'>
      <Card className='w-full'>
        <CardHeader className='flex items-start gap-2'>
          <AlertCircle className='h-5 w-5 text-red-500' />
          <div>
            <CardTitle>Токен не найден</CardTitle>
            <CardDescription>
              Ссылка не содержит токен доступа. Убедитесь, что вы перешли по полной ссылке из приглашения.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
