'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Heart, Lock, ArrowRight, RefreshCw, CheckCircle2, IndianRupee } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn, formatIndianCurrency } from '@/lib/utils'
import { fadeInUp, sectionStagger, scaleIn } from '@/lib/animations'

type Mode = 'one-time' | 'monthly'

const PRESET_AMOUNTS = [500, 2000, 5000, 10000, 25000, 50000] as const
const IMPACT_MAP: Record<number, string> = {
  500: 'screening',
  2000: 'medicines',
  5000: 'tests',
  10000: 'workup',
  25000: 'catheter',
  50000: 'surgery',
}

export default function DonationWidget() {
  const t = useTranslations('Donation')
  const locale = useLocale()
  const reduce = useReducedMotion()

  const [mode, setMode] = useState<Mode>('one-time')
  const [selected, setSelected] = useState<number>(2000)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const effectiveAmount = custom ? Number(custom) : selected
  const impactKey = IMPACT_MAP[effectiveAmount]
  const impactText = impactKey
    ? t(`impact.${impactKey}`)
    : t('impact.fallback', { count: Math.floor(effectiveAmount / 500) })

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '')
    setCustom(val)
    setSelected(0)
  }

  function handlePresetClick(amount: number) {
    setSelected(amount)
    setCustom('')
  }

  function handleDonate(e: React.FormEvent) {
    e.preventDefault()
    // Razorpay integration point — call /api/donations/create with {amount, mode, name, email}
    alert(
      t('alerts.redirecting', {
        amount: formatIndianCurrency(effectiveAmount, locale),
        mode: mode === 'one-time' ? t('modes.oneTime') : t('modes.monthly'),
      }),
    )
  }

  return (
    <section
      id="donate"
      aria-labelledby="donate-heading"
      className="section-py bg-gradient-to-b from-bg-warm to-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={sectionStagger}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="text-center mb-12"
        >
          <motion.p variants={fadeInUp} className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-3">
            {t('eyebrow')}
          </motion.p>
          <motion.h2
            id="donate-heading"
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

        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={scaleIn}
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden"
          >
            {/* ── One-time / Monthly toggle ─────── */}
            <div className="flex border-b border-gray-100">
              {(['one-time', 'monthly'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-heading font-semibold capitalize transition-all duration-200 min-h-[52px]',
                    mode === m
                      ? 'bg-primary/5 text-primary border-b-2 border-primary'
                      : 'text-text-muted hover:text-text-base',
                  )}
                  aria-pressed={mode === m}
                >
                  {m === 'monthly' && <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
                  {m === 'one-time' ? t('modes.oneTime') : t('modes.monthly')}
                </button>
              ))}
            </div>

            <form onSubmit={handleDonate} className="p-6 sm:p-8 space-y-6">
              {/* ── Preset chips ──────────────────── */}
              <fieldset>
                <legend className="text-sm font-heading font-semibold text-text-base mb-3">
                  {t('amount.choose')}
                </legend>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handlePresetClick(amount)}
                      className={cn(
                        'rounded-xl py-3 px-2 text-sm font-heading font-semibold transition-all duration-200 border-2 min-h-[44px]',
                        selected === amount && !custom
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 -translate-y-0.5'
                          : 'bg-bg-muted text-text-base border-transparent hover:border-primary/30 hover:bg-bg-warm',
                      )}
                      aria-pressed={selected === amount && !custom}
                    >
                      {formatIndianCurrency(amount, locale)}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* ── Custom amount ─────────────────── */}
              <div className="relative">
                <label htmlFor="custom-amount" className="text-sm font-heading font-semibold text-text-base block mb-2">
                  {t('amount.customLabel')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-text-muted">
                    <IndianRupee className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="custom-amount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t('amount.customPlaceholder')}
                    value={custom}
                    onChange={handleCustomChange}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 focus:border-primary rounded-xl text-base font-medium outline-none transition-colors duration-200 min-h-[52px]"
                    aria-label={t('aria.customAmount')}
                  />
                </div>
              </div>

              {/* ── Impact line ───────────────────── */}
              <AnimatePresence mode="wait">
                {effectiveAmount > 0 && (
                  <motion.div
                    key={effectiveAmount}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2.5 bg-bg-warm rounded-xl px-4 py-3 border border-primary/10"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-text-base leading-relaxed">
                      <span className="font-semibold">{formatIndianCurrency(effectiveAmount, locale)}</span> —{' '}
                      {impactText}
                      {mode === 'monthly' && (
                        <span className="text-text-muted"> {t('amount.billedMonthly')}</span>
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Name & Email ──────────────────── */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor-name" className="text-xs font-semibold text-text-muted block mb-1.5">
                    {t('form.nameLabel')} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="donor-name"
                    type="text"
                    required
                    placeholder={t('form.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:border-primary rounded-xl text-sm outline-none transition-colors duration-200 min-h-[44px]"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="donor-email" className="text-xs font-semibold text-text-muted block mb-1.5">
                    {t('form.emailLabel')} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="donor-email"
                    type="email"
                    required
                    placeholder={t('form.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:border-primary rounded-xl text-sm outline-none transition-colors duration-200 min-h-[44px]"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* ── Submit button ─────────────────── */}
              <button
                type="submit"
                disabled={!effectiveAmount || effectiveAmount < 1}
                className={cn(
                  'w-full flex items-center justify-center gap-2.5 py-4 rounded-full font-heading font-bold text-base transition-all duration-200 min-h-[56px]',
                  effectiveAmount > 0
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                )}
                aria-disabled={!effectiveAmount}
              >
                <Heart className="w-5 h-5 fill-white" aria-hidden="true" />
                {effectiveAmount > 0
                  ? t('cta.donateAmount', {
                      amount: formatIndianCurrency(effectiveAmount, locale),
                      suffix: mode === 'monthly' ? t('cta.perMonthSuffix') : '',
                    })
                  : t('cta.chooseAmount')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* ── Trust badges row ─────────────── */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Lock className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
                  {t('trust.secure')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  {t('trust.receipt')}
                </div>
              </div>

              {/* ── Payment icons ──────────────────── */}
              <p className="text-center text-xs text-text-muted/60">
                {t('paymentMethods')}
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
