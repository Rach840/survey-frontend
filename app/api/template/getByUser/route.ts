import {cookies} from "next/headers";
import {NextResponse} from "next/server";

export async function GET() {
    const jar = await cookies()
    console.log('afdsf')
    const access = jar.get('__Host-access')?.value
    if (!access) return new Response('Unauthorized', { status: 401 })
    const r = await fetch(`http://localhost:8080/api/template/`, {
        method: 'GET',
        headers: {  'content-type': 'application/json' ,Authorization: `Bearer ${access}` },
        cache: 'no-store',
    })
    if (!r.ok) return new Response(await r.text(), { status: r.status })
    const res =await   r.json()
    console.log(res)
    return Response.json(res)
}