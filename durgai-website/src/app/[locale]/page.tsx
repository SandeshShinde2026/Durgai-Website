import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import FloatingDonateButton from '@/components/shared/FloatingDonateButton'
import SectionReveal from '@/components/shared/SectionReveal'
import HeroSection from '@/components/home/HeroSection'
import TrustStrip from '@/components/home/TrustStrip'
import ImpactStats from '@/components/home/ImpactStats'
import AboutSection from '@/components/home/AboutSection'
import StoriesSection from '@/components/home/StoriesSection'
import HowYouCanHelp from '@/components/home/HowYouCanHelp'
import TransparencySection from '@/components/home/TransparencySection'
import DonationWidget from '@/components/home/DonationWidget'
import ContactSection from '@/components/home/ContactSection'
import type { AppLocale } from '@/i18n/routing'

type HomePageProps = {
  params: Promise<{ locale: AppLocale }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  return (
    <>
      <Header />
      <main id="main-content" className="w-full overflow-x-clip pb-24 xl:pb-0">
        <HeroSection />

        <SectionReveal style="fade-blur" amount={0.3}>
          <TrustStrip locale={locale} />
        </SectionReveal>

        <SectionReveal style="slide-up-hard" amount={0.1}>
          <ImpactStats />
        </SectionReveal>

        <SectionReveal style="from-left" amount={0.08}>
          <AboutSection />
        </SectionReveal>

        <SectionReveal style="scale-up" amount={0.08}>
          <HowYouCanHelp />
        </SectionReveal>

        <SectionReveal style="slide-up" amount={0.06}>
          <StoriesSection />
        </SectionReveal>

        <SectionReveal style="from-right" amount={0.08}>
          <TransparencySection />
        </SectionReveal>

        <SectionReveal style="scale-up" amount={0.1} delay={0.05}>
          <DonationWidget />
        </SectionReveal>

        <SectionReveal style="slide-up" amount={0.08}>
          <ContactSection />
        </SectionReveal>
      </main>
      <Footer locale={locale} />
      <FloatingDonateButton />
    </>
  )
}
