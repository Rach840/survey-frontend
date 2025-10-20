'use client'

import {useQuery} from '@tanstack/react-query'
import {getSurveyResults} from '@/entities/surveys/api/getSurveyResults'

export const surveyResultsKey = (surveyId: string | number) => ['survey-results', String(surveyId)] as const

export function useSurveyResults(surveyId: string | number, enabled = true) {
  return useQuery({
    queryKey: surveyResultsKey(surveyId),
    queryFn: () => getSurveyResults(String(surveyId)),
    enabled: enabled && Boolean(surveyId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
