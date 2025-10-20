'use client'

import {useQuery} from '@tanstack/react-query'

import {getSurveyResult} from '@/entities/surveys/api/getSurveyResult'

export const surveyResultKey = (surveyId: string | number, enrollmentId: string | number) =>
  ['survey-result', String(surveyId), String(enrollmentId)] as const

export function useSurveyResult(surveyId: string | number, enrollmentId: string | number, enabled = true) {
  return useQuery({
    queryKey: surveyResultKey(surveyId, enrollmentId),
    queryFn: () => getSurveyResult({ surveyId: String(surveyId), enrollmentId: String(enrollmentId) }),
    enabled: enabled && Boolean(surveyId) && Boolean(enrollmentId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
