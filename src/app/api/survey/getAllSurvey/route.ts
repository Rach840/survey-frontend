import { cookies } from 'next/headers'
import { getApiBaseUrl } from '@/shared/api/base-url'

async function ensureAccess() {
  const jar = await cookies()
  const access = jar.get('__Host-access')?.value

  if (!access) {
    throw new Response('Unauthorized', { status: 401 })
  }

  return access
}

export async function GET() {
  const access = await ensureAccess()
  const upstream = await fetch(`${getApiBaseUrl()}/api/survey/`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${access}`,
    },
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return new Response(await upstream.text(), { status: upstream.status })
  }

  const data = await upstream.json()
  console.log(data)
  return Response.json(data)
}
