import  SurveyParticipantPage from '@/pages/surveys-page/participant-detail'

export default function SurveyParticipantRoute({
  params,
}: {
  params: { surveyId: string; participantId: string }
}) {
  return <SurveyParticipantPage surveyId={params.surveyId} participantId={params.participantId} />
}
