import { ShieldCheck, Award, FileCheck, Hospital, Lock, BadgeCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const TRUST_ITEMS = [
  { icon: ShieldCheck, key: 'registeredNgo' },
  { icon: FileCheck, key: 'approved80g' },
  { icon: Award, key: 'certified12a' },
  { icon: Hospital, key: 'partnerHospitals' },
  { icon: Lock, key: 'razorpaySecured' },
  { icon: BadgeCheck, key: 'csrEligible' },
  { icon: ShieldCheck, key: 'childrenTreated' },
]

// Duplicate for seamless infinite loop
const ITEMS_DOUBLED = [...TRUST_ITEMS, ...TRUST_ITEMS]

function TrustBadge({
  icon: Icon,
  label,
  sub,
}: {
  icon: (typeof TRUST_ITEMS)[number]['icon']
  label: string
  sub: string
}) {
  return (
    <li
      className="flex min-h-[52px] flex-shrink-0 select-none items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm sm:min-h-[56px] sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3"
      aria-hidden="false"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-8 sm:w-8 sm:rounded-xl">
        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className="whitespace-nowrap font-ui text-xs font-semibold tracking-tight text-text-base sm:text-[13px]">
          {label}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[10px] text-text-muted sm:text-[11px]">{sub}</p>
      </div>
    </li>
  )
}

export default async function TrustStrip({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'TrustStrip' })

  return (
    <section
      aria-label={t('aria.section')}
      className="relative bg-gradient-to-b from-gray-50 to-white border-y border-gray-100 py-3 overflow-hidden marquee-track"
    >
      {/* Left fade mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-gray-50 to-transparent sm:w-20"
      />
      {/* Right fade mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:w-20"
      />

      {/* Marquee track — items doubled for seamless loop */}
      <ul
        className="flex w-max animate-marquee items-center gap-3 sm:gap-4"
        role="list"
        aria-label={t('aria.list')}
      >
        {ITEMS_DOUBLED.map(({ icon, key }, i) => (
          <TrustBadge
            key={`${key}-${i}`}
            icon={icon}
            label={t(`items.${key}.label`)}
            sub={t(`items.${key}.sub`)}
          />
        ))}
      </ul>
    </section>
  )
}
