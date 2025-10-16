import { cookies } from 'next/headers'

export async function GET() {
    const jar = await cookies()
    const access = jar.get('__Host-access')?.value
    if (!access) return new Response('Unauthorized', { status: 401 })
    console.log(access)

    const r = await fetch(`http://localhost:8080/api/auth/me`, {
        headers: { authorization: `Bearer ${access}` },
        cache: 'no-store',
    })
    if (!r.ok) return new Response('Unauthorized', { status: 401 })
    const { id, email, full_name, role } = await r.json()
    return Response.json({ id, email, full_name, role })
}