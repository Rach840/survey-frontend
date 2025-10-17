'use client'
import TemplatePreviewPage from '@/pages/template-page/preview'
import {useParams} from "next/navigation";

export default function TemplatePreviewRoute() {
  const params = useParams()
  console.log(params.templateId)
  return <TemplatePreviewPage templateId={params.templateId} />
}
