'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { HeartPulse, ShieldPlus, Syringe, School } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, sectionStagger, staggerContainer } from '@/lib/animations'

const ICONS = [HeartPulse, ShieldPlus, Syringe, School]

export default function MajorActivitiesSection() {
  const t = useTranslations('MajorActivities')
  const reduce = useReducedMotion()
  const rawItems = t.raw('items')
  const items = Array.isArray(rawItems)
    ? rawItems.filter((item): item is { title?: string; body?: string } => typeof item === 'object' && item !== null)
    : []

  return (
    <section id="activities" aria-labelledby="activities-heading" className="section-py bg-bg-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionStagger}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-12"
        >
          <motion.p variants={fadeInUp} className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3">
            {t('eyebrow')}
          </motion.p>
          <motion.h2 id="activities-heading" variants={fadeInUp} className="font-heading text-3xl sm:text-4xl font-extrabold text-text-base mb-4">
            {t('heading.prefix')}
            <span className="text-gradient">{t('heading.highlight')}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-muted text-lg max-w-3xl mx-auto">
            {t('description')}
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length]

            return (
              <motion.article key={`${item.title}-${index}`} variants={fadeInUp} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-bold text-text-base mb-2">{item.title ?? ''}</h3>
                <p className="text-text-muted leading-relaxed">{item.body ?? ''}</p>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
