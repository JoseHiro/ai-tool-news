import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/guides',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/stripe/webhook',  // Stripe からのリクエストはセッションなし
  '/stripe/success',
]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // iron-session only sets this cookie when session.save() is called
  const session = req.cookies.get('digest-auth')
  if (!session?.value) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
