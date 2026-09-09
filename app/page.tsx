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
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { Stack } from '@/components/primitives/Stack'
import { DEPARTMENT_ICONS } from '@/components/icons/DepartmentIcons'
import {
  BookAppointmentIcon,
  FindDoctorIcon,
  HealthPackagesIcon,
  LocationsIcon,
} from '@/components/icons/QuickActionIcons'
import { SERVICES, serviceHref, servicesByCategory } from '@/lib/services'
import { siteConfig } from '@/lib/site-config'

// Icon is optional per action — every Quick action tile has one today, but a tile
// added later without a matching icon still renders (just without one) rather than
// crashing the page.
const quickActions = [
  { label: 'Book an appointment', href: '/appointments', Icon: BookAppointmentIcon },
  { label: 'Find a doctor', href: '/doctors', Icon: FindDoctorIcon },
  { label: 'Health check packages', href: '/health-packages', Icon: HealthPackagesIcon },
  { label: 'Locations & directions', href: '/contact#locations', Icon: LocationsIcon },
]

// Content changes weekly at most — static with hourly revalidation keeps TTFB low.
export const revalidate = 3600

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
          <p className="text-step-1 text-ink-950">{siteConfig.description}</p>

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
            well as for a mouse. */}
        <Grid min="sm" className="mt-8">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-geo flex min-h-[48px] items-center gap-4 p-5 text-step-1
                         font-semibold text-teal-800"
            >
              <action.Icon className="h-8 w-8 shrink-0" />
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
          {servicesByCategory('clinical').map((centre) => {
            const Icon = DEPARTMENT_ICONS[centre.slug]
            return (
              <Link key={centre.slug} href={serviceHref(centre)} className="card-geo p-6">
                {Icon && <Icon className="h-8 w-8" />}
                <h3 className="mt-3 text-step-1">{centre.name}</h3>
              </Link>
            )
          })}
        </Grid>

        <p className="mt-8">
          <Link href="/centres" className="link-accent">
            All {SERVICES.length} services, including diagnostics and imaging
          </Link>
        </p>
      </Section>

      {/*
        PHASE 1 — remaining sections, deliberately not stubbed with invented content:
          • "Why LIMS" statistics   → needs verified figures from LIMS
          • Featured doctors        → needs the real doctor roster (Phase 3 components)
          • Patient stories         → needs recorded patient consent before publication
          • Health packages teaser  → needs pricing sign-off
          • CTA band (tone="dark")
      */}
    </>
  )
}
