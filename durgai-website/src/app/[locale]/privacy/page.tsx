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
  const t = await getTranslations({ locale, namespace: 'PolicyPages.privacy.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PrivacyPolicyPage({ params }: PolicyPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PolicyPages.privacy' })

  const sections = [
    {
      title: t('sections.collection.title'),
      body: t('sections.collection.body'),
    },
    {
      title: t('sections.usage.title'),
      body: t('sections.usage.body'),
    },
    {
      title: t('sections.sharing.title'),
      body: t('sections.sharing.body'),
    },
    {
      title: t('sections.rights.title'),
      body: t('sections.rights.body'),
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
