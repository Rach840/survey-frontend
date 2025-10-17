import { cookies } from 'next/headers'
import { getApiBaseUrl } from '@/shared/api/base-url'

export async function GET() {
  const jar = await cookies()
  const access = jar.get('__Host-access')?.value

  if (!access) {
    return new Response('Unauthorized', { status: 401 })
  }

  console.log(access)

  const upstream = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { authorization: `Bearer ${access}` },
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id, email, full_name, role } = await upstream.json()
  return Response.json({ id, email, full_name, role })
}
