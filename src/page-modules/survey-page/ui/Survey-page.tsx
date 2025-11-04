'use client'

import {useEffect, useMemo, useState} from 'react'

import {usePublicSurveySession,} from '@/entities/public-survey'
import {clearDraft, readDraft} from '@/entities/surveys/lib'
import {Skeleton} from '@/shared/ui/skeleton'
import {useStartMutation} from "@/features/survey/start-survey";
import {
  SurveyCompletionScreen,
  SurveyError,
  SurveyExpiredNotice,
  SurveyStartScreen,
  TokenMissingNotice
} from "@/features/survey/ui/states";
import {SurveyForm} from "@/pages/survey-page/ui/Survey-form";

type SurveyPageProps = {
  token?: string
}

const STORAGE_PREFIX = 'survey-response:v1:'







export  default  function SurveyPage({token }: SurveyPageProps) {
  if (!token) {
    return <TokenMissingNotice />
  }
  return <SurveyPageContent token={token} />
}


function SurveyPageContent({  token }: {
  token: string
}) {

  const { data, isLoading, isError, error, refetch } = usePublicSurveySession( token)
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>()


  const enrollmentState = data?.enrollment.state
  const hasResponse = Boolean(data?.response)
  const [isSubmitted,setIsSubmitted] = useState<boolean>(false)
  const isExpired = enrollmentState === 'expired'
  const hasStarted = hasResponse || enrollmentState === 'pending' || enrollmentState === 'active'
  const shouldShowIntro = Boolean(data) && !isSubmitted && !isExpired && !hasStarted

  const storageKey = useMemo(() => {
    if (!data || !hasStarted) return undefined
    return `${STORAGE_PREFIX}${token}:${data.enrollment.id}`
  }, [data, hasStarted, token])

  const {mutate: start, isPending: startPending} = useStartMutation(token,storageKey)

  const shouldShowForm = Boolean(data) && !isSubmitted && !isExpired && !shouldShowIntro

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

  if (isError && !isSubmitted|| !data && !isSubmitted) {
    <SurveyError error={error} refetch={refetch}   />
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
        pending={startPending}
        startMutation={start}
        isStarting={startPending}
      />
    )
  }
return (
    <SurveyForm token={token} setIsSubmited={setIsSubmitted} shouldShowForm={ shouldShowForm} storageKey={storageKey || ''} initialValues={initialValues} isSubmitted={ isSubmitted}   data={data} />
)
}