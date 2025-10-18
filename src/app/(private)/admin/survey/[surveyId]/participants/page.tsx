
import SurveyParticipantsPage from "@/pages/surveys-page/participants";

export default function SurveyParticipantsRoute({
  params,
}: {
  params: { surveyId: string }
}) {
  return <SurveyParticipantsPage surveyId={params.surveyId} />
}
