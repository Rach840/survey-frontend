'use client'

import { useQuery } from '@tanstack/react-query'
import { getSurveyDetail } from '../api/getSurveyDetail'

export const surveyDetailKey = (surveyId: string | number) => ['survey-detail', String(surveyId)] as const

export function useSurveyDetail(surveyId: string | number, enabled = true) {
  return useQuery({
    queryKey: surveyDetailKey(surveyId),
    queryFn: () => getSurveyDetail(String(surveyId)),
    enabled: enabled && Boolean(surveyId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
