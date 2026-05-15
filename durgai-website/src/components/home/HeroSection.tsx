'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Heart, ArrowRight, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, fadeInRight, staggerContainer, staggerSlow } from '@/lib/animations'
import { cn } from '@/lib/utils'

export default function HeroSection() {
  const t = useTranslations('Hero')
  const reduce = useReducedMotion()
  const touchStartXRef = useRef<number | null>(null)
  const [activeMobileSlide, setActiveMobileSlide] = useState(0)
  const [mobileSlideProgress, setMobileSlideProgress] = useState(0)
  const trustBadges = t.raw('trustBadges') as string[]
  const rawSocialProofAvatars = t.raw('socialProofAvatars')
  const cardImageUrl = t('cardImageUrl')
  const fallbackMobileCaption = t.has('eyebrow') ? t('eyebrow') : ''
  const rawMobileBackgroundSlides = t.has('mobileBackgroundSlides')
    ? t.raw('mobileBackgroundSlides')
    : []
  const mobileBackgroundImageUrl = t.has('mobileBackgroundImageUrl')
    ? t('mobileBackgroundImageUrl').trim()
    : ''
  const effectiveMobileBackgroundImageUrl = mobileBackgroundImageUrl || cardImageUrl.trim()
  const mobileBackgroundSlides = useMemo(() => {
    if (!Array.isArray(rawMobileBackgroundSlides)) {
      return effectiveMobileBackgroundImageUrl
        ? [{ imageUrl: effectiveMobileBackgroundImageUrl, caption: '' }]
        : []
    }

    const slides = rawMobileBackgroundSlides
      .filter((item): item is { imageUrl?: string; caption?: string } => typeof item === 'object' && item !== null)
      .map((item) => ({
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '',
        caption: typeof item.caption === 'string' && item.caption.trim() ? item.caption.trim() : fallbackMobileCaption,
      }))
      .filter((item) => item.imageUrl.length > 0)
      .slice(0, 3)

    if (slides.length > 0) {
      return slides
    }

    return effectiveMobileBackgroundImageUrl
      ? [{ imageUrl: effectiveMobileBackgroundImageUrl, caption: '' }]
      : []
  }, [effectiveMobileBackgroundImageUrl, fallbackMobileCaption, rawMobileBackgroundSlides])
  const hasMobileBackgroundImage = mobileBackgroundSlides.length > 0
  const activeMobileCaption = mobileBackgroundSlides[activeMobileSlide]?.caption ?? ''

  useEffect(() => {
    if (activeMobileSlide < mobileBackgroundSlides.length) return
    setActiveMobileSlide(0)
  }, [activeMobileSlide, mobileBackgroundSlides.length])

  useEffect(() => {
    setMobileSlideProgress(0)
  }, [activeMobileSlide, mobileBackgroundSlides.length])

  useEffect(() => {
    if (mobileBackgroundSlides.length <= 1) return

    const tickMs = 100
    const rotateMs = 5000
    const timer = window.setInterval(() => {
      setMobileSlideProgress((current) => {
        const next = current + (tickMs / rotateMs) * 100
        if (next >= 100) {
          setActiveMobileSlide((previous) => (previous + 1) % mobileBackgroundSlides.length)
          return 0
        }
        return next
      })
    }, tickMs)

    return () => window.clearInterval(timer)
  }, [mobileBackgroundSlides.length])

  function goToMobileSlide(index: number) {
    if (mobileBackgroundSlides.length === 0) return
    const normalized = (index + mobileBackgroundSlides.length) % mobileBackgroundSlides.length
    setActiveMobileSlide(normalized)
    setMobileSlideProgress(0)
  }

  function handleMobileTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  function handleMobileTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current
    const endX = event.changedTouches[0]?.clientX ?? null
    touchStartXRef.current = null

    if (startX === null || endX === null || mobileBackgroundSlides.length <= 1) {
      return
    }

    const delta = endX - startX
    const minSwipeDistance = 45
    if (Math.abs(delta) < minSwipeDistance) return

    if (delta < 0) {
      goToMobileSlide(activeMobileSlide + 1)
    } else {
      goToMobileSlide(activeMobileSlide - 1)
    }
  }
  const socialProofAvatars = Array.isArray(rawSocialProofAvatars)
    ? rawSocialProofAvatars
      .filter((item): item is { imageUrl?: string } => typeof item === 'object' && item !== null)
      .map((item) => ({ imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '' }))
    : []
  const fallbackGradients = ['from-pink-200 to-red-300', 'from-red-200 to-rose-400', 'from-rose-100 to-pink-300', 'from-orange-100 to-red-200']
  const avatarsToRender = (socialProofAvatars.length
    ? socialProofAvatars.map((avatar, index) => ({
      imageUrl: avatar.imageUrl,
      gradient: fallbackGradients[index % fallbackGradients.length],
    }))
    : fallbackGradients.map((gradient) => ({ imageUrl: '', gradient })))
  const statCards = [
    { value: t('cardStatValues.children'), label: t('cardStats.children') },
    { value: t('cardStatValues.surgeries'), label: t('cardStats.surgeries') },
    { value: t('cardStatValues.camps'), label: t('cardStats.camps') },
  ]

  return (
    <section
      id="hero"
      className="relative w-full flex items-start overflow-x-clip pt-16 pb-10 lg:min-h-screen lg:pt-16 lg:pb-0"
      aria-label={t('aria.section')}
    >
      {/* ── Background gradients ─────────────────── */}
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-br from-white via-white to-bg-warm md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-secondary/25 to-transparent md:block" />

      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-24 right-16 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary/30 blur-[80px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <div
            className="relative left-1/2 h-[36svh] min-h-[220px] w-screen -translate-x-1/2 overflow-hidden sm:h-[42svh] sm:min-h-[270px]"
            onTouchStart={handleMobileTouchStart}
            onTouchEnd={handleMobileTouchEnd}
            aria-label="Hero image carousel"
          >
            {hasMobileBackgroundImage ? (
              mobileBackgroundSlides.map((slide, index) => (
                <img
                  key={`${slide.imageUrl}-${index}`}
                  src={slide.imageUrl}
                  alt=""
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-opacity duration-600 ease-out',
                    index === activeMobileSlide ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-bg-warm via-secondary/50 to-primary-light/25" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-900/20 to-slate-950/35" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

            <div className="absolute inset-x-0 bottom-3 z-20 flex items-end justify-between gap-3 px-4">
              <button
                type="button"
                onClick={() => goToMobileSlide(activeMobileSlide - 1)}
                className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/35"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="pointer-events-none flex-1 text-center">
                <p className="line-clamp-2 text-xs font-semibold text-white/95">{activeMobileCaption}</p>
                {mobileBackgroundSlides.length > 1 ? (
                  <div className="mx-auto mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/30">
                    <span
                      className="block h-full rounded-full bg-white transition-all duration-150"
                      style={{ width: `${Math.max(0, Math.min(mobileSlideProgress, 100))}%` }}
                    />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => goToMobileSlide(activeMobileSlide + 1)}
                className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/35"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <motion.div
            variants={staggerSlow}
            initial={false}
            animate="visible"
            className="relative z-20 px-0 pb-5 pt-5"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-secondary/60 px-4 py-1.5 text-sm font-semibold text-primary">
                <Heart className="h-3.5 w-3.5 fill-primary" aria-hidden="true" />
                {t('eyebrow')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mb-5 text-center font-heading text-[2.1rem] font-extrabold leading-[1.1] tracking-tight text-text-base sm:text-4xl"
            >
              {t('heading.line1')}{' '}
              <span className="text-gradient">{t('heading.highlight1')}</span>
              <br />{t('heading.line2')}{' '}
              <span className="relative inline-block">
                <span className="text-gradient">{t('heading.highlight2')}</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 220 10"
                  fill="none"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 6 Q55 2 110 6 Q165 10 218 6"
                    stroke="#FFCDD2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mb-7 max-w-[520px] text-center text-base leading-relaxed text-text-muted sm:text-lg"
            >
              {t('subtext.before')}{' '}
              <strong className="font-semibold text-text-base">{t('subtext.age')}</strong>
              {t('subtext.after')}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col gap-3">
              <Link
                href="#donate"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-heading font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-1 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/35 active:translate-y-0"
              >
                <Heart className="h-5 w-5 fill-white transition-transform group-hover:scale-110" />
                {t('cta.primary')}
              </Link>
              <Link
                href="#impact"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-text-base/20 px-7 py-4 text-base font-heading font-semibold text-text-base transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:text-primary active:translate-y-0"
              >
                {t('cta.secondary')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-4">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {avatarsToRender.map((avatar, i) => (
                  <div
                    key={i}
                    className={cn('h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br', avatar.gradient)}
                  >
                    {avatar.imageUrl.trim() ? (
                      <img
                        src={avatar.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-text-muted">
                <span className="font-bold text-text-base">{t('socialProof.highlight')}</span>{' '}
                {t('socialProof.text')}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-text-muted shadow-sm"
                >
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  {badge}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="hidden items-center gap-12 py-2 md:grid lg:grid-cols-2 lg:gap-8 lg:py-12">

          {/* ── Left: Text ───────────────────────── */}
          <motion.div
            variants={staggerSlow}
            initial={false}
            animate="visible"
            className="w-full text-center lg:text-left"
          >
            {/* Eyebrow pill */}
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 bg-secondary/60 text-primary rounded-full px-4 py-1.5 text-sm font-semibold border border-primary/10 mb-6">
                <Heart className="w-3.5 h-3.5 fill-primary" aria-hidden="true" />
                {t('eyebrow')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="mb-6 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-text-base sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]"
            >
              {t('heading.line1')}{' '}
              <span className="text-gradient">{t('heading.highlight1')}</span>
              <br />{t('heading.line2')}{' '}
              <span className="relative inline-block">
                <span className="text-gradient">{t('heading.highlight2')}</span>
                {/* Underline decoration */}
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 220 10"
                  fill="none"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 6 Q55 2 110 6 Q165 10 218 6"
                    stroke="#FFCDD2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Sub text */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto mb-8 max-w-[520px] text-lg leading-relaxed text-text-muted sm:text-xl lg:mx-0"
            >
              {t('subtext.before')}{' '}
              <strong className="font-semibold text-text-base">{t('subtext.age')}</strong>
              {t('subtext.after')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link
                href="#donate"
                className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-heading font-bold text-base px-7 py-4 rounded-full transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-1 active:translate-y-0 min-h-[52px]"
              >
                <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                {t('cta.primary')}
              </Link>
              <Link
                href="#impact"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-text-base/20 px-7 py-4 text-base font-heading font-semibold text-text-base transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:text-primary active:translate-y-0"
              >
                {t('cta.secondary')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Social proof row */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2.5" aria-hidden="true">
                {avatarsToRender.map((avatar, i) => (
                  <div
                    key={i}
                    className={cn('w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br', avatar.gradient)}
                  >
                    {avatar.imageUrl.trim() ? (
                      <img
                        src={avatar.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-text-muted">
                <span className="font-bold text-text-base">{t('socialProof.highlight')}</span>{' '}
                {t('socialProof.text')}
              </p>
            </motion.div>

            {/* Trust micro-badges */}
            <motion.div
              variants={fadeInUp}
              className="mt-6 flex flex-wrap items-center gap-3 justify-center lg:justify-start"
            >
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm"
                >
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  {badge}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Visual card ───────────────── */}
          <motion.div
            variants={fadeInRight}
            initial={false}
            animate="visible"
            className="relative hidden lg:flex justify-center items-center"
          >
            <div className="relative w-[420px] h-[440px]">
              {/* Glow */}
              <div
                aria-hidden="true"
                className="absolute inset-4 bg-gradient-to-br from-secondary via-primary-light/40 to-transparent rounded-[2rem] blur-2xl opacity-60"
              />

              {/* Card */}
              <div className="relative bg-white rounded-[2rem] shadow-[0_40px_80px_rgba(229,57,53,0.12)] overflow-hidden border border-white">
                {/* Illustration area */}
                <div className="relative h-60 bg-gradient-to-br from-bg-warm via-secondary/50 to-primary-light/25 overflow-hidden">
                  {/* Heartbeat line */}
                  <svg
                    className="absolute bottom-0 left-0 w-full opacity-20"
                    viewBox="0 0 420 60"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 30 L80 30 L100 10 L120 50 L140 5 L160 55 L180 30 L420 30"
                      stroke="#E53935"
                      strokeWidth="2"
                    />
                  </svg>

                  {cardImageUrl.trim() ? (
                    <motion.div
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      className="absolute inset-0"
                      role="img"
                      aria-label={t('aria.animatedHeart')}
                    >
                      <img
                        src={cardImageUrl}
                        alt={t('aria.animatedHeart')}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-primary/30 bg-white/60 px-6 text-center text-sm font-semibold text-primary">
                      <motion.span
                        animate={{ opacity: [0.75, 1, 0.75] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                      >
                        {t('imagePlaceholder')}
                      </motion.span>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between px-6 py-5">
                  {statCards.map((stat, i) => (
                    <div key={stat.label} className="text-center">
                      {i > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-100" />
                      )}
                      <p className="font-heading text-xl font-extrabold text-primary">{stat.value}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge — 80G */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-3.5 py-2.5 flex items-center gap-2.5 border border-gray-100"
              >
                <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-text-base">{t('floatingBadge.tax.title')}</p>
                  <p className="text-[10px] text-text-muted">{t('floatingBadge.tax.sub')}</p>
                </div>
              </motion.div>

              {/* Floating badge — Rating */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-3.5 py-2.5 flex items-center gap-2.5 border border-gray-100"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-text-base">{t('floatingBadge.impact.title')}</p>
                  <p className="text-[10px] text-text-muted">{t('floatingBadge.impact.sub')}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────── */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted/60">
          {t('scroll')}
        </p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-[22px] h-8 border-2 border-gray-300 rounded-full flex justify-center pt-1.5"
        >
          <span className="w-1 h-2 bg-text-muted/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
