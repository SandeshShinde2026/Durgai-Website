import crypto from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'

export const ADMIN_CSRF_COOKIE = 'durgai_admin_csrf'
const CSRF_HEADER = 'x-admin-csrf-token'

export function issueAdminCsrfToken(response: NextResponse) {
  const token = crypto.randomBytes(32).toString('hex')

  response.cookies.set({
    name: ADMIN_CSRF_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  })

  return token
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

export function verifyAdminCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get(ADMIN_CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!cookieToken || !headerToken) {
    return false
  }

  if (!safeEqual(cookieToken, headerToken)) {
    return false
  }

  const origin = request.headers.get('origin')

  if (origin) {
    try {
      return new URL(origin).origin === request.nextUrl.origin
    } catch {
      return false
    }
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      return new URL(referer).origin === request.nextUrl.origin
    } catch {
      return false
    }
  }

  return true
}
