'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {AlertCircle, CheckCircle2, RefreshCcw} from 'lucide-react'
import {toast} from 'sonner'

import {publicSurveySessionKey, submitPublicSurveyResponse, usePublicSurveySession,} from '@/entities/public-survey'
import {sectionsToDynamicForm} from '@/entities/templates/lib/toDynamicForm'
import type {EnrollmentState, ResponseState, SurveyStatus} from '@/entities/surveys/types'
import {GeneratedForm} from '@/features/template/generated'
import {Button} from '@/shared/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card'
import {Skeleton} from '@/shared/ui/skeleton'

type SurveyPageProps = {
  token?: string
}

const STORAGE_PREFIX = 'survey-response:v1:'
const AUTOSAVE_DELAY = 600

type DraftPayload = {
  updatedAt: number
  values: Record<string, unknown>
}

const enrollmentLabels: Partial<Record<EnrollmentState, string>> = {
  invited: 'Приглашён',
  pending: 'Ожидает',
  approved: 'Одобрен',
  active: 'Активен',
  rejected: 'Отклонён',
  expired: 'Просрочен',
}

const responseLabels: Partial<Record<ResponseState, string>> = {
  in_progress: 'Черновик',
  submitted: 'Отправлено',
}

const surveyStatusLabels: Partial<Record<SurveyStatus, string>> = {
  draft: 'Черновик',
  open: 'Открыта',
  closed: 'Закрыта',
  archived: 'Архивирована',
}

function readDraft(key: string): DraftPayload | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DraftPayload
    if (!parsed || typeof parsed !== 'object' || typeof parsed.values !== 'object') {
      return null
    }
    return {
      updatedAt: Number(parsed.updatedAt) || Date.now(),
      values: parsed.values,
    }
  } catch (error) {
    console.warn('Failed to read survey draft', error)
    return null
  }
}

function writeDraft(key: string, values: Record<string, unknown>) {
  try {
    const payload: DraftPayload = {
      updatedAt: Date.now(),
      values,
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch (error) {
    console.warn('Failed to persist survey draft', error)
  }
}

function clearDraft(key: string) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear survey draft', error)
  }
}

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

  const storageKey = useMemo(() => {
    if (!data) return undefined
    return `${STORAGE_PREFIX}${token}:${data.enrollment.id}`
  }, [data])

  const isSubmitted = data?.response?.state === 'submitted'

  useEffect(() => {
    if (!data || !storageKey) {
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
  }, [data, storageKey])

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

  const mutation = useMutation({
    mutationFn: async (answers: Record<string, unknown>) => {
      return submitPublicSurveyResponse( token, {
        answers,
        channel: 'web',
      })
    },
    onSuccess: async () => {
      if (storageKey) {
        clearDraft(storageKey)
      }
      await queryClient.invalidateQueries({
        queryKey: publicSurveySessionKey( token),
      })
      toast.success('Ответы отправлены')
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
      await mutation.mutateAsync(values)
    },
    [isSubmitted, mutation],
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
                {surveyStatusLabels[data.survey.status] ?? data.survey.status}
              </p>
              {data.response?.state ? (
                <p className='text-xs text-gray-500'>
                  {responseLabels[data.response.state] ?? data.response.state}
                </p>
              ) : null}
            </div>
            {isSubmitted ? (
              <div className='col-span-full flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700'>
                <CheckCircle2 className='h-4 w-4 flex-shrink-0' />
                Ответ уже отправлен. Вы можете просмотреть его ниже.
              </div>
            ) : null}
          </CardContent>
        </Card>

        {schema ? (
          <GeneratedForm
            schema={schema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onChange={handleChange}
            submitLabel={isSubmitted ? 'Ответ уже отправлен' : 'Отправить ответы'}
            submittingLabel='Отправляем...'
            hideResetButton={isSubmitted}
            isSubmitting={mutation.isPending}
            isReadOnly={isSubmitted}
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
