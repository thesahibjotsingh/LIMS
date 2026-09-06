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
import { centresNav, siteConfig } from '@/lib/site-config'

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
              className="inline-flex min-h-[44px] items-center rounded bg-teal-800 px-5
                         font-semibold text-white transition-colors ease-standard
                         hover:bg-teal-700"
            >
              Book an appointment
            </Link>
            <Link
              href="/doctors"
              className="inline-flex min-h-[44px] items-center rounded border-2
                         border-teal-800 px-5 font-semibold text-teal-800 transition-colors
                         ease-standard hover:bg-teal-100"
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
        {/* card-accent draws the copper edge and thickens it on hover AND on
            focus-within, so the affordance exists for keyboard users too.
            pl-7 clears the 4px edge; without it the label would sit on the copper. */}
        <Grid min="sm" className="mt-8">
          {[
            { label: 'Book an appointment', href: '/appointments' },
            { label: 'Find a doctor', href: '/doctors' },
            { label: 'Health check packages', href: '/health-packages' },
            { label: 'Locations & directions', href: '/contact#locations' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-accent flex min-h-[44px] items-center rounded border
                         border-ink-200 bg-white p-5 pl-7 text-step-1 font-semibold
                         text-teal-800 shadow-card transition-shadow ease-standard
                         hover:shadow-raised"
            >
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
          {/* TODO (Phase 1): replace with LIMS-approved introductory copy. */}
          Specialist teams and dedicated facilities across our core clinical departments.
        </p>
        <Grid className="mt-8">
          {centresNav.map((centre) => (
            <Link
              key={centre.href}
              href={centre.href}
              className="card-accent rounded border border-teal-200 bg-white p-6 pl-8
                         shadow-card transition-shadow ease-standard hover:shadow-raised"
            >
              <h3 className="text-step-1">{centre.label}</h3>
              <p className="mt-2 text-step--1 text-ink-600">
                {/* TODO (Phase 2): one-line summary from the Department record. */}
                View specialists, procedures and OPD timings.
              </p>
            </Link>
          ))}
        </Grid>
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
