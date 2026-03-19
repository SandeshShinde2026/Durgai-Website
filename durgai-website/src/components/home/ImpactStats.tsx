'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Heart, Activity, Stethoscope, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { staggerContainer, fadeInUp, statCard } from '@/lib/animations'

const STATS = [
  {
    key: 'children',
    icon: Users,
    defaultValue: 1200,
    defaultSuffix: '+',
    color: 'from-red-50 to-pink-50',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    key: 'surgeries',
    icon: Activity,
    defaultValue: 300,
    defaultSuffix: '+',
    color: 'from-rose-50 to-red-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    key: 'camps',
    icon: Stethoscope,
    defaultValue: 50,
    defaultSuffix: '+',
    color: 'from-pink-50 to-rose-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    key: 'hospitals',
    icon: Heart,
    defaultValue: 8,
    defaultSuffix: '',
    color: 'from-bg-warm to-secondary/20',
    iconBg: 'bg-secondary/50',
    iconColor: 'text-primary',
  },
]

function CountUp({
  end,
  suffix,
  inView,
  locale,
}: {
  end: number
  suffix: string
  inView: boolean
  locale: string
}) {
  const [count, setCount] = useState(0)
  const reduce = useReducedMotion()
  const numberLocale = locale === 'hi' || locale === 'mr' ? `${locale}-IN-u-nu-deva` : 'en-IN'

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setCount(end)
      return
    }

    const duration = 1800
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(tick)
    }

    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, end, reduce])

  return (
    <span>
      {count.toLocaleString(numberLocale)}
      {suffix}
    </span>
  )
}

export default function ImpactStats() {
  const t = useTranslations('ImpactStats')
  const locale = useLocale()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const getStatValue = (key: string, fallback: number) => {
    const raw = t.raw(`stats.${key}.value`)
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return raw
    }

    if (typeof raw === 'string') {
      const parsed = Number(raw)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }

    return fallback
  }

  const getStatSuffix = (key: string, fallback: string) => {
    const raw = t.raw(`stats.${key}.suffix`)
    return typeof raw === 'string' ? raw : fallback
  }

  return (
    <section
      id="impact"
      ref={ref}
      aria-labelledby="impact-heading"
      className="section-py bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-14"
        >
          <motion.p variants={fadeInUp} className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3">
            {t('eyebrow')}
          </motion.p>
          <motion.h2
            id="impact-heading"
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

        {/* Stats grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {STATS.map(({ key, icon: Icon, defaultValue, defaultSuffix, color, iconBg, iconColor }) => {
            void color
            const value = getStatValue(key, defaultValue)
            const suffix = getStatSuffix(key, defaultSuffix)

            return (
              <motion.div
                key={key}
                variants={statCard}
                className="text-center flex flex-col items-center"
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
                </div>

                {/* Value */}
                <p
                  className="font-heading text-4xl font-extrabold text-text-base mb-1"
                  aria-label={t('aria.statValue', {
                    value: `${value}${suffix}`,
                    label: t(`stats.${key}.label`),
                  })}
                >
                  <CountUp end={value} suffix={suffix} inView={inView} locale={locale} />
                </p>

                {/* Label */}
                <p className="font-heading font-bold text-text-base text-base mb-2">{t(`stats.${key}.label`)}</p>

                {/* Description */}
                <p className="text-text-muted text-sm leading-relaxed">{t(`stats.${key}.description`)}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
