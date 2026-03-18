import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { verifyAdminCsrf } from '@/lib/admin-csrf'
import { writeAdminAuditLog } from '@/lib/admin-audit'

export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    await writeAdminAuditLog({ event: 'unauthorized_access', details: 'POST /api/admin/upload-image' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!verifyAdminCsrf(request)) {
    await writeAdminAuditLog({
      event: 'csrf_failure',
      username: session.user.name ?? 'admin',
      details: 'CSRF validation failed for POST /api/admin/upload-image',
    })
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'IMGBB_API_KEY is not configured.' }, { status: 500 })
  }

  const formData = await request.formData()
  const image = formData.get('image')

  if (!(image instanceof File)) {
    return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
  }

  if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image size must be between 1 byte and 10MB.' }, { status: 400 })
  }

  if (!image.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported.' }, { status: 400 })
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer())
  const imageBase64 = imageBuffer.toString('base64')
  const uploadForm = new FormData()
  uploadForm.set('image', imageBase64)
  uploadForm.set('name', image.name.replace(/\.[^/.]+$/, '').slice(0, 80))

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: uploadForm,
    cache: 'no-store',
  })

  const result = (await response.json().catch(() => ({}))) as {
    success?: boolean
    data?: { url?: string; display_url?: string }
    error?: { message?: string }
  }

  if (!response.ok || !result.success || !result.data) {
    return NextResponse.json(
      { error: result.error?.message ?? 'Failed to upload image to imgbb.' },
      { status: 502 },
    )
  }

  const imageUrl = result.data.url ?? result.data.display_url
  if (!imageUrl) {
    return NextResponse.json({ error: 'imgbb did not return an image URL.' }, { status: 502 })
  }

  await writeAdminAuditLog({
    event: 'content_update',
    username: session.user.name ?? 'admin',
    details: 'Uploaded image via imgbb',
  })

  return NextResponse.json({ url: imageUrl })
}
