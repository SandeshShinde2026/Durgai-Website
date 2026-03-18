import { promises as fs } from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'
import type { AppLocale } from './routing'

type Messages = Record<string, unknown>

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
    token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
  })
}

export async function getMessages(locale: AppLocale) {
  try {
    const redis = getRedis()
    const cached = await redis.get<Messages>(`content:${locale}`)
    if (cached) return cached
  } catch {
    // Redis unavailable — fall through to filesystem
  }
  const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(fileContent) as Messages
}
