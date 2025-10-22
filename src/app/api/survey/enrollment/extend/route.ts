import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

import {getApiBaseUrl} from '@/shared/api/base-url'
import ensureAccessToken from "@/shared/api/cookie";


export async function POST(request: NextRequest) {
  try {
    const access = await ensureAccessToken()

    const searchParams = request.nextUrl.searchParams
    const enrollmentId = searchParams.get('enrollment')
    const surveyId = searchParams.get('survey')

    if (!enrollmentId || !surveyId) {
      return new Response('Missing query params: enrollment, survey', { status: 400 })
    }

    const upstreamUrl = new URL(`${getApiBaseUrl()}/api/survey/${surveyId}/participants/token`)
    console.log(upstreamUrl)
    const body = await request.json().catch(() => ({}))
    console.log({expires_at: body.expires_at,enrollmentId:Number(enrollmentId)})
    const upstream = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${access}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({expires_at: body.expires_at,enrollmentId:Number(enrollmentId)}),
      cache: 'no-store',
    })

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const payload = await upstream.json().catch(() => ({}))
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to extend enrollment token', error)
    return new Response('Failed to extend enrollment token', { status: 500 })
  }
}
