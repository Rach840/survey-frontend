import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'

import {getApiBaseUrl} from '@/shared/api/base-url'

async function ensureAccessToken() {
  const cookieStore = await cookies()
  const access = cookieStore.get('__Host-access')?.value

  if (!access) {
    throw new Response('Unauthorized', { status: 401 })
  }

  return access
}

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAccessToken()
    const searchParams = request.nextUrl.searchParams
    const enrollmentId = searchParams.get('enrollment')
    const surveyId = searchParams.get('survey')

    if (!enrollmentId || !surveyId) {
      return new Response('Missing query params: enrollment, survey', { status: 400 })
    }

    const upstreamUrl = new URL(`${getApiBaseUrl()}/api/survey/enrollment/extend`)
    upstreamUrl.searchParams.set('enrollment', enrollmentId)
    upstreamUrl.searchParams.set('survey', surveyId)

    const body = await request.json().catch(() => ({}))

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
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
