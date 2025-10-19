import {apiFetch} from '@/shared'
import type {Survey} from '../types'

export async function getSurveyResults(id: string): Promise<Survey[]> {
    const response = await apiFetch(`/api/survey/${id}/results`)

    if (!response.ok) {
        throw new Error('Failed to load survey')
    }
    const resp = await response.json()
    console.log('asdas',resp)
    return resp
}
