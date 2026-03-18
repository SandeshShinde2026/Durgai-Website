'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Download, PieChart, FileText, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, fadeInRight, sectionStagger, staggerContainer } from '@/lib/animations'

const FUND_BREAKDOWN = [
  {
    key: 'medical',
    percent: 65,
    color: 'bg-primary',
    textColor: 'text-primary',
  },
  {
    key: 'camps',
    percent: 20,
    color: 'bg-rose-400',
    textColor: 'text-rose-500',
  },
  {
    key: 'admin',
    percent: 15,
    color: 'bg-pink-300',
    textColor: 'text-pink-500',
  },
]

const DOCUMENTS = [
  { key: 'annualReport', icon: FileText, href: '#' },
  { key: 'auditedAccounts', icon: FileText, href: '#' },
  { key: 'fcraCertificate', icon: Download, href: '#' },
  { key: 'csrImpact', icon: ExternalLink, href: '#' },
]

function AnimatedBar({
  percent,
  color,
  delay,
}: {
  percent: number
  color: string
  delay: number
}) {
  const reduce = useReducedMotion()

  return (
    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className={`absolute left-0 top-0 bottom-0 ${color} rounded-full`}
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true, amount: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }
        }
      />
    </div>
  )
}

export default function TransparencySection() {
  const t = useTranslations('Transparency')
  const reduce = useReducedMotion()

  return (
    <section
      id="transparency"
      aria-labelledby="transparency-heading"
      className="bg-white pb-20 pt-12 lg:pb-24 lg:pt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── Left: breakdown ─────────────────── */}
          <motion.div
            variants={sectionStagger}
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.p variants={fadeInUp} className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3">
              {t('eyebrow')}
            </motion.p>

            <motion.h2
              id="transparency-heading"
              variants={fadeInUp}
              className="font-heading text-3xl sm:text-4xl font-extrabold text-text-base mb-4"
            >
              {t('heading.prefix')}{' '}
              <span className="text-gradient">{t('heading.highlight')}</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-text-muted leading-relaxed mb-10 max-w-md">
              {t('description')}
            </motion.p>

            {/* Bars */}
            <motion.ul
              variants={staggerContainer}
              className="space-y-6"
              role="list"
              aria-label={t('aria.breakdownList')}
            >
              {FUND_BREAKDOWN.map(({ key, percent, color, textColor }, i) => (
                <motion.li key={key} variants={fadeInUp}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-heading font-semibold text-text-base text-sm">{t(`breakdown.${key}.label`)}</p>
                      <p className="text-xs text-text-muted mt-0.5">{t(`breakdown.${key}.description`)}</p>
                    </div>
                    <span className={`font-heading font-extrabold text-2xl ${textColor} ml-4`}>
                      {percent}%
                    </span>
                  </div>
                  <AnimatedBar
                    percent={percent}
                    color={color}
                    delay={0.1 + i * 0.15}
                  />
                </motion.li>
              ))}
            </motion.ul>

            {/* Pie summary donut */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-wrap items-center gap-4 p-5 bg-bg-muted rounded-2xl border border-gray-100"
              aria-label={t('aria.impactSummary')}
            >
              <PieChart className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-heading font-bold text-text-base">
                  {t('summary.title')}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {t('summary.body')}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: documents ─────────────────── */}
          <motion.div
            variants={fadeInRight}
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="sticky top-28 space-y-5">
              {/* Document downloads */}
              <div className="bg-bg-muted rounded-3xl p-6 border border-gray-100">
                <h3 className="font-heading font-bold text-text-base text-lg mb-5">
                  {t('documents.title')}
                </h3>
                <ul className="space-y-3" role="list">
                  {DOCUMENTS.map(({ key, icon: Icon, href }) => (
                    <li key={key}>
                      <a
                        href={href}
                        className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200 group min-h-[44px]"
                      >
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-text-base group-hover:text-primary transition-colors">
                          {t(`documents.items.${key}`)}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Donor pledge card */}
              <div className="bg-gradient-to-br from-primary via-primary-dark to-red-900 rounded-3xl p-6 text-white">
                <h3 className="font-heading font-bold text-xl mb-3">{t('promise.title')}</h3>
                <ul className="space-y-2.5">
                  {(
                    t.raw('promise.items') as string[]
                  ).map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                      <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
