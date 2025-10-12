import { NextResponse } from 'next/server';


export async function POST(req: Request) {

    const payload = await req.json()

    const r = await fetch(`http://localhost:8080/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
    })
    console.log('asdfsdf',payload)
    if (!r.ok) return new Response(await r.text(), { status: r.status })

    const { access_token, refresh_token, expires_in } = await r.json()
    const res = NextResponse.json({ ok: true })

    res.cookies.set({
        name: '__Host-access',
        value: access_token,
        httpOnly: true, secure: true, sameSite: 'lax', path: '/',
        maxAge: Math.min(expires_in ?? 900, 3600),
    })
    res.cookies.set({
        name: '__Host-refresh',
        value: refresh_token,
        httpOnly: true, secure: true, sameSite: 'lax', path: '/',
        maxAge: 60 * 60 * 24 * 30,
    })
    console.log(access_token,refresh_token)
    return res
}