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

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAccessToken()
    const searchParams = request.nextUrl.searchParams
    const enrollmentId = searchParams.get('enrollment')
    const surveyId = searchParams.get('survey')

    if (!enrollmentId || !surveyId) {
      return new Response('Missing query params: enrollment, survey', { status: 400 })
    }

    const upstreamUrl = new URL(`${getApiBaseUrl()}/api/survey/result`)
    upstreamUrl.searchParams.set('enrollment', enrollmentId)
    upstreamUrl.searchParams.set('survey', surveyId)

    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access}`,
      },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const payload = await upstream.json()
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to fetch survey result', error)
    return new Response('Failed to load survey result', { status: 500 })
  }
}
