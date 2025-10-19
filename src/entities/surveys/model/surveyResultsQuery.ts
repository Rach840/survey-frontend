'use client'

import {useQuery} from '@tanstack/react-query'
import {getSurveyResults} from "@/entities/surveys/api/getSurveyResults";

export const surveyDetailKey = (surveyId: string | number) => ['survey-detail', String(surveyId)] as const

export function useSurveyResults(surveyId: string | number, enabled = true) {
  return useQuery({
    queryKey: surveyDetailKey(surveyId),
    queryFn: () => getSurveyResults(String(surveyId)),
    enabled: enabled && Boolean(surveyId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
