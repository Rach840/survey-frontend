import SurveyResultsPage from '@/pages/surveys-page/results'

export default function SurveyResultsRoute({
  params,
}: {
  params: { surveyId: string }
}) {
  return <SurveyResultsPage surveyId={params.surveyId} />
}
