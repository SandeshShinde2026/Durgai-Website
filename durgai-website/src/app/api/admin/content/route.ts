import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { issueAdminCsrfToken, verifyAdminCsrf } from '@/lib/admin-csrf'
import { writeAdminAuditLog } from '@/lib/admin-audit'
import { routing, type AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

const LOCALES = routing.locales

function isLocale(locale: string): locale is AppLocale {
  return LOCALES.includes(locale as AppLocale)
}

function getMessagesPath(locale: AppLocale) {
  return path.join(process.cwd(), 'src', 'messages', `${locale}.json`)
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    await writeAdminAuditLog({ event: 'unauthorized_access', details: 'GET /api/admin/content' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locale = request.nextUrl.searchParams.get('locale')

  if (!locale || !isLocale(locale)) {
    return NextResponse.json({ error: 'Invalid locale.' }, { status: 400 })
  }

  const fileContent = await fs.readFile(getMessagesPath(locale), 'utf-8')
  const content = JSON.parse(fileContent) as Record<string, unknown>
  const response = NextResponse.json({ locale, content })
  const csrfToken = issueAdminCsrfToken(response)

  await writeAdminAuditLog({
    event: 'content_read',
    username: session.user.name ?? 'admin',
    locale,
  })

  response.headers.set('x-admin-csrf-token', csrfToken)
  return response
}

type UpdateBody = {
  locale?: string
  content?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function normalizeImgbbUrl(urlValue: string) {
  const raw = urlValue.trim()
  if (!raw) return raw

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return raw
  }

  if (parsed.hostname === 'i.ibb.co') {
    return raw
  }

  if (parsed.hostname !== 'ibb.co' && parsed.hostname !== 'www.ibb.co') {
    return raw
  }

  try {
    const response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    })

    if (!response.ok) {
      return raw
    }

    const html = await response.text()
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    return ogImageMatch?.[1] ?? raw
  } catch {
    return raw
  }
}

async function normalizeStoriesImages(content: Record<string, unknown>) {
  const stories = content.Stories
  if (!isRecord(stories)) return content

  const items = stories.items
  if (!Array.isArray(items)) return content

  const normalizedItems = await Promise.all(
    items.map(async (item) => {
      if (!isRecord(item)) return item
      const imageUrl = typeof item.imageUrl === 'string' ? item.imageUrl : ''
      if (!imageUrl) return item
      const normalizedImageUrl = await normalizeImgbbUrl(imageUrl)
      return { ...item, imageUrl: normalizedImageUrl }
    }),
  )

  return {
    ...content,
    Stories: {
      ...stories,
      items: normalizedItems,
    },
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    await writeAdminAuditLog({ event: 'unauthorized_access', details: 'PUT /api/admin/content' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!verifyAdminCsrf(request)) {
    await writeAdminAuditLog({
      event: 'csrf_failure',
      username: session.user.name ?? 'admin',
      details: 'CSRF validation failed for PUT /api/admin/content',
    })
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as UpdateBody
  const locale = body.locale
  const content = body.content

  if (!locale || !isLocale(locale)) {
    return NextResponse.json({ error: 'Invalid locale.' }, { status: 400 })
  }

  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return NextResponse.json({ error: 'Content must be a JSON object.' }, { status: 400 })
  }

  const normalizedContent = await normalizeStoriesImages(content as Record<string, unknown>)
  await fs.writeFile(getMessagesPath(locale), `${JSON.stringify(normalizedContent, null, 2)}\n`, 'utf-8')
  await writeAdminAuditLog({
    event: 'content_update',
    username: session.user.name ?? 'admin',
    locale,
  })

  return NextResponse.json({ ok: true })
}
