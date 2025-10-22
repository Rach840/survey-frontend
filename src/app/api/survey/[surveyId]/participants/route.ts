import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

import {getApiBaseUrl} from '@/shared/api/base-url'
import ensureAccess from "@/shared/api/cookie";


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> },
) {
  try {
    const access = await ensureAccess()
    const payload = await req.json().catch(() => ({}))
    const { surveyId } = await context.params
    const upstream = await fetch(`${getApiBaseUrl()}/api/survey/${surveyId}/participants`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to add participant', error)
    return new Response('Failed to add participant', { status: 500 })
  }
}
