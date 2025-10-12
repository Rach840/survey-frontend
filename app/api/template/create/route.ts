import { NextResponse } from 'next/server';
import {cookies} from "next/headers";


export async function POST(req: Request) {

    const payload = await req.json()

    const jar = await cookies()
    const access = jar.get('__Host-access')?.value
    if (!access) return new Response('Unauthorized', { status: 401 })
    console.log(access)
    const r = await fetch(`http://localhost:8080/api/admin/template/create`, {
        method: 'POST',
        headers: {  'content-type': 'application/json' ,authorization: `Bearer ${access}` },
        body: JSON.stringify(payload),
        cache: 'no-store',
    })
    console.log('asdfsdf',payload)
    if (!r.ok) return new Response(await r.text(), { status: r.status })
    const res = NextResponse.json({ ok: true })
    return res
}