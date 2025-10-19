import SurveyDetailPage from '@/pages/surveys-page/detail';

export default function SurveyDetailRoute({
  params,
  searchParams,
}: {
  params: { surveyId: string }
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const editParam = searchParams?.edit
  const autoOpenEdit = Array.isArray(editParam) ? editParam.length > 0 : Boolean(editParam)

  return <SurveyDetailPage surveyId={params.surveyId} autoOpenEdit={autoOpenEdit} />
}
