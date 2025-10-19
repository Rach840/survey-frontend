'use client'

import {useQuery} from '@tanstack/react-query'

import {getSurveyStatistics} from '../api/getSurveyStatistics'

export const surveyStatisticsKey = (surveyId: string | number) => ['survey-statistics', String(surveyId)] as const

export function useSurveyStatistics(surveyId: string | number, enabled = true) {
  return useQuery({
    queryKey: surveyStatisticsKey(surveyId),
    queryFn: () => getSurveyStatistics(String(surveyId)),
    enabled: enabled && Boolean(surveyId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
