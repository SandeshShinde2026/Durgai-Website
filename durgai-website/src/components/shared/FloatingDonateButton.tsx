'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

const SCROLL_THRESHOLD = 80   // px below which button hides

export default function FloatingDonateButton() {
  const t = useTranslations('FloatingDonateButton')
  const [showDesktop, setShowDesktop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowDesktop(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showDesktop && (
          <motion.div
            key="float-desktop"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-8 right-6 z-[70] hidden xl:block"
          >
            <Link
              href="#donate"
              aria-label={t('aria.donateNow')}
              className="group relative flex items-center gap-2.5 bg-primary text-white font-heading font-bold text-sm pl-4 pr-5 h-12 rounded-full shadow-[0_8px_30px_rgba(229,57,53,0.4)] hover:bg-primary-dark hover:shadow-[0_12px_40px_rgba(229,57,53,0.5)] transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
            >
              <span className="absolute inset-0 rounded-full ring-2 ring-primary/40 scale-110 animate-[pulseRing_2s_ease-in-out_infinite]" />
              <Heart className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>{t('donateNow')}</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key="float-mobile"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed bottom-0 left-0 right-0 z-[70] xl:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted leading-tight truncate">{t('mobileLine1')}</p>
            <p className="text-[11px] text-text-muted/70 truncate">{t('mobileLine2')}</p>
          </div>
          <Link
            href="#donate"
            className="flex-shrink-0 flex items-center gap-2 bg-primary text-white font-heading font-bold text-sm px-5 py-3 rounded-full shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-200 min-h-[44px] whitespace-nowrap"
          >
            <Heart className="w-4 h-4 fill-white" />
            {t('donateNow')}
          </Link>
        </div>
      </motion.div>
    </>
  )
}
