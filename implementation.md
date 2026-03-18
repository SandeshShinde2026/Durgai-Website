# Durgai Hruday Prathisthan Website — Implementation Plan

## 1) Project Goal

Design and build a premium, trustworthy NGO website for heart health that maximizes:

- **Trust** (medical credibility + transparency)
- **Conversion** (donations, volunteer/CSR leads, help requests)

Delivery principle: **mobile-first UI by default**, then progressively enhance for tablet and desktop.

Brand emotion to achieve: **Hospital-grade reliability + modern premium feel**.

---

## 2) Design Direction (Approved)

- Style: **Minimal + Clean + Emotional**
- Visual tone: white space heavy, soft red accents, calm typography
- Core color palette:
  - Primary: `#E53935`
  - Secondary: `#FFCDD2`
  - Background: `#FFFFFF`, `#FAFAFA`
- Font system:
  - Headings: **Inter** (or Poppins)
  - Body: **Open Sans**
- UI behavior:
  - soft fade-in on scroll
  - subtle hover states
  - sticky donate CTA

### Mobile-first UI rules (non-negotiable)

- Start design at `360px/375px` viewport widths first; scale up to larger screens.
- Keep primary actions within thumb reach: **Donate Now**, **Need Help**, **Call/Contact**.
- Use one-column content flow on mobile (no side-by-side critical content blocks).
- Ensure all tap targets are at least `44x44px`.
- Keep the donation flow single-screen and mobile-optimized before desktop polish.
- Keep section spacing generous to preserve premium feel on small screens.

Golden rule: If the experience feels like a blend of medical-grade trust and modern premium UI, we are on target.

---

## 3) Final Homepage Information Architecture

1. Header
2. Hero
3. Trust Strip (immediately below hero)
4. Impact Stats
5. About NGO
6. Success Stories
7. How You Can Help
8. Trust & Transparency
9. Donation Section (single-screen flow)
10. Footer

---

## 4) Wireframe + Final Copy (Build-Ready)

## Header

- Logo: **Durgai Hruday Prathisthan**
- Primary navigation:
  - Need Help
  - Donate
  - Volunteer/CSR
  - About
  - Impact
  - Stories
  - Contact
- Primary CTA: **Donate Now**
- Mobile: sticky bottom Donate Now button

## Hero

- Eyebrow: `Durgai Hruday Prathisthan`
- Headline: **Every Heart Deserves a Chance to Beat Strong**
- Subtext: **Free heart checkups & life-saving surgeries for children (0–13).**
- Buttons:
  - Primary: **Donate Now**
  - Secondary: **See Impact**
- Media rule: use only real child/family visuals with guardian consent (no generic stock)

## Trust Strip (below hero)

Single-line trust bar with icon chips:

- Registered NGO
- 80G Approved
- 12A Approved
- FCRA (if applicable)
- Partner Hospitals
- Secure Payments (Razorpay/UPI/Cards)

Supporting copy:

> 100% transparency. Audited reports published annually.

## Impact Stats

Section title: **Your Support in Action**

Stat cards (animated count-up):

- ❤️ 1200+ Children Treated
- 🏥 300+ Surgeries Funded
- 🩺 50+ Health Camps

Supporting line:

> Every number is a child, a family, and a second chance.

## About NGO

Title: **Who We Are**

Copy:

> We partner with pediatric cardiologists and trusted hospitals to provide screening, diagnosis support, surgery funding, and follow-up care for underprivileged children.

## Success Stories

Title: **Stories of Hope**

Each card includes:

- Child photo
- First name
- Before → Treatment → After (3 lines max)
- Tag line: **Funded by donors like you**
- CTA: **Read Full Story**

Mandatory compliance note:

> Stories are published only with explicit family/guardian consent.

## How You Can Help

Cards:

- Sponsor a Child’s Checkup
- Fund a Surgery
- Volunteer / CSR Partnership

CTAs:

- Donate
- Become a Volunteer
- Partner with Us

## Trust & Transparency

Title: **Trust, Transparency, and Accountability**

### Where funds go (mini-breakdown)

- 20% Early checkups and diagnostics
- 65% Surgeries and hospital care
- 15% Post-surgery medicines and follow-up

### Documents / proof links

- NGO Registration Certificate
- 80G Certificate
- 12A Certificate
- FCRA Certificate (if applicable)
- Annual Report
- Audited Financial Report

### Additional trust items

- Partner hospital logos
- Payment security badges
- “Last audit updated on: DD MMM YYYY”

## Donation Section (single-screen conversion flow)

Title: **Choose Your Impact**

Donation UI:

- Toggle: **One-time | Monthly**
- Preset amount chips:
  - ₹500 — Child heart checkup
  - ₹2000 — Medicines & diagnostics
  - ₹50,000 — Life-saving surgery support
- Custom amount field
- Payment methods shown in one view:
  - UPI
  - Cards
  - NetBanking
  - Wallets
- Primary CTA: **Donate Securely Now**

Tax line:

> Eligible donations can avail tax benefits under 80G.

## Footer

- Contact details: address, phone, email
- Quick links: Need Help, Donate, Volunteer/CSR, Reports, Privacy, Terms
- Social links
- Medical disclaimer:

> Medical information on this website is for awareness only and not a substitute for professional diagnosis or treatment.

- Medical review line:

> Medical content reviewed by [Doctor Name, Qualification] | Last reviewed: 18 Mar 2026

---

## 5) Best Tech Stack (Next.js-First)

You requested Next.js. Recommended production stack:

## Frontend

- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS** (mobile-first utility system)
- **shadcn/ui** (accessible primitives)
- **Framer Motion** (subtle motion + count-up triggers)

## Backend / API

- **Next.js Route Handlers** for donation/order APIs
- **Razorpay** for checkout + webhook verification
- **Zod** for request validation
- **Drizzle ORM** for type-safe database access from API routes

## CMS / Content Operations

- **Sanity** (recommended) for non-technical content editing:
  - stories
  - impact stats
  - partner hospitals
  - trust documents
  - homepage blocks

## Data / Storage

- **Neon PostgreSQL** (primary database) for operational records:
  - donation intents
  - verified transaction references
  - lead forms
  - volunteer/CSR submissions
- **Drizzle Kit** for schema migrations and versioned database changes
- **Cloudinary** (or S3) for optimized image delivery

## Auth (Admin-only if needed)

- **NextAuth.js / Auth.js** for protected admin pages (optional if using only CMS roles)

## Observability + Analytics

- **Google Analytics 4**
- **Microsoft Clarity** (optional heatmaps)
- **Sentry** for production error tracking

## Hosting + Delivery

- **Vercel** for deployment and edge delivery
- **Cloudflare** DNS + WAF/CDN (optional enhancement)

---

## 6) Technical Architecture

## Route Map

- `/` — Homepage
- `/need-help`
- `/donate`
- `/volunteer-csr`
- `/stories`
- `/impact`
- `/about`
- `/transparency`
- `/contact`

## API Endpoints

- `POST /api/donation/create-order`
- `POST /api/donation/verify-payment`
- `POST /api/webhooks/razorpay`
- `POST /api/leads/volunteer`
- `POST /api/leads/help-request`

## Homepage Components

- `Header`
- `HeroSection`
- `TrustStrip`
- `ImpactStats`
- `AboutSection`
- `StoriesPreview`
- `HowYouCanHelp`
- `TransparencySection`
- `DonationWidget`
- `Footer`

---

## 7) Content Model (CMS)

## Story

- childFirstName
- age
- location
- beforeSummary
- treatmentSummary
- afterSummary
- heroImage
- familyConsentSigned (boolean)
- consentDocumentRef
- publishStatus

## Impact Stat

- label
- value
- icon
- order
- lastUpdated

## Trust Document

- title
- type (80G, 12A, FCRA, audit, registration)
- fileUrl
- validFrom
- validTo
- displayOrder

## Partner Hospital

- name
- logo
- city
- accreditationNote

---

## 8) Donation UX Requirements (Strict)

- One-screen checkout handoff
- Preset + custom amount visible together
- Monthly toggle visible without scrolling
- Payment methods visible before click
- Success page with receipt + tax note
- Webhook-based payment verification before marking success
- Retry mechanism for failed payments

---

## 9) Trust, Safety, and Compliance

- HTTPS enforced
- No sensitive card data stored on NGO servers
- Razorpay webhook signature verification mandatory
- Privacy policy and donation terms in footer
- Explicit guardian consent records for child images/stories
- Medical disclaimer visible site-wide footer
- Medical content review metadata on relevant pages

---

## 10) Performance + Accessibility Standards

## Performance

- Lighthouse target: 90+
- LCP < 2.5s on 4G mobile
- CLS < 0.1
- Use Next Image, responsive sizes, lazy loading
- Prioritize mobile bundle size and above-the-fold render speed before desktop enhancements

## Accessibility

- WCAG 2.2 AA target
- keyboard navigable forms/buttons
- visible focus states
- semantic headings and landmarks
- min 4.5:1 text contrast

## Mobile UX acceptance criteria

- Test baseline breakpoints: `360`, `375`, `390`, `412` widths.
- Sticky **Donate Now** CTA always visible on mobile (header or bottom bar).
- Donation journey completable with one hand and minimal scrolling.
- Core actions reachable in first viewport: **Donate**, **Need Help**, **See Impact**.
- No horizontal scroll on any page section.

---

## 11) SEO and Discoverability

- Next.js metadata API per page
- Organization + Nonprofit + FAQ structured data
- Open Graph + Twitter cards
- XML sitemap + robots
- Fast mobile indexing and optimized image alt text

---

## 12) Phased Build Plan

## Phase 1 (MVP — 2 to 3 weeks)

- Complete homepage
- Razorpay donation flow
- Need Help + Contact forms
- Trust docs page
- Responsive + SEO + analytics

## Phase 2 (Growth — 2 weeks)

- Stories detail pages from CMS
- Camp map section
- Live donation counter
- Volunteer/CSR lead workflow

## Phase 3 (Advanced)

- AI chatbot (FAQs + triage direction)
- Short video story reels
- Personalization experiments (A/B hero variants)

---

## 13) Suggested Project Folder Structure (Next.js)

```txt
src/
  app/
    (site)/
      page.tsx
      need-help/page.tsx
      donate/page.tsx
      volunteer-csr/page.tsx
      stories/page.tsx
      impact/page.tsx
      about/page.tsx
      transparency/page.tsx
      contact/page.tsx
    api/
      donation/create-order/route.ts
      donation/verify-payment/route.ts
      webhooks/razorpay/route.ts
      leads/help-request/route.ts
      leads/volunteer/route.ts
  components/
    home/
      HeroSection.tsx
      TrustStrip.tsx
      ImpactStats.tsx
      StoriesPreview.tsx
      DonationWidget.tsx
    shared/
      Header.tsx
      Footer.tsx
  lib/
    razorpay.ts
    validations.ts
    analytics.ts
  styles/
    globals.css
```

---

## 14) Final Notes

- Keep copy short, specific, and outcome-led.
- Prioritize **Donate** and **Need Help** everywhere (especially mobile).
- Do not publish any child story without explicit documented family consent.
- Treat transparency section as a conversion asset, not just compliance text.
