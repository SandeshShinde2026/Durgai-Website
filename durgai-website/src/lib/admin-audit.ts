type AdminAuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'login_lockout'
  | 'logout'
  | 'content_read'
  | 'content_update'
  | 'csrf_failure'
  | 'unauthorized_access'

type AdminAuditRecord = {
  timestamp: string
  event: AdminAuditEvent
  username?: string
  ip?: string
  locale?: string
  details?: string
}

export async function writeAdminAuditLog(record: Omit<AdminAuditRecord, 'timestamp'>) {
  const fullRecord: AdminAuditRecord = {
    timestamp: new Date().toISOString(),
    ...record,
  }

  console.info(`[admin-audit] ${JSON.stringify(fullRecord)}`)
}
