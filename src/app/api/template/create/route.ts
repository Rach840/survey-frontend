import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getApiBaseUrl } from '@/shared/api/base-url'

export async function POST(req: Request) {
  const payload = await req.json()

  const jar = await cookies()
  const access = jar.get('__Host-access')?.value

  if (!access) {
    return new Response('Unauthorized', { status: 401 })
  }

  const upstream = await fetch(`${getApiBaseUrl()}/api/template/create`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${access}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  console.log('asdfsdf', upstream)

  if (!upstream.ok) {
    return new Response(await upstream.text(), { status: upstream.status })
  }

  return NextResponse.json({ ok: true })
}
