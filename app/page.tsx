// app/page.tsx
//
// PHASE 0 SCOPE: the home page's structural skeleton — correct landmarks, heading
// hierarchy, section rhythm and surface tones, built from the layout primitives.
//
// PHASE 1 fills each section with real components (hero, Centre tiles, featured
// doctors, stats, patient stories). The sections are stubbed rather than filled
// because the content and the Centre list still need to come from LIMS, and inventing
// hospital statistics or outcome claims to fill a layout is not acceptable on a
// medical site.
//
// A patient's job on this page is to reach the right department, the right doctor, or
// the emergency number within one screen. Everything below is ordered for that.

import Link from 'next/link'
import { DoctorCarousel } from '@/components/sections/DoctorCarousel'
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { Stack } from '@/components/primitives/Stack'
import { DOCTORS } from '@/lib/doctors'
import { SERVICES } from '@/lib/services'
import { clinicalNav, contact, siteConfig } from '@/lib/site-config'

// Content changes weekly at most — static with hourly revalidation keeps TTFB low.
export const revalidate = 3600

// The hero's own sentence, separate from siteConfig.description on purpose:
// siteConfig.description is written dense and keyword-loaded for the <meta
// description> tag (see app/layout.tsx), and reusing it verbatim as the hero's visible
// paragraph made the hero read like a search snippet rather than something a person
// would say. Same facts, same address, same services — said the way LIMS actually
// wants a visitor greeted.
const HERO_INTRO =
  "Hisar's multi-speciality hospital at Jindal Chowk. Round-the-clock emergency care, " +
  'on-site surgery, orthopaedics, and obstetrics & gynaecology, plus diagnostics, ' +
  'imaging, and pathology under the same roof.'

export default function HomePage() {
  return (
    <>
      {/* -- Hero ---------------------------------------------------------- */}
      <Section tone="tint" labelledBy="hero-heading">
        <Stack gap="lg" className="max-w-prose">
          {/* Eyebrow is copper-700, not copper-500: at this size the accent tone is
              2.95:1 and fails AA outright. The text-safe copper is the only one that
              may carry words. */}
          <p className="eyebrow">{siteConfig.city}, Haryana</p>
          <h1 id="hero-heading" className="text-step-5">
            {siteConfig.name}
          </h1>
          <span className="rule-accent-lg" aria-hidden="true" />
          <p className="text-step-1 text-ink-950">{HERO_INTRO}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/appointments"
              className="btn-primary inline-flex min-h-[48px] items-center px-5
                         font-semibold"
            >
              Book an appointment
            </Link>
            {/*
              Both hero CTAs are solid fills with no stroke: copper for the primary
              action, rich teal for the secondary. The label is white on both.

              The rich fill also closes something the pale version left open. As a
              teal-200 tint this button's EDGE against the teal-50 hero band was
              1.30:1, under the 3:1 WCAG 1.4.11 asks of a control's boundary — no
              light tint clears that on this band. teal-800 puts it at 7.29:1.
            */}
            <Link
              href="/doctors"
              className="btn-secondary inline-flex min-h-[48px] items-center px-5
                         font-semibold"
            >
              Find a doctor
            </Link>
          </div>
        </Stack>
      </Section>

      {/* -- Quick actions ------------------------------------------------- */}
      <Section labelledBy="quick-actions-heading">
        <p className="eyebrow">Quick actions</p>
        <h2 id="quick-actions-heading" className="mt-2 text-step-4">
          How can we help today?
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        {/* .card-geo turns its left edge teal and its shadow deeper on hover AND on
            focus-within, so the affordance exists for someone tabbing through as
            well as for a mouse. Each tile now carries a small custom pictogram —
            hand-drawn to match the stroke weight of SiteSearch's own icons, not a
            generic icon-kit import — so the four actions are recognisable at a glance
            rather than read one word at a time. */}
        <Grid min="sm" className="mt-8">
          {[
            { label: 'Book an appointment', href: '/appointments', icon: CalendarIcon },
            { label: 'Find a doctor', href: '/doctors', icon: DoctorIcon },
            { label: 'Health check packages', href: '/health-packages', icon: PulseIcon },
            { label: 'Locations & directions', href: '/contact#locations', icon: PinIcon },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-geo flex min-h-[48px] items-center gap-4 p-5 text-step-1
                         font-semibold text-teal-800"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                           bg-teal-100 text-teal-800"
              >
                <action.icon className="h-5 w-5" />
              </span>
              {action.label}
            </Link>
          ))}
        </Grid>
      </Section>

      {/* -- Centres of Excellence ----------------------------------------- */}
      <Section tone="tint" labelledBy="centres-heading">
        <p className="eyebrow">Specialist care</p>
        <h2 id="centres-heading" className="mt-2 text-step-4">
          Centres of Excellence
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4 max-w-prose text-ink-950">
          Specialist teams across our clinical departments, with diagnostics, imaging and
          patient support services on the same campus.
        </p>
        <Grid className="mt-8">
          {clinicalNav.map((centre) => (
            <Link key={centre.href} href={centre.href} className="card-geo p-6">
              <h3 className="text-step-1">{centre.label}</h3>
            </Link>
          ))}
        </Grid>

        <p className="mt-8">
          <Link href="/centres" className="link-accent">
            All {SERVICES.length} services, including diagnostics and imaging
          </Link>
        </p>
      </Section>

      {/* -- Meet our consultants -------------------------------------------- */}
      {/* tone="warm" (copper-50) was reserved from the start for "human-centred
          content (patient stories)" and sat unused until now — see Section.tsx. A
          named consultant is exactly that kind of content, so this is its first use
          rather than a new tone invented for the job.

          DoctorCarousel renders the real roster from lib/doctors.ts, arrows-only (no
          autoplay — see the component's own header for why), and marks its bio/quote
          copy as an explicit sample until LIMS supplies the doctor's real words. */}
      <Section tone="warm" labelledBy="doctors-heading">
        <p className="eyebrow">Our consultants</p>
        <h2 id="doctors-heading" className="mt-2 text-step-4">
          Meet our consultants
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <div className="mt-8">
          <DoctorCarousel doctors={DOCTORS} />
        </div>
      </Section>

      {/*
        PHASE 1 — remaining sections, still deliberately not stubbed with invented
        content:
          • "Why LIMS" statistics   → needs verified figures from LIMS
          • Patient stories         → needs recorded patient consent before publication
          • Health packages teaser  → needs pricing sign-off

        The closing CTA band below needed none of that — it restates two actions
        already real on this page — so the homepage no longer trails off after the
        centres grid with no ending.
      */}

      {/* -- Closing CTA ----------------------------------------------------- */}
      <Section tone="dark" labelledBy="cta-heading">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-prose">
            <p className="eyebrow-on-dark">{siteConfig.shortName}, {siteConfig.city}</p>
            <h2 id="cta-heading" className="mt-2 text-step-3">
              Need to see a doctor, or reach us right now?
            </h2>
            <span className="rule-accent-lg mt-3" aria-hidden="true" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/appointments"
              className="btn-primary inline-flex min-h-[48px] items-center px-5 font-semibold"
            >
              Book an appointment
            </Link>
            <a
              href={`tel:${contact.primary}`}
              className="inline-flex min-h-[48px] items-center rounded-full border-2
                         border-white/40 px-5 font-semibold text-white transition-colors
                         ease-standard hover:border-white hover:bg-white/10"
            >
              Call {contact.primaryDisplay}
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ---------------------------------------------------------------------------
   Quick-action pictograms — hand-drawn to the same stroke weight and viewBox
   discipline as SiteSearch's SearchIcon/CloseIcon, not pulled from an icon kit.
   Server-renderable: plain SVG, no client JS.
   --------------------------------------------------------------------------- */

interface IconProps {
  className?: string
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5M16 3v3.5" />
      <path d="M8 13.25h.01M12 13.25h.01M16 13.25h.01M8 16.75h.01M12 16.75h.01" />
    </svg>
  )
}

function DoctorIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M4.75 20c0-3.73 3.25-6 7.25-6s7.25 2.27 7.25 6" />
      <circle cx="18.25" cy="16.5" r="3.25" className="fill-teal-100" />
      <path d="M18.25 15.25v2.5M17 16.5h2.5" />
    </svg>
  )
}

function PulseIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12.5h3.5l2-4.5 3 9 2.25-6.5 1.75 2h5.5" />
    </svg>
  )
}

function PinIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 1 0 5.5 10c0 4.9 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  )
}
