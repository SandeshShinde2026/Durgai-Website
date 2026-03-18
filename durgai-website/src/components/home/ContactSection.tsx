'use client'

import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ContactSection() {
  const t = useTranslations('ContactSection')
  const whatsappNumber = t('phoneRaw').replace(/\D/g, '')

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-white scroll-mt-28 pb-16 pt-6 lg:pb-24 lg:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-bg-muted p-6 sm:p-8 lg:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">{t('eyebrow')}</p>
          <h2 id="contact-heading" className="font-heading text-3xl font-extrabold text-text-base sm:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 max-w-2xl text-text-muted">{t('description')}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('cards.phone')}</p>
              <a href={`tel:${t('phoneRaw')}`} className="inline-flex items-center gap-2 text-text-base hover:text-primary">
                <Phone className="h-4 w-4 text-primary" />
                {t('phoneDisplay')}
              </a>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('cards.email')}</p>
              <a href={`mailto:${t('email')}`} className="inline-flex items-center gap-2 text-text-base hover:text-primary">
                <Mail className="h-4 w-4 text-primary" />
                {t('email')}
              </a>
            </div>
            <div className="rounded-2xl bg-white p-4 sm:col-span-2 lg:col-span-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('cards.address')}</p>
              <p className="inline-flex items-start gap-2 text-text-base">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{t('addressLine1')}, {t('addressLine2')}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              {t('whatsappCta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
