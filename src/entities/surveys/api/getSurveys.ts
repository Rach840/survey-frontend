import { apiFetch } from '@/shared'
import type {Survey, SurveyDetail} from '../types'

export async function getSurveys(): Promise<Survey[]> {
    const response = await apiFetch(`/api/survey/getAllSurvey`)

    if (!response.ok) {
        throw new Error('Failed to load survey')
    }
    const resp = await response.json()
    console.log('asdas',resp)
    return resp
}
