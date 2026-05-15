'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { UsersRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, sectionStagger, staggerContainer } from '@/lib/animations'

export default function LeadershipSection() {
  const t = useTranslations('Leadership')
  const reduce = useReducedMotion()
  const rawMembers = t.raw('members')
  const members = Array.isArray(rawMembers)
    ? rawMembers.filter((item): item is string => typeof item === 'string')
    : []

  return (
    <section id="leadership" aria-labelledby="leadership-heading" className="bg-white pb-20 pt-12 lg:pb-24 lg:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionStagger}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-10"
        >
          <motion.p variants={fadeInUp} className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3">
            {t('eyebrow')}
          </motion.p>
          <motion.h2 id="leadership-heading" variants={fadeInUp} className="font-heading text-3xl sm:text-4xl font-extrabold text-text-base mb-4">
            {t('heading.prefix')}
            <span className="text-gradient">{t('heading.highlight')}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-muted text-lg max-w-2xl mx-auto">
            {t('description')}
          </motion.p>
        </motion.div>

        <motion.ul
          variants={staggerContainer}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {members.map((member) => (
            <motion.li key={member} variants={fadeInUp} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-bg-muted p-4">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UsersRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-text-base">{member}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
