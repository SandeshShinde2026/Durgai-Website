'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Heart, Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, sectionStagger, staggerContainer } from '@/lib/animations'

type StoryItem = {
  key: string
  name: string
  location: string
  condition: string
  outcome: string
  fundedBy: string
  imageUrl?: string
}

const STORY_BACKGROUNDS = [
  'from-rose-100 via-pink-50 to-bg-warm',
  'from-primary-light/20 via-secondary/30 to-bg-warm',
  'from-orange-50 via-rose-50 to-pink-50',
  'from-pink-50 via-rose-50 to-bg-warm',
]

const STORY_ACCENTS = ['text-rose-600', 'text-primary', 'text-orange-600', 'text-pink-600']

export default function StoriesSection() {
  const t = useTranslations('Stories')
  const reduce = useReducedMotion()
  const rawItems = t.raw('items')
  const legacyStories = t.raw('stories')

  const stories: StoryItem[] = Array.isArray(rawItems) && rawItems.length > 0
    ? rawItems
      .filter((item): item is StoryItem => typeof item === 'object' && item !== null)
      .map((item, index) => {
        const normalizedItem = item as Partial<StoryItem>
        return {
          key: normalizedItem.key || `story-${index + 1}`,
          name: normalizedItem.name || '',
          location: normalizedItem.location || '',
          condition: normalizedItem.condition || '',
          outcome: normalizedItem.outcome || '',
          fundedBy: normalizedItem.fundedBy || '',
          imageUrl: normalizedItem.imageUrl || '',
        }
      })
    : Object.entries((legacyStories as Record<string, Partial<StoryItem>>) ?? {}).map(([key, value]) => ({
      key,
      name: value.name ?? '',
      location: value.location ?? '',
      condition: value.condition ?? '',
      outcome: value.outcome ?? '',
      fundedBy: value.fundedBy ?? '',
      imageUrl: value.imageUrl ?? '',
    }))

  return (
    <section
      id="stories"
      aria-labelledby="stories-heading"
      className="section-py bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
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
          <motion.h2
            id="stories-heading"
            variants={fadeInUp}
            className="font-heading text-3xl sm:text-4xl font-extrabold text-text-base mb-4"
          >
            {t('heading.prefix')}{' '}
            <span className="text-gradient">{t('heading.highlight')}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-muted text-lg max-w-2xl mx-auto">
            {t('description')}
          </motion.p>
          {/* Consent note */}
          <motion.p variants={fadeInUp} className="mt-3 text-xs text-text-muted/70 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-200 rounded-full" />
              {t('consentNote')}
            </span>
          </motion.p>
        </motion.div>

        {/* Stories — horizontal scroll on mobile, grid on desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 md:overflow-visible">
          <motion.div
            variants={staggerContainer}
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="flex gap-5 w-max sm:w-auto sm:grid sm:grid-cols-2 lg:grid-cols-4"
          >
            {stories.map((story, index) => {
              const background = STORY_BACKGROUNDS[index % STORY_BACKGROUNDS.length]
              const accentColor = STORY_ACCENTS[index % STORY_ACCENTS.length]
              const hasImage = Boolean(story.imageUrl)

              return (
                <motion.article
                  key={story.key}
                  variants={fadeInUp}
                  className="w-[280px] sm:w-auto bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden card-hover flex flex-col"
                  aria-label={t('aria.storyCard', { name: story.name })}
                >
                  {/* Illustration area */}
                  <div
                    className={`h-36 bg-gradient-to-br ${background} flex items-center justify-center relative overflow-hidden`}
                  >
                    {/* Subtle heartbeat line */}
                    <svg
                      className="absolute bottom-0 left-0 w-full opacity-15"
                      viewBox="0 0 280 32"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M0 16 L50 16 L65 6 L80 26 L95 4 L110 28 L125 16 L280 16"
                        stroke="#E53935"
                        strokeWidth="1.5"
                      />
                    </svg>

                    {hasImage ? (
                      <>
                        <img
                          src={story.imageUrl}
                          alt={story.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white bg-black/35 rounded-full px-2 py-0.5 backdrop-blur-sm">
                          {t('photoConsentTag')}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center shadow-sm mb-1">
                          <Heart
                            className={`w-8 h-8 ${accentColor} fill-current opacity-60`}
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-text-muted/70 bg-white/60 rounded-full px-2 py-0.5">
                          {t('photoConsentTag')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-heading font-bold text-text-base text-base">{story.name}</h3>
                      <Quote
                        className="w-5 h-5 text-gray-200 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-xs text-text-muted mb-3">{story.location}</p>

                    <div className="mb-3">
                      <span className={`inline-block text-[10px] font-semibold ${accentColor} bg-current/10 rounded-full px-2.5 py-1`}
                        style={{ backgroundColor: 'rgba(229,57,53,0.07)' }}
                      >
                        {story.condition}
                      </span>
                    </div>

                    <p className="text-sm text-text-muted leading-relaxed flex-1 mb-4">
                      {story.outcome}
                    </p>

                    <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                      <Heart className="w-3.5 h-3.5 text-primary fill-primary/50" aria-hidden="true" />
                      <p className="text-[11px] text-text-muted">
                        {t('fundedBy')}{' '}
                        <span className="font-semibold text-text-base">{story.fundedBy}</span>
                      </p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-text-muted mb-4">
            <span className="font-semibold text-text-base">{t('waitingList.highlight')}</span>{' '}
            {t('waitingList.text')}
          </p>
          <a
            href="#donate"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-heading font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
          >
            <Heart className="w-4 h-4 fill-white" />
            {t('cta')}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
