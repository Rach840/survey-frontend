import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'

import {getApiBaseUrl} from '@/shared/api/base-url'

async function ensureAccessToken() {
  const jar = await cookies()
  const access = jar.get('__Host-access')?.value

  if (!access) {
    throw new Response('Unauthorized', { status: 401 })
  }

  return access
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ surveyId: string; participantId: string }> },
) {
  try {
    const access = await ensureAccessToken()
    const { surveyId, participantId } = await context.params

    const upstream = await fetch(
      `${getApiBaseUrl()}/api/survey/${surveyId}/participants/${participantId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access}`,
          'content-type': 'application/json',
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

    console.error('Failed to remove survey participant', error)
    return new Response('Failed to remove survey participant', { status: 500 })
  }
}
