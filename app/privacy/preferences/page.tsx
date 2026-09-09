// app/privacy/preferences/page.tsx
//
// The consent-withdrawal mechanism the footer's own comment calls out as required "as
// easy as giving consent" under the DPDP Act — linked from Phase 1, unbuilt until now.
// A real preferences UI needs a defined set of consent categories (analytics, marketing,
// essential) LIMS has not supplied yet, so this holds the same shape as /privacy: honest
// about what is missing rather than a toggle panel wired to nothing.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Cookie & consent preferences',
  description: `Manage your data and consent preferences with ${siteConfig.name}.`,
}

export default function PrivacyPreferencesPage() {
  return (
    <Section labelledBy="preferences-heading">
      <p className="eyebrow">Privacy &amp; policies</p>
      <h1 id="preferences-heading" className="mt-2 text-step-5">
        Cookie &amp; consent preferences
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        This site does not currently set any non-essential cookies, so there is nothing
        to opt out of yet. Once analytics or marketing tools are added, this page will
        let you review and withdraw consent for each of them individually.
      </p>

      <p className="mt-6 max-w-prose text-step--1 text-ink-600">
        To ask about your data before then, contact us directly.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={`tel:${contact.secondary}`}
          className="btn-primary inline-flex min-h-[48px] items-center px-5 font-semibold"
        >
          Call {contact.secondaryDisplay}
        </a>
      </div>
    </Section>
  )
}
