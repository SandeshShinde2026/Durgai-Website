'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Stethoscope, HeartPulse, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { fadeInUp, sectionStagger, staggerContainer } from '@/lib/animations'
import { cn } from '@/lib/utils'

const HOW_CARDS = [
  {
    id: 'need-help',
    icon: Stethoscope,
    href: '#need-help',
    bgGradient: 'from-rose-50 to-pink-50',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    ctaStyle:
      'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35',
  },
  {
    id: 'donate',
    icon: HeartPulse,
    href: '#donate',
    bgGradient: 'from-primary/5 via-secondary/30 to-pink-50',
    iconBg: 'bg-secondary/70',
    iconColor: 'text-primary',
    ctaStyle:
      'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35',
    featured: true,
  },
  {
    id: 'volunteer',
    icon: Users,
    href: '#volunteer',
    bgGradient: 'from-orange-50 to-rose-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    ctaStyle:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  },
]

export default function HowYouCanHelp() {
  const t = useTranslations('HowYouCanHelp')
  const reduce = useReducedMotion()

  return (
    <section
      id="need-help"
      aria-labelledby="how-help-heading"
      className="bg-bg-muted pb-20 pt-12 lg:pb-24 lg:pt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={sectionStagger}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-14"
        >
          <motion.p variants={fadeInUp} className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3">
            {t('eyebrow')}
          </motion.p>
          <motion.h2
            id="how-help-heading"
            variants={fadeInUp}
            className="font-heading text-3xl sm:text-4xl font-extrabold text-text-base mb-4"
          >
            {t('heading.prefix')}{' '}
            <span className="text-gradient">{t('heading.highlight')}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-muted text-lg max-w-2xl mx-auto">
            {t('description')}
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {HOW_CARDS.map(
            ({
              id,
              icon: Icon,
              href,
              bgGradient,
              iconBg,
              iconColor,
              ctaStyle,
              featured,
            }) => (
              <motion.div
                key={id}
                variants={fadeInUp}
                className={cn(
                  'relative flex flex-col rounded-3xl p-7 border card-hover',
                  featured
                    ? 'bg-gradient-to-br from-white via-bg-warm to-secondary/20 border-primary/20 shadow-[0_8px_40px_rgba(229,57,53,0.12)]'
                    : `bg-gradient-to-br ${bgGradient} border-gray-100 shadow-card`,
                )}
              >
                {/* Featured label */}
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-heading font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                    {t('featured')}
                  </div>
                )}

                {/* Tag */}
                <span className="inline-block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">
                  {t(`cards.${id}.tag`)}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${iconColor}`} aria-hidden="true" />
                </div>

                {/* Title & description */}
                <h3 className="font-heading font-bold text-text-base text-lg mb-3">{t(`cards.${id}.title`)}</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-1 mb-7">{t(`cards.${id}.description`)}</p>

                {/* CTA */}
                <Link
                  href={href}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 font-heading font-semibold text-sm px-5 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]',
                    ctaStyle,
                  )}
                >
                  {t(`cards.${id}.cta`)}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  )
}
