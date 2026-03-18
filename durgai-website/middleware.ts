import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPath = pathname.startsWith('/admin')
  const isAdminApiPath = pathname.startsWith('/api/admin')
  const isAdminLoginPath = pathname === '/admin/login'
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const isAuthenticated = Boolean(token)

  if (isAdminPath || isAdminApiPath) {
    if (isAdminLoginPath && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (!isAdminLoginPath && !isAuthenticated) {
      if (isAdminApiPath) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
