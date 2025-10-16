'use client'

import { useQuery } from '@tanstack/react-query'
import { getPublicSurveySession } from '../api/getPublicSurveySession'

export const publicSurveySessionKey = (slug: string | undefined, token: string | undefined) =>
  ['public-survey-session', slug ?? '', token ?? ''] as const

export function usePublicSurveySession(publicSlug: string | undefined, token: string | undefined) {
  const enabled = Boolean(publicSlug) && Boolean(token)

  return useQuery({
    queryKey: publicSurveySessionKey(publicSlug, token),
    queryFn: () => getPublicSurveySession(publicSlug ?? '', token ?? ''),
    enabled,
    staleTime: 0,
    retry: false,
  })
}
