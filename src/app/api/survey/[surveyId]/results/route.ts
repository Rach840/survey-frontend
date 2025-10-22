import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/shared/api/base-url'
import ensureAccess from "@/shared/api/cookie";


export async function GET(
    req: NextRequest,
    context: { params: Promise<{ surveyId: string }> },
) {
    try {
        const { surveyId } = await context.params
        const access = await ensureAccess()

        const upstream = await fetch(`${getApiBaseUrl()}/api/survey/${surveyId}/results`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access}`,
            },
            cache: 'no-store',
        })

        if (!upstream.ok) {
            throw new Response(await upstream.text(), { status: upstream.status })
        }
        const data = await upstream.json()
        return NextResponse.json(data)
    } catch (error) {
        if (error instanceof Response) {
            return error
        }
        return new Response('Failed to load survey', { status: 500 })
    }
}
