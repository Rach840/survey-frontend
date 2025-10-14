'use client'

import { useQuery } from '@tanstack/react-query'
import { getTemplateById } from '@/entities/templates/api/getTemplateById'

export const templateDetailKey = (templateId: string | number) => ['template-detail', String(templateId)] as const

export function useTemplateDetail(templateId: string | number, enabled = true) {
  return useQuery({
    queryKey: templateDetailKey(templateId),
    queryFn: () => getTemplateById(String(templateId)),
    enabled: enabled && Boolean(templateId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
