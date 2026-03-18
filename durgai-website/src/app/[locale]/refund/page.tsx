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
  const t = await getTranslations({ locale, namespace: 'PolicyPages.refund.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function RefundPolicyPage({ params }: PolicyPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PolicyPages.refund' })

  const sections = [
    {
      title: t('sections.eligibility.title'),
      body: t('sections.eligibility.body'),
    },
    {
      title: t('sections.process.title'),
      body: t('sections.process.body'),
    },
    {
      title: t('sections.timeline.title'),
      body: t('sections.timeline.body'),
    },
    {
      title: t('sections.exceptions.title'),
      body: t('sections.exceptions.body'),
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
