import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/shared/api/base-url'

const API_BASE = getApiBaseUrl()

function buildUpstreamUrl(req: NextRequest, publicSlug: string) {
  const url = new URL(req.url)
  return `${API_BASE}/api/survey/access?token=${encodeURIComponent(publicSlug)}${url.search}`
}


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ publicSlug: string }> },
) {
  try {
    const { publicSlug } = (await context.params)
    console.log('asfsdf',buildUpstreamUrl(req, publicSlug))
    const upstream = await fetch(buildUpstreamUrl(req, publicSlug), {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('Failed to load public survey', error)
    return new Response('Failed to load public survey', { status: 500 })
  }
}
