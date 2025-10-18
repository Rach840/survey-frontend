import {NextRequest, NextResponse} from 'next/server'

const PROTECTED_PREFIXES = ['/app']
export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
    const isLoggedIn = Boolean(req.cookies.get('__Host-access')?.value)

    if (isProtected && !isLoggedIn) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        url.search = ''
        url.searchParams.set('next', pathname + (search || ''))
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
    ],
}

