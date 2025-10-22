import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/shared/api/base-url'
import ensureAccess from "@/shared/api/cookie";


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
    const rawPayload = await req.json().catch(() => ({}))
    const access = await ensureAccess()
    const { surveyId } = await context.params
    console.log('asdfadsf',rawPayload)
    const upstreamPayload: Record<string, unknown> = {}

    if (rawPayload.title !== undefined) {
      upstreamPayload.title = rawPayload.title
    }

    if (rawPayload.invitationMode !== undefined) {
      upstreamPayload.invitationMode = rawPayload.invitationMode
    }

    if (rawPayload.status !== undefined) {
      upstreamPayload.status = rawPayload.status
    }

    if (rawPayload.maxParticipants !== undefined) {
      upstreamPayload.max_participants = rawPayload.maxParticipants ?? null
    }

    if (rawPayload.public_slug !== undefined) {
      upstreamPayload.public_slug =rawPayload.public_slug ?? null
    }

    if (rawPayload.starts_at !== undefined) {
      upstreamPayload.starts_at = rawPayload.starts_at ?? null
    }

    if (rawPayload.ends_at !== undefined) {
      upstreamPayload.ends_at =  rawPayload.ends_at ?? null
    }
    console.log('upstream',upstreamPayload)
    const upstream = await forwardRequest(req, surveyId, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(upstreamPayload),
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
