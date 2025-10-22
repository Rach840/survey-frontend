'use client'

import {useQuery} from '@tanstack/react-query'
import {getPublicSurveySession} from '@/entities/public-survey'

export const publicSurveySessionKey = (publicSlug: string | undefined) =>
  ['public-survey-session', publicSlug ?? ''] as const

export function usePublicSurveySession(publicSlug: string | undefined) {
  const enabled = Boolean(publicSlug)

  return useQuery({
    queryKey: publicSurveySessionKey(publicSlug),
    queryFn: () => getPublicSurveySession(publicSlug ?? ''),
    enabled,
    staleTime: 0,
    retry: false,
  })
}
