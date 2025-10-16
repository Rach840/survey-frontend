import { SurveyPage } from '@/pages/survey-page'

type PageProps = {
  params: { publicSlug: string }
  searchParams: { token?: string | string[] }
}

export default function PublicSurveyEntry({ params, searchParams }: PageProps) {
  const tokenParam = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token

  return <SurveyPage publicSlug={params.publicSlug} token={tokenParam} />
}
