'use client'

import { useParams } from 'next/navigation'

import TemplatePreviewPage from '@/pages/template-page/preview'

export default function TemplatePreviewRoute() {
  const params = useParams<{ templateId: string }>()
  const templateId = params?.templateId

  if (!templateId) {
    return null
  }

  return <TemplatePreviewPage templateId={templateId} />
}
