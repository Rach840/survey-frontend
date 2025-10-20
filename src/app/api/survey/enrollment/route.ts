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

function buildUpstreamUrl(path: string, searchParams: URLSearchParams) {
  const url = new URL(path)
  searchParams.forEach((value, key) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })
  return url
}

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAccessToken()
    const searchParams = request.nextUrl.searchParams
    const surveyId = searchParams.get('survey')

    if (!surveyId) {
      return new Response('Missing query params: survey', { status: 400 })
    }

    const body = await request.json().catch(() => ({}))

    const upstream = await fetch(
      buildUpstreamUrl(`${getApiBaseUrl()}/api/survey/enrollment`, searchParams),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      },
    )

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const payload = await upstream.json().catch(() => ({}))
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to add participant', error)
    return new Response('Failed to add participant', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await ensureAccessToken()
    const searchParams = request.nextUrl.searchParams
    const surveyId = searchParams.get('survey')
    const enrollmentId = searchParams.get('enrollment')

    if (!surveyId || !enrollmentId) {
      return new Response('Missing query params: survey, enrollment', { status: 400 })
    }

    const upstream = await fetch(
      buildUpstreamUrl(`${getApiBaseUrl()}/api/survey/enrollment`, searchParams),
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access}`,
        },
        cache: 'no-store',
      },
    )

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to remove participant', error)
    return new Response('Failed to remove participant', { status: 500 })
  }
}
