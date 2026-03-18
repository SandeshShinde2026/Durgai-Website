type AttemptState = {
  firstAttemptAt: number
  failCount: number
  lockedUntil?: number
}

const attempts = new Map<string, AttemptState>()

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 30 * 60 * 1000

function getNow() {
  return Date.now()
}

export function getRateLimitKey(username: string, ip: string) {
  return `${username.toLowerCase()}::${ip}`
}

export function checkLoginAllowance(key: string) {
  const now = getNow()
  const current = attempts.get(key)

  if (!current) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (current.lockedUntil && current.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.lockedUntil - now) / 1000),
    }
  }

  if (now - current.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

export function recordFailedLogin(key: string) {
  const now = getNow()
  const current = attempts.get(key)

  if (!current || now - current.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { firstAttemptAt: now, failCount: 1 })
    return { locked: false, retryAfterSeconds: 0 }
  }

  const nextFailCount = current.failCount + 1
  const nextState: AttemptState = { ...current, failCount: nextFailCount }

  if (nextFailCount >= MAX_FAILED_ATTEMPTS) {
    nextState.lockedUntil = now + LOCKOUT_MS
  }

  attempts.set(key, nextState)

  if (!nextState.lockedUntil) {
    return { locked: false, retryAfterSeconds: 0 }
  }

  return {
    locked: true,
    retryAfterSeconds: Math.ceil((nextState.lockedUntil - now) / 1000),
  }
}

export function clearLoginFailures(key: string) {
  attempts.delete(key)
}
