'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { templatesByMeKey } from '@/entities/templates/model/templateQuery'

interface TemplateCreatePayload {
  title: string
  description: string
  version: number
  sections: string
}

export function useTemplateCreate() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: TemplateCreatePayload) => {
      const response = await fetch('/api/template/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('template create failed')
      }

      return response.json().catch(() => ({ ok: true }))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesByMeKey })
      router.refresh()
    },
  })
}
