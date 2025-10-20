import SurveyResultDetailPage from '@/pages/surveys-page/results/SurveyResultDetailPage'

export default function SurveyResultDetailRoute({
  params,
}: {
  params: { surveyId: string; enrollmentId: string }
}) {
  return <SurveyResultDetailPage surveyId={params.surveyId} enrollmentId={params.enrollmentId} />
}
