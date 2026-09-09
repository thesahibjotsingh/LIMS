// app/privacy/grievance/page.tsx
//
// The named grievance officer is required under DPDP and referenced from
// /privacy/your-rights and the footer. LIMS has not named the officer yet — inventing a
// name and designation here would be worse than the gap it fills, since it is precisely
// the contact a patient would rely on to escalate a real complaint.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Grievance officer',
  description: `How to raise a data-handling grievance with ${siteConfig.name}.`,
}

export default function GrievancePage() {
  return (
    <Section labelledBy="grievance-heading">
      <p className="eyebrow">Privacy &amp; policies</p>
      <h1 id="grievance-heading" className="mt-2 text-step-5">
        Grievance officer
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        {siteConfig.shortName} is in the process of naming a grievance officer under the
        Digital Personal Data Protection Act, as required for handling complaints about
        how your personal data is managed. Until that appointment is confirmed, please
        direct any data-handling concern to our team directly and it will be escalated.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
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
