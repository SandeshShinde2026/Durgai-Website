import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'hi', 'mr'],
  defaultLocale: 'mr',
  localeDetection: false,
  localePrefix: 'always',
})

export type AppLocale = (typeof routing.locales)[number]
