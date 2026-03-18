import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

type PolicySection = {
  title: string
  body: string
}

type PolicyPageLayoutProps = {
  locale: string
  title: string
  intro: string
  lastUpdated: string
  sections: PolicySection[]
  contactText: string
}

export default async function PolicyPageLayout({
  locale,
  title,
  intro,
  lastUpdated,
  sections,
  contactText,
}: PolicyPageLayoutProps) {
  const shared = await getTranslations({ locale, namespace: 'PolicyPages.shared' })

  return (
    <>
      <Header />

      <main id="main-content" className="min-h-screen bg-bg-muted pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {shared('backHome')}
          </Link>

          <article className="mt-4 rounded-2xl border border-border-soft bg-white shadow-card overflow-hidden">
            <header className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 border-b border-border-soft">
              <p className="text-xs sm:text-sm font-medium text-text-muted mb-3">
                {shared('lastUpdated', { date: lastUpdated })}
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl text-text-base mb-4">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                {intro}
              </p>
            </header>

            <div className="px-6 py-8 sm:px-10 sm:py-10 space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-heading text-xl sm:text-2xl text-text-base mb-3">
                    {section.title}
                  </h2>
                  <p className="text-text-muted leading-relaxed">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            <footer className="px-6 py-6 sm:px-10 sm:py-8 bg-bg-warm border-t border-border-soft">
              <p className="text-sm sm:text-base text-text-base leading-relaxed">
                {contactText}
              </p>
            </footer>
          </article>
        </div>
      </main>

      <Footer locale={locale} />
    </>
  )
}
