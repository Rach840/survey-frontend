'use client'

import { useQuery } from '@tanstack/react-query'
import { getSurveyDetail } from '../api/getSurveyDetail'
import {getSurveys} from "@/entities/surveys/api/getSurveys";

export const surveysKey = () => ['survey'] as const

export function useSurveys() {
  return useQuery({
    queryKey: surveysKey(),
    queryFn: () => getSurveys(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
