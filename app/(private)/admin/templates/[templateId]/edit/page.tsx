import { TemplateEditPage } from '@/pages/template-page'

export default function TemplateEditRoute({ params }: { params: { templateId: string } }) {
  return <TemplateEditPage templateId={params.templateId} />
}
