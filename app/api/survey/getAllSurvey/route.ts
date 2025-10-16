import {cookies} from "next/headers";

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
    const r = await fetch(`http://localhost:8080/api/survey/`, {
        method: 'GET',
        headers: {  'content-type': 'application/json' ,Authorization: `Bearer ${access}` },
        cache: 'no-store',
    })
    if (!r.ok) return new Response(await r.text(), { status: r.status })
    const res =await   r.json()
    console.log(res)
    return Response.json(res)
}