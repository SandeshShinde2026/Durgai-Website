import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { writeAdminAuditLog } from '@/lib/admin-audit'
import { getAdminUsername, isAdminAuthConfigured, verifyAdminPassword } from '@/lib/admin-password'
import {
  checkLoginAllowance,
  clearLoginFailures,
  getRateLimitKey,
  recordFailedLogin,
} from '@/lib/admin-rate-limit'

type RequestLike = {
  headers?: Headers | Record<string, string | string[] | undefined>
}

function getHeaderValue(request: RequestLike, key: string) {
  const { headers } = request

  if (!headers) {
    return null
  }

  if (headers instanceof Headers) {
    return headers.get(key)
  }

  const value = headers[key]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function getClientIp(request: RequestLike) {
  const forwardedFor = getHeaderValue(request, 'x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return getHeaderValue(request, 'x-real-ip') || 'unknown'
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!isAdminAuthConfigured()) {
          await writeAdminAuditLog({
            event: 'login_failure',
            details: 'Auth not configured: AUTH_SECRET or password hashes missing.',
          })
          return null
        }

        const username = String(credentials?.username ?? '').trim()
        const password = String(credentials?.password ?? '')
        const ip = getClientIp(request as RequestLike)
        const rateLimitKey = getRateLimitKey(username || 'unknown', ip)
        const adminUsername = getAdminUsername()
        const allowed = checkLoginAllowance(rateLimitKey)

        if (!allowed.allowed) {
          await writeAdminAuditLog({
            event: 'login_lockout',
            username,
            ip,
            details: `Retry after ${allowed.retryAfterSeconds}s`,
          })
          return null
        }

        if (username !== adminUsername) {
          const lockout = recordFailedLogin(rateLimitKey)
          await writeAdminAuditLog({
            event: lockout.locked ? 'login_lockout' : 'login_failure',
            username,
            ip,
            details: 'Invalid username',
          })
          return null
        }

        const validPassword = await verifyAdminPassword(password)
        if (!validPassword) {
          const lockout = recordFailedLogin(rateLimitKey)
          await writeAdminAuditLog({
            event: lockout.locked ? 'login_lockout' : 'login_failure',
            username,
            ip,
            details: 'Invalid password',
          })
          return null
        }

        clearLoginFailures(rateLimitKey)
        await writeAdminAuditLog({ event: 'login_success', username, ip })
        return { id: 'admin', name: adminUsername, role: 'admin' as const }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'admin'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name
      }
      return session
    },
  },
  events: {
    async signOut({ token, session }) {
      await writeAdminAuditLog({
        event: 'logout',
        username: (token?.name as string | undefined) ?? session?.user?.name ?? 'admin',
      })
    },
  },
}
