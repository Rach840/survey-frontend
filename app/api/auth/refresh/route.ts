import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const jar = await cookies()
    const refresh = jar.get('__Host-refresh')?.value
    console.log(refresh)
    if (!refresh) return new Response('Unauthorized', { status: 401 })
    console.log('хуесос')
    // Обращаемся к Go-бэку за новым access (и, если вы так делаете, новым refresh)
    const r = await fetch(`http://localhost:8080/api/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
        cache: 'no-store',
    })

    if (!r.ok) return new Response('Unauthorized', { status: 401 })

    const data = await r.json()
    console.log(data)
    const { access_token, refresh_token, expires_in } = data

    const res = NextResponse.json({ ok: true })
    const prod = process.env.NODE_ENV === 'production'
    console.log('asdasd',access_token)
    // Обновляем access
    res.cookies.set({
        name: '__Host-access',
        value: access_token,
        httpOnly: true, secure: true, sameSite: 'lax', path: '/',
        maxAge: Math.min(expires_in ?? 900, 3600),
    })


    // Если бэк вернул новый refresh — тоже обновим
    if (refresh_token) {
        res.cookies.set({
            name: '__Host-refresh',
            value: refresh_token,
            httpOnly: true, secure: true, sameSite: 'lax', path: '/',
            maxAge: 60 * 60 * 24 * 30,
        })
    }
    console.log('asdfasdfadfsf')
    return res
}
