import Link from 'next/link'
import { Heart, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube, MessageCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const QUICK_LINKS = [
  { href: '#about', key: 'about' },
  { href: '#impact', key: 'impact' },
  { href: '#stories', key: 'stories' },
  { href: '#transparency', key: 'transparency' },
  { href: '#need-help', key: 'needHelp' },
]

const GET_INVOLVED = [
  { href: '#donate', key: 'donate' },
  { href: '#volunteer', key: 'volunteer' },
  { href: '#csr', key: 'csr' },
  { href: '#camps', key: 'camp' },
  { href: '#contact', key: 'contact' },
]

const SOCIALS = [
  { href: '#', label: 'Instagram', icon: Instagram },
  { href: '#', label: 'Facebook', icon: Facebook },
  { href: '#', label: 'Twitter / X', icon: Twitter },
  { href: '#', label: 'YouTube', icon: Youtube },
]

const TRUST_BADGES = [
  'registeredNgo',
  'approved80g',
  'certified12a',
  'fcra',
  'razorpaySecured',
] as const

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Footer' })
  const whatsappNumber = '919822880375'

  return (
    <footer className="bg-gray-950 text-gray-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">{t('aria.footer')}</h2>

      {/* ─── Main grid ──────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 group mb-5" aria-label={t('aria.home')}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="leading-none">
                <p className="font-heading font-bold text-white text-[15px]">{t('brand.top')}</p>
                <p className="font-heading font-medium text-xs text-gray-400 tracking-wide">{t('brand.bottom')}</p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-[260px]">
              {t('description')}
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-5">
              {t('sections.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={`/${locale}${href}`}
                    className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all duration-200"
                  >
                    {t(`quickLinks.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get involved */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-5">
              {t('sections.getInvolved')}
            </h3>
            <ul className="space-y-3">
              {GET_INVOLVED.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={`/${locale}${href}`}
                    className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all duration-200"
                  >
                    {t(`getInvolved.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-5">
              {t('sections.contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400 leading-relaxed">
                  {t('contact.addressLine1')},<br />{t('contact.addressLine2')}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${t('contact.phoneRaw')}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  {t('contact.phoneDisplay')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t('contact.email')}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  {t('contact.email')}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 min-h-[44px]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('contact.whatsappCta')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Trust badges ───────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"
              >
                <span className="w-4 h-4 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px]">
                  ✓
                </span>
                {t(`badges.${badge}`)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ─────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              {t('bottom.rights', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/privacy`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {t('bottom.privacy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {t('bottom.terms')}
              </Link>
              <Link href={`/${locale}/refund`} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {t('bottom.refund')}
              </Link>
            </div>
          </div>

          {/* Medical disclaimer */}
          <p className="mt-4 text-[11px] text-gray-600 text-center leading-relaxed max-w-4xl mx-auto border-t border-white/5 pt-4">
            <strong className="text-gray-500">{t('medicalDisclaimer.title')}</strong> {t('medicalDisclaimer.body')}
          </p>
        </div>
      </div>
    </footer>
  )
}
