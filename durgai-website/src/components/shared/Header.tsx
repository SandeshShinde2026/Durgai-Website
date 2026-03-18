'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Heart, ChevronDown, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#impact', key: 'impact' },
  { href: '#about', key: 'about' },
  { href: '#need-help', key: 'needHelp' },
  { href: '#stories', key: 'stories' },
  { href: '#transparency', key: 'transparency' },
  { href: '#contact', key: 'contact' },
]

export default function Header() {
  const t = useTranslations('Header')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isLocaleSwitching, startLocaleTransition] = useTransition()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const pathWithoutLocale = useMemo(() => {
    const currentPath = pathname ?? '/'
    const normalized = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
    return normalized || '/'
  }, [pathname])

  const getHomeSectionHref = (hash: string) => `/${locale}${hash}`

  const localeOptions = routing.locales
  const sectionHashes = useMemo(() => NAV_LINKS.map((link) => link.href), [])

  const handleLocaleChange = (targetLocale: string) => {
    if (!targetLocale || targetLocale === locale) {
      return
    }

    startLocaleTransition(() => {
      router.replace(pathWithoutLocale, { locale: targetLocale as AppLocale, scroll: false })
    })
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    localeOptions.forEach((targetLocale) => {
      if (targetLocale !== locale) {
        router.prefetch(pathWithoutLocale, { locale: targetLocale })
      }
    })
  }, [locale, localeOptions, pathWithoutLocale, router])

  useEffect(() => {
    if (pathWithoutLocale !== '/') {
      const currentHash = window.location.hash
      setActiveSection(sectionHashes.includes(currentHash) ? currentHash : '')
      return
    }

    const offset = 130
    const getSectionFromScroll = () => {
      let current = sectionHashes[0] ?? ''

      sectionHashes.forEach((hash) => {
        const element = document.getElementById(hash.replace('#', ''))
        if (!element) return
        if (element.getBoundingClientRect().top <= offset) {
          current = hash
        }
      })

      setActiveSection(current)
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash
      if (sectionHashes.includes(currentHash)) {
        setActiveSection(currentHash)
      } else {
        getSectionFromScroll()
      }
    }

    getSectionFromScroll()
    window.addEventListener('scroll', getSectionFromScroll, { passive: true })
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('scroll', getSectionFromScroll)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [pathWithoutLocale, sectionHashes])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[70] transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-white/90 backdrop-blur-sm py-3',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* ── Logo ─────────────────────────────── */}
            <Link
              href={`/${locale}`}
              className="flex flex-1 items-center gap-2.5 group focus-visible:outline-primary min-w-0 md:flex-none"
              aria-label={t('logoAria')}
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="leading-none min-w-0">
                <p className="font-heading font-bold text-[13px] sm:text-[15px] text-primary truncate">{t('brand.top')}</p>
                <p className="hidden sm:block font-heading font-medium text-[11px] text-text-muted tracking-wide truncate">
                  {t('brand.bottom')}
                </p>
              </div>
            </Link>

            {/* ── Desktop nav ──────────────────────── */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={getHomeSectionHref(link.href)}
                  aria-current={activeSection === link.href ? 'location' : undefined}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    activeSection === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-text-muted hover:text-primary hover:bg-primary/5',
                  )}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
            </nav>

            {/* ── Language switcher (desktop/tablet) ───────────── */}
            <div className="hidden md:flex items-center ml-3">
              <label htmlFor="language-switcher-desktop" className="sr-only">
                {t('language.label')}
              </label>
              <div className="relative w-[168px]">
                <select
                  id="language-switcher-desktop"
                  value={locale}
                  onChange={(event) => handleLocaleChange(event.target.value)}
                  className="w-full appearance-none rounded-full border border-primary/30 bg-primary/10 px-4 py-2 pr-10 text-sm font-semibold text-primary shadow-sm cursor-pointer transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary disabled:opacity-70 disabled:cursor-wait"
                  aria-label={t('language.label')}
                  aria-busy={isLocaleSwitching}
                  disabled={isLocaleSwitching}
                >
                  {localeOptions.map((targetLocale) => (
                    <option key={targetLocale} value={targetLocale}>
                      {t(`language.names.${targetLocale}`)}
                    </option>
                  ))}
                </select>
                {isLocaleSwitching ? (
                  <Loader2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                ) : (
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                )}
              </div>
            </div>

            {/* ── Desktop CTA ──────────────────────── */}
            <Link
              href={getHomeSectionHref('#donate')}
              className="hidden xl:inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
            >
              <Heart className="w-4 h-4 fill-white" />
              {t('donateNow')}
            </Link>

            {/* ── Language switcher (mobile) ───────────────────── */}
            <div className="md:hidden flex items-center ml-auto">
              <label htmlFor="language-switcher-mobile" className="sr-only">
                {t('language.label')}
              </label>
              <div className="relative w-[104px] sm:w-[128px]">
                <select
                  id="language-switcher-mobile"
                  value={locale}
                  onChange={(event) => handleLocaleChange(event.target.value)}
                  className="w-full appearance-none rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1.5 pr-7 text-xs font-semibold text-primary shadow-sm cursor-pointer transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary disabled:opacity-70 disabled:cursor-wait"
                  aria-label={t('language.label')}
                  aria-busy={isLocaleSwitching}
                  disabled={isLocaleSwitching}
                >
                  {localeOptions.map((targetLocale) => (
                    <option key={targetLocale} value={targetLocale}>
                      {t(`language.names.${targetLocale}`)}
                    </option>
                  ))}
                </select>
                {isLocaleSwitching ? (
                  <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary animate-spin" />
                ) : (
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                )}
              </div>
            </div>

            {/* ── Mobile menu toggle ──────────────── */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="xl:hidden p-2 ml-1 shrink-0 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={menuOpen ? t('menu.close') : t('menu.open')}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-text-base" />
              ) : (
                <Menu className="w-6 h-6 text-text-base" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm xl:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="fixed top-0 right-0 bottom-0 z-[80] w-[280px] bg-white shadow-2xl xl:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label={t('menu.navigation')}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <p className="font-heading font-bold text-sm text-primary">{t('brand.top')}</p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={t('menu.close')}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col flex-1 overflow-y-auto px-4 py-4 gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={getHomeSectionHref(link.href)}
                    onClick={() => setMenuOpen(false)}
                    aria-current={activeSection === link.href ? 'location' : undefined}
                    className={cn(
                      'flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 min-h-[44px]',
                      activeSection === link.href
                        ? 'text-primary bg-primary/10'
                        : 'text-text-base hover:text-primary hover:bg-bg-warm',
                    )}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
              </nav>

              {/* Donate CTA */}
              <div className="px-4 py-5 border-t border-gray-100">
                <Link
                  href={getHomeSectionHref('#donate')}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 px-6 rounded-full w-full hover:bg-primary-dark transition-all duration-200 min-h-[44px]"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  {t('donateNow')}
                </Link>
                <p className="text-center text-xs text-text-muted mt-3">
                  {t('taxLine')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
