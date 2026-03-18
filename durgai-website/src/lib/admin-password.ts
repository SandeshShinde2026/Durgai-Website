import bcrypt from 'bcryptjs'

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME ?? 'admin'
}

export function getAdminPasswordHashes() {
  const hashes = [
    ...(process.env.ADMIN_PASSWORD_HASH ? [process.env.ADMIN_PASSWORD_HASH] : []),
    ...(process.env.ADMIN_PASSWORD_HASHES
      ? process.env.ADMIN_PASSWORD_HASHES.split(',').map((value) => value.trim())
      : []),
  ].filter(Boolean)

  return Array.from(new Set(hashes))
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.AUTH_SECRET && getAdminPasswordHashes().length > 0)
}

export async function verifyAdminPassword(password: string) {
  const hashes = getAdminPasswordHashes()

  for (const hash of hashes) {
    // bcrypt compare uses constant-time hash verification.
    if (await bcrypt.compare(password, hash)) {
      return true
    }
  }

  return false
}
