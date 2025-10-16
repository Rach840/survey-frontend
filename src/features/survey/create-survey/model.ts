'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { SurveyStatus } from '@/entities/surveys/types'

export type EnrollmentCreatePayload = {
  full_name: string
  email?: string
  phone?: string
  telegram_chat_id?: number
}

export type CreateSurveyPayload = {
  template_id: number
  title: string
  invitationMode: 'admin' | 'bot'
  status: SurveyStatus
  participants: EnrollmentCreatePayload[]
  max_participants?: number
  public_slug?: string
  starts_at?: string
  ends_at?: string
}

export function useSurveyCreate() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: CreateSurveyPayload) => {
      const response = await fetch('/api/survey/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('survey create failed')
      }

      return response.json().catch(() => null)
    },
    onSuccess: () => {
      router.push('/admin/survey')
      router.refresh()
    },
  })
}
