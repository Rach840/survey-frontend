import {cookies} from "next/headers";
import {NextResponse} from "next/server";
export async function POST() {
    const res = NextResponse.json({ ok: true })

    res.cookies.set({
        name: '__Host-access',
        value: "",
        httpOnly: true, secure: true, sameSite: 'lax', path: '/',
        maxAge: 0,
    })
    res.cookies.set({
        name: '__Host-refresh',
        value: "",
        httpOnly: true, secure: true, sameSite: 'lax', path: '/',
        maxAge: 0,
    })
    return res
}