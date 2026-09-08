// app/patient-care/insurance/page.tsx
//
// The destination "Insurance & billing" already pointed at from both the header's
// Contact Us menu and the footer's Patient services list — linked from Phase 1,
// unbuilt until now, the same shape of gap /appointments was before it existed.
//
// Two lists, not one: government/institutional panels (Ayushman Bharat, ECHS, the
// Haryana state boards) and the third-party administrators LIMS is empanelled with —
// see lib/empanelment.ts for the data and the transcription notes. Plain text, not
// card-geo: 47 TPA names are a reference list to scan, not a set of destinations to
// click, so nothing here claims the interactive-card treatment those pages need.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { GOVERNMENT_PANELS, TPA_PARTNERS } from '@/lib/empanelment'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Insurance & billing',
  description:
    `Government schemes and empanelled insurance providers at ${siteConfig.name}, ` +
    `${siteConfig.city}.`,
}

export default function InsurancePage() {
  return (
    <Section labelledBy="insurance-heading">
      <p className="eyebrow">Patient care</p>
      <h1 id="insurance-heading" className="mt-2 text-step-5">
        Insurance &amp; billing
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step-1 text-ink-950">
        {siteConfig.shortName} is empanelled with the government schemes and
        third-party administrators listed below.
      </p>

      {/* Empanelment names a panel agreement, not a blanket promise — the one claim
          this page is careful not to make by omission. */}
      <p className="mt-4 max-w-prose rounded border border-copper-200 bg-copper-50 p-4 text-step--1 text-ink-950">
        Being listed here means LIMS holds a panel agreement with that scheme or
        insurer — it does not by itself guarantee cashless treatment for every
        procedure under every policy. Confirm your specific plan&rsquo;s coverage
        with our billing desk before treatment:{' '}
        <a href={`tel:${contact.secondary}`} className="link-accent">
          {contact.secondaryDisplay}
        </a>
        .
      </p>

      <h2 className="mt-12 text-step-3">Government &amp; institutional panels</h2>
      <span className="rule-accent mt-3" aria-hidden="true" />
      <ul className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        {GOVERNMENT_PANELS.map((panel) => (
          <li
            key={panel}
            className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-step--1 font-semibold text-teal-800"
          >
            {panel}
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-step-3">Empanelled TPAs</h2>
      <span className="rule-accent mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step--1 text-ink-600">
        {TPA_PARTNERS.length} third-party administrators, in the order listed on our
        campus signage.
      </p>
      <ol className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {TPA_PARTNERS.map((name, index) => (
          <li
            key={name}
            className="flex gap-3 border-b border-ink-100 py-2.5 text-step--1 text-ink-950"
          >
            <span className="shrink-0 tabular-nums text-ink-600" aria-hidden="true">
              {index + 1}.
            </span>
            <span>{name}</span>
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-prose text-step--1 text-ink-600">
        Not sure whether your insurer is on this list, or planning a reimbursement
        claim instead? Call the billing desk at{' '}
        <a href={`tel:${contact.secondary}`} className="link-accent">
          {contact.secondaryDisplay}
        </a>{' '}
        and we&rsquo;ll confirm directly.
      </p>
    </Section>
  )
}
