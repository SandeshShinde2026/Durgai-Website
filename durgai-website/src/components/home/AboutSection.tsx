'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Target, Eye, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, fadeInLeft, sectionStagger, staggerContainer } from '@/lib/animations'

const VALUES = [
  'zeroCost',
  'transparency',
  'hospitals',
  'privacy',
]

export default function AboutSection() {
  const t = useTranslations('About')
  const reduce = useReducedMotion()
  const cardImageUrl = t('cardImageUrl')
  const statCards = [
    { value: t('statValues.yearsOfService'), label: t('stats.yearsOfService') },
    { value: t('statValues.districtsServed'), label: t('stats.districtsServed') },
    { value: t('statValues.chargedToPatients'), label: t('stats.chargedToPatients') },
  ]

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="section-py bg-bg-muted"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Illustration card ─────────── */}
          <motion.div
            variants={fadeInLeft}
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative rounded-3xl overflow-hidden shadow-premium">
              {/* Placeholder visual */}
              <div className="relative h-[380px] lg:h-[440px] bg-gradient-to-br from-bg-warm via-secondary/60 to-primary-light/30 overflow-hidden">
                {cardImageUrl.trim() ? (
                  <motion.div
                    animate={reduce ? {} : { scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    role="img"
                    aria-label={t('aria.heartIllustration')}
                  >
                    <img
                      src={cardImageUrl}
                      alt={t('aria.heartIllustration')}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-primary/30 bg-white/60 px-6 text-center text-sm font-semibold text-primary">
                    <motion.span
                      animate={reduce ? {} : { opacity: [0.75, 1, 0.75] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    >
                      {t('imagePlaceholder')}
                    </motion.span>
                  </div>
                )}
              </div>

              {/* Overlay stat card */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/50 px-6 py-4 grid grid-cols-3">
                {statCards.map((stat) => (
                  <div key={stat.label} className="text-center border-r border-gray-200 last:border-r-0">
                    <p className="font-heading text-2xl font-extrabold text-primary">{stat.value}</p>
                    <p className="text-xs text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating quote */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -right-4 -top-6 hidden lg:block bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] px-4 py-3 max-w-[180px] border border-gray-100"
            >
              <div className="flex items-start gap-2">
                <span className="text-3xl leading-none text-primary">&ldquo;</span>
                <p className="text-xs text-text-muted leading-relaxed mt-1">
                  {t('quote.text')}
                </p>
              </div>
              <p className="text-[10px] font-semibold text-primary mt-1.5">{t('quote.author')}</p>
            </motion.div>
          </motion.div>

          {/* ── Right: Text ──────────────────────── */}
          <motion.div
            variants={sectionStagger}
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.p
              variants={fadeInUp}
              className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3"
            >
              {t('eyebrow')}
            </motion.p>

            <motion.h2
              id="about-heading"
              variants={fadeInUp}
              className="font-heading text-3xl sm:text-4xl font-extrabold text-text-base leading-tight mb-5"
            >
              {t('heading.prefix')}{' '}
              <span className="text-gradient">{t('heading.highlight')}</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-text-muted text-lg leading-relaxed mb-5">
              {t('paragraph1')}
            </motion.p>

            <motion.p variants={fadeInUp} className="text-text-muted leading-relaxed mb-8">
              {t('paragraph2')}
            </motion.p>

            {/* Mission & Vision */}
            <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-text-base">{t('mission.title')}</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t('mission.body')}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-text-base">{t('vision.title')}</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t('vision.body')}
                </p>
              </div>
            </motion.div>

            {/* Values list */}
            <motion.ul variants={staggerContainer} className="space-y-3">
              {VALUES.map((value) => (
                <motion.li
                  key={value}
                  variants={fadeInUp}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-text-muted text-sm leading-relaxed">{t(`values.${value}`)}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
