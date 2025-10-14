'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export type ParticipantPayload = {
  email: string
  firstName?: string
  lastName?: string
}

export type CreateSurveyPayload = {
  title: string
  description?: string
  templateId: number
  invitationMode: 'manual' | 'bot'
  participants?: ParticipantPayload[]
  maxParticipants?: number
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
