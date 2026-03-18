import { ShieldCheck, Award, FileCheck, Globe, Hospital, Lock, BadgeCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const TRUST_ITEMS = [
  { icon: ShieldCheck, key: 'registeredNgo' },
  { icon: FileCheck, key: 'approved80g' },
  { icon: Award, key: 'certified12a' },
  { icon: Globe, key: 'fcraApproved' },
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
      className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm select-none min-h-[56px]"
      aria-hidden="false"
    >
      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className="font-ui font-semibold text-[13px] text-text-base whitespace-nowrap tracking-tight">
          {label}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5 whitespace-nowrap">{sub}</p>
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
        className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"
      />
      {/* Right fade mask */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
      />

      {/* Marquee track — items doubled for seamless loop */}
      <ul
        className="flex items-center gap-4 animate-marquee w-max"
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
