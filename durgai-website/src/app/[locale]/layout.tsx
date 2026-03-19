import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getMessages } from '@/i18n/messages'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const OPEN_GRAPH_LOCALE: Record<string, string> = {
  en: 'en_IN',
  hi: 'hi_IN',
  mr: 'mr_IN',
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: OPEN_GRAPH_LOCALE[locale] ?? 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div data-locale={locale}>{children}</div>
    </NextIntlClientProvider>
  )
}
