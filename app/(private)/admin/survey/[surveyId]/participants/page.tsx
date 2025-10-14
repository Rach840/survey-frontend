import { SurveyParticipantsPage } from '@/pages/surveys-page'

export default function SurveyParticipantsRoute({
  params,
}: {
  params: { surveyId: string }
}) {
  return <SurveyParticipantsPage surveyId={params.surveyId} />
}
