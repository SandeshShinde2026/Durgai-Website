import { promises as fs } from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'
import type { AppLocale } from './routing'

type Messages = Record<string, unknown>

const DEVANAGARI_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
}

const DEVANAGARI_LOCALES = new Set<AppLocale>(['hi', 'mr'])
const SKIP_NUMERAL_KEYS = new Set(['phoneRaw'])

function toDevanagariDigits(value: string) {
  return value.replace(/\d/g, (digit) => DEVANAGARI_DIGITS[digit] ?? digit)
}

function shouldSkipNormalization(key: string | undefined, value: string) {
  if (key && SKIP_NUMERAL_KEYS.has(key)) {
    return true
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return true
  }

  if (value.includes('@')) {
    return true
  }

  return false
}

function normalizeNumerals(locale: AppLocale, value: unknown, key?: string): unknown {
  if (!DEVANAGARI_LOCALES.has(locale)) {
    return value
  }

  if (typeof value === 'string') {
    if (shouldSkipNormalization(key, value)) {
      return value
    }

    return toDevanagariDigits(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeNumerals(locale, item, key))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        normalizeNumerals(locale, childValue, childKey),
      ]),
    )
  }

  return value
}

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
    if (cached) return normalizeNumerals(locale, cached) as Messages
  } catch {
    // Redis unavailable — fall through to filesystem
  }
  const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  return normalizeNumerals(locale, JSON.parse(fileContent) as Messages) as Messages
}
