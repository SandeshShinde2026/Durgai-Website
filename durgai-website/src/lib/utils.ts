import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(amount: number, locale = 'en'): string {
  const numberLocale = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN'

  return new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
