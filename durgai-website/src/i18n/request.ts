import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { getMessages } from './messages'

export default getRequestConfig(async ({ locale: explicitLocale, requestLocale }) => {
  const requestedLocale = explicitLocale ?? (await requestLocale)
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale

  return {
    locale,
    messages: await getMessages(locale),
  }
})