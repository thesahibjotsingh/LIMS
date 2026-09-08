// app/about/page.tsx
//
// The destination "About LIMS" already pointed at from the header nav — linked from
// Phase 1, unbuilt until now, the same shape of gap /appointments and /patient-care/
// insurance were before them.
//
// EVERYTHING HERE IS VERIFIED. The NABH accreditation line is transcribed from the
// physical "Scope of Services" board on the Jindal Chowk campus, the same primary
// source lib/services.ts and lib/empanelment.ts were built from — not a claim invented
// for this page. What is deliberately absent: a founding year, a leadership team, a
// mission statement beyond siteConfig's own description, named awards beyond NABH. A
// hospital's About page is exactly where an invented history or an invented director's
// bio would be the most damaging kind of made-up content on the whole site, and none of
// it has been supplied yet.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/primitives/Section'
import { Grid } from '@/components/primitives/Grid'
import { SERVICES } from '@/lib/services'
import { contact, primaryLocation, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'About LIMS',
  description: siteConfig.description,
}

export default function AboutPage() {
  return (
    <>
      <Section tone="tint" labelledBy="about-heading">
        <p className="eyebrow">About LIMS</p>
        <h1 id="about-heading" className="mt-2 text-step-5">
          {siteConfig.name}
        </h1>
        <span className="rule-accent-lg mt-3" aria-hidden="true" />
        <p className="mt-4 max-w-prose text-step-1 text-ink-950">{siteConfig.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-step--1">
          {siteConfig.tagline.map((word, i) => (
            <span key={word} className="flex items-center gap-x-2">
              {i > 0 ? (
                <span aria-hidden="true" className="text-copper-800">
                  &middot;
                </span>
              ) : null}
              <span className="font-semibold uppercase tracking-[0.1em] text-teal-800">
                {word}
              </span>
            </span>
          ))}
        </div>
      </Section>

      <Section labelledBy="accreditation-heading">
        <p className="eyebrow">Accreditation</p>
        <h2 id="accreditation-heading" className="mt-2 text-step-3">
          NABH accredited
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4 max-w-prose text-ink-950">
          {siteConfig.shortName} is accredited by the National Accreditation Board for
          Hospitals &amp; Healthcare Providers (NABH), as displayed on our campus
          signage.
        </p>
      </Section>

      <Section tone="tint" labelledBy="scope-heading">
        <p className="eyebrow">Scope of services</p>
        <h2 id="scope-heading" className="mt-2 text-step-3">
          {SERVICES.length} clinical, diagnostic and support services
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4 max-w-prose text-ink-950">
          Emergency care, surgery, orthopaedics, obstetrics and gynaecology, with
          diagnostics, imaging and pathology on the same Jindal Chowk campus.
        </p>
        <p className="mt-4">
          <Link href="/centres" className="link-accent">
            See every department
          </Link>
        </p>
      </Section>

      <Section labelledBy="visit-heading">
        <p className="eyebrow">Visit us</p>
        <h2 id="visit-heading" className="mt-2 text-step-3">
          {primaryLocation.name}
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <Grid min="sm" gap="lg" className="mt-6">
          <div>
            <address className="not-italic text-step-0 leading-relaxed text-ink-950">
              {primaryLocation.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block">
                {primaryLocation.city}, {primaryLocation.state}
              </span>
            </address>
            <a
              href={`tel:${contact.primary}`}
              className="mt-3 inline-flex min-h-[48px] items-center font-semibold text-teal-800 underline-offset-4 hover:underline"
            >
              {contact.primaryDisplay}
            </a>
          </div>
          <div>
            <p className="text-step-0 text-ink-950">
              Full address, directions and a second contact number for appointments and
              billing enquiries.
            </p>
            <Link href="/contact#locations" className="link-accent mt-3 inline-block">
              Get directions
            </Link>
          </div>
        </Grid>
      </Section>
    </>
  )
}
