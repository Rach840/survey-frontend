import {getApiBaseUrl} from '@/shared/api/base-url'
import ensureAccess from "@/shared/api/cookie";


export async function GET() {
  const access = await ensureAccess()
  console.log(`${getApiBaseUrl()}/api/survey/`)
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
