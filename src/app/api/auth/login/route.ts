import {NextResponse} from 'next/server'
import {getApiBaseUrl} from '@/shared/api/base-url'

export async function POST(req: Request) {
  const payload = await req.json()

  const upstream = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })


  if (!upstream.ok) {
    return new Response(await upstream.text(), { status: upstream.status })
  }

  const { access_token, refresh_token, expires_in } = await upstream.json()
  const res = NextResponse.json({ ok: true })

  res.cookies.set({
    name: '__Host-access',
    value: access_token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(expires_in ?? 900, 3600),
  })

  res.cookies.set({
    name: '__Host-refresh',
    value: refresh_token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  console.log(access_token, refresh_token)
  return res
}
