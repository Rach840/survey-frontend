import type {NextRequest} from 'next/server'

import {getApiBaseUrl} from '@/shared/api/base-url'
import ensureAccessToken from "@/shared/api/cookie";

export async function GET(request: NextRequest, context: { params: Promise<{ surveyId: string }> }) {
  try {
    const { surveyId } = await context.params
    const access = await ensureAccessToken()
    const search = request.nextUrl.searchParams
    const upstreamUrl = new URL(`${getApiBaseUrl()}/api/survey/${surveyId}/export`)
    search.forEach((value, key) => upstreamUrl.searchParams.set(key, value))

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

    const buffer = await upstream.arrayBuffer()
    const headers = new Headers()
    const contentType = upstream.headers.get('content-type')
    if (contentType) headers.set('content-type', contentType)
    const disposition = upstream.headers.get('content-disposition')
    if (disposition) headers.set('content-disposition', disposition)
    headers.set('content-length', buffer.byteLength.toString())
    headers.set('cache-control', 'no-store')

    return new Response(buffer, {
      status: upstream.status,
      headers,
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    console.error('Failed to export-survey survey results', error)
    return new Response('Failed to export-survey survey results', { status: 500 })
  }
}
