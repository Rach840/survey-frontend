import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/shared/api/base-url'

const API_BASE = getApiBaseUrl()

function getAuthHeader(req: NextRequest) {
  const authorization = req.headers.get('authorization')
  if (!authorization) {
    throw new Response('Missing token', { status: 401 })
  }
  return authorization
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ publicSlug: string }> },
) {
  try {
    const { publicSlug } = await context.params
    const authorization = getAuthHeader(req)
    const payload = await req.json()

    const upstream = await fetch(
      `${API_BASE}/api/public/survey/${encodeURIComponent(publicSlug)}/responses`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: authorization,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    )

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const data = await upstream.json().catch(() => ({ ok: true }))
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('Failed to submit survey response', error)
    return new Response('Failed to submit survey response', { status: 500 })
  }
}
