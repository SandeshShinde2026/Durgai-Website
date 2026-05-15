import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import FloatingDonateButton from '@/components/shared/FloatingDonateButton'
import SectionReveal from '@/components/shared/SectionReveal'
import HeroSection from '@/components/home/HeroSection'
import TrustStrip from '@/components/home/TrustStrip'
import ImpactStats from '@/components/home/ImpactStats'
import AboutSection from '@/components/home/AboutSection'
import MajorActivitiesSection from '@/components/home/MajorActivitiesSection'
import StoriesSection from '@/components/home/StoriesSection'
import HowYouCanHelp from '@/components/home/HowYouCanHelp'
import LeadershipSection from '@/components/home/LeadershipSection'
import TransparencySection from '@/components/home/TransparencySection'
import DonationWidget from '@/components/home/DonationWidget'
import ContactSection from '@/components/home/ContactSection'
import { getTranslations } from 'next-intl/server'
import type { AppLocale } from '@/i18n/routing'

type HomePageProps = {
  params: Promise<{ locale: AppLocale }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const rawSectionOrder = t.raw('sectionOrder')

  const defaultSectionOrder = [
    'hero',
    'trust',
    'impact',
    'about',
    'activities',
    'howYouCanHelp',
    'stories',
    'leadership',
    'transparency',
    'donation',
    'contact',
  ]

  const allowedSectionIds = new Set(defaultSectionOrder)
  const configuredSectionOrder = Array.isArray(rawSectionOrder)
    ? rawSectionOrder.filter((id): id is string => typeof id === 'string' && allowedSectionIds.has(id))
    : defaultSectionOrder
  const seen = new Set<string>()
  const sectionOrder = configuredSectionOrder.filter((id) => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSection />
      case 'trust':
        return (
          <SectionReveal style="fade-blur" amount={0.3}>
            <TrustStrip locale={locale} />
          </SectionReveal>
        )
      case 'impact':
        return (
          <SectionReveal style="slide-up-hard" amount={0.1}>
            <ImpactStats />
          </SectionReveal>
        )
      case 'about':
        return (
          <SectionReveal style="from-left" amount={0.08}>
            <AboutSection />
          </SectionReveal>
        )
      case 'activities':
        return (
          <SectionReveal style="slide-up" amount={0.08}>
            <MajorActivitiesSection />
          </SectionReveal>
        )
      case 'howYouCanHelp':
        return (
          <SectionReveal style="scale-up" amount={0.08}>
            <HowYouCanHelp />
          </SectionReveal>
        )
      case 'stories':
        return (
          <SectionReveal style="slide-up" amount={0.06}>
            <StoriesSection />
          </SectionReveal>
        )
      case 'leadership':
        return (
          <SectionReveal style="from-left" amount={0.08}>
            <LeadershipSection />
          </SectionReveal>
        )
      case 'transparency':
        return (
          <SectionReveal style="from-right" amount={0.08}>
            <TransparencySection />
          </SectionReveal>
        )
      case 'donation':
        return (
          <SectionReveal style="scale-up" amount={0.1} delay={0.05}>
            <DonationWidget />
          </SectionReveal>
        )
      case 'contact':
        return (
          <SectionReveal style="slide-up" amount={0.08}>
            <ContactSection />
          </SectionReveal>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="w-full overflow-x-clip pb-24 xl:pb-0">
        {sectionOrder.map((sectionId) => (
          <div key={sectionId}>{renderSection(sectionId)}</div>
        ))}
      </main>
      <Footer locale={locale} />
      <FloatingDonateButton />
    </>
  )
}
