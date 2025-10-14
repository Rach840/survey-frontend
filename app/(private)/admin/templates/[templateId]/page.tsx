import { TemplatePreviewPage } from '@/pages/template-page'

export default function TemplatePreviewRoute({ params }: { params: { templateId: string } }) {
  return <TemplatePreviewPage templateId={params.templateId} />
}
