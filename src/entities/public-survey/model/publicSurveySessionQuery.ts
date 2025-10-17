'use client'

import {useQuery} from '@tanstack/react-query'
import {getPublicSurveySession} from '../api/getPublicSurveySession'

export const publicSurveySessionKey = (token: string | undefined) =>
  ['public-survey-session',  token ?? ''] as const

export function usePublicSurveySession(token: { publicSlug: string } | undefined) {
  const enabled =Boolean(token.publicSlug)
  return useQuery({
    queryKey: publicSurveySessionKey(token.publicSlug),
    queryFn: () => getPublicSurveySession( token.publicSlug ?? ''),
    enabled,
    staleTime: 0,
    retry: false,
  })
}
