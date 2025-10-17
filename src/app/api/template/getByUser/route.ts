import { cookies } from 'next/headers'
import { getApiBaseUrl } from '@/shared/api/base-url'

export async function GET() {
  const jar = await cookies()
  const access = jar.get('__Host-access')?.value

  if (!access) {
    return new Response('Unauthorized', { status: 401 })
  }

  const upstream = await fetch(`${getApiBaseUrl()}/api/template/`, {
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
