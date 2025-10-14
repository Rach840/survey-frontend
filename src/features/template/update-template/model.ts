'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { templateDetailKey } from '@/entities/templates/model/templateDetailQuery'
import { templatesByMeKey } from '@/entities/templates/model/templateQuery'

interface TemplateUpdatePayload {
  title: string
  description: string
  version: number
  sections: string
}

export function useTemplateUpdate(templateId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: TemplateUpdatePayload) => {
      const response = await fetch(`/api/template/${templateId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('template update failed')
      }

      return response.json().catch(() => ({ ok: true }))
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: templatesByMeKey }),
        queryClient.invalidateQueries({ queryKey: templateDetailKey(templateId) }),
      ])
      router.refresh()
    },
  })
}
