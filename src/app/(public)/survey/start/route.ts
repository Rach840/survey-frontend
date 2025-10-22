import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

import {getApiBaseUrl} from '@/shared/api/base-url'

const API_BASE = getApiBaseUrl()

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const upstream = await fetch(`${API_BASE}/api/survey/start`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!upstream.ok) {
      throw new Response(await upstream.text(), { status: upstream.status })
    }

    const data = await upstream.json().catch(() => ({ ok: true }))
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('Failed to start survey session', error)
    return new Response('Failed to start survey session', { status: 500 })
  }
}
