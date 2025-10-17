'use client'


import SurveyPage from '@/pages/survey-page'
import {useParams} from "next/navigation";

type PageProps = {
  params: { publicSlug: string }
  searchParams: { token?: string | string[] }
}

export default function PublicSurveyEntry() {
  const params = useParams()
  console.log(params)
  // console.log(params,'SEARCH',searchParams)
  return <SurveyPage token={params} />
}
