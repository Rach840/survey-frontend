import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/shared/api/base-url'

export async function POST() {
  const jar = await cookies()
  const refresh = jar.get('__Host-refresh')?.value

  if (!refresh) {
    return new Response('Unauthorized', { status: 401 })
  }

  const upstream = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return new Response('Unauthorized', { status: 401 })
  }

  const data = await upstream.json()
  console.log(data)

  const { access_token, refresh_token, expires_in } = data
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

  if (refresh_token) {
    res.cookies.set({
      name: '__Host-refresh',
      value: refresh_token,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  console.log('asdfasdfadfsf')
  return res
}
