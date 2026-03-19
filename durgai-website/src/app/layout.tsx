import {
  Playfair_Display,
  DM_Sans,
  Merriweather,
  Inter,
  Noto_Sans_Devanagari,
  Noto_Serif_Devanagari,
} from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-en-heading',
  weight: ['400', '700', '900'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-en-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['latin', 'devanagari'],
  variable: '--font-devanagari-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ['latin', 'devanagari'],
  variable: '--font-devanagari-heading',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${merriweather.variable} ${inter.variable} ${notoSansDevanagari.variable} ${notoSerifDevanagari.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased">
        {/* Skip to main content (accessibility) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
