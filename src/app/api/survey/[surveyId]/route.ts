import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {getApiBaseUrl} from '@/shared/api/base-url'

async function ensureAccess() {
  const jar = await cookies()
  const access = jar.get('__Host-access')?.value

  if (!access) {
    throw new Response('Unauthorized', { status: 401 })
  }

  return access
}

async function forwardRequest(
  req: Request,
  surveyId: string,
  init: RequestInit,
) {
  const url = new URL(req.url)
  console.log(`${getApiBaseUrl()}/api/survey/${surveyId}${url.search}`,init)
  const upstream = await fetch(`${getApiBaseUrl()}/api/survey/${surveyId}${url.search}`, {
    ...init,
    cache: 'no-store',
  })

  if (!upstream.ok) {
    throw new Response(await upstream.text(), { status: upstream.status })
  }

  return upstream
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> },
) {
  try {
    const { surveyId } = await context.params
    const access = await ensureAccess()
    const upstream = await forwardRequest(req, surveyId, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return new Response('Failed to load survey', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> },
) {
  try {
    const payload = await req.json()
    const access = await ensureAccess()
    const { surveyId } = await context.params
    const upstream = await forwardRequest(req, surveyId, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await upstream.json().catch(() => ({ ok: true }))
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return new Response('Failed to update survey', { status: 500 })
  }
}
