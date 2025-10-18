'use client'

import { useParams } from 'next/navigation'

import SurveyPage from '@/pages/survey-page'

export default function PublicSurveyEntry() {
  const params = useParams<{ publicSlug: string }>()
  const publicSlug = params?.publicSlug

  if (!publicSlug) {
    return null
  }

  return <SurveyPage token={publicSlug} />
}
