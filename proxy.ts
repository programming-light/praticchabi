import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from './lib/session-token'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CSRF: same-origin check for every state-changing request (including API routes).
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    if (origin) {
      try {
        if (new URL(origin).host !== request.nextUrl.host) {
          return NextResponse.json({ ok: false, message: 'Origin check failed' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ ok: false, message: 'Invalid origin' }, { status: 403 })
      }
    }
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  if (pathname.startsWith('/admin') && (!session || !['ADMIN', 'EDITOR'].includes(session.role))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/account') && !session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/api/:path*'],
}
