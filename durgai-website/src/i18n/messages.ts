import { promises as fs } from 'fs'
import path from 'path'
import type { AppLocale } from './routing'

type Messages = Record<string, unknown>

export async function getMessages(locale: AppLocale) {
  const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(fileContent) as Messages
}
