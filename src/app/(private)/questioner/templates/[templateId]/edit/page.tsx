import TemplateEditPage from '@/pages/template-page/edit-page'

export default function TemplateEditRoute({ params }: { params: { templateId: string } }) {
  return <TemplateEditPage templateId={params.templateId} />
}
