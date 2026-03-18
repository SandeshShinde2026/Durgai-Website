import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PolicyPageLayout from '@/components/shared/PolicyPageLayout'

type PolicyPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PolicyPages.terms.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function TermsPage({ params }: PolicyPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PolicyPages.terms' })

  const sections = [
    {
      title: t('sections.acceptance.title'),
      body: t('sections.acceptance.body'),
    },
    {
      title: t('sections.services.title'),
      body: t('sections.services.body'),
    },
    {
      title: t('sections.payments.title'),
      body: t('sections.payments.body'),
    },
    {
      title: t('sections.liability.title'),
      body: t('sections.liability.body'),
    },
  ]

  return (
    <PolicyPageLayout
      locale={locale}
      title={t('title')}
      intro={t('intro')}
      lastUpdated={t('updatedDate')}
      sections={sections}
      contactText={t('contact')}
    />
  )
}
