import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
    token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
  })

  await redis.del('content:hi', 'content:mr', 'content:en')

  return NextResponse.json({ ok: true, message: 'Cache cleared for hi, mr, en' })
}
