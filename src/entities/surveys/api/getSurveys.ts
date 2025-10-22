import {apiFetch} from '@/shared'
import {SurveyWithStatistic} from "@/entities/surveys/types";

export async function getSurveys(): Promise<SurveyWithStatistic[]> {
    const response = await apiFetch(`/api/survey/getAllSurvey`)

    if (!response.ok) {
        throw new Error('Failed to load survey')
    }
    const resp = await response.json()
    console.log('asdas',resp)
    return resp
}
