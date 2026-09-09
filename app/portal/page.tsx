// app/portal/page.tsx
// The footer's patientServicesNav has linked here since Phase 1 with the comment
// "ships in Phase 6" — a real gap in production regardless of how far off the real
// feature is. A patient portal handles PHI, which types/index.ts is explicit is a
// separate, not-yet-built boundary; this holding page exists only so the footer link
// resolves to something honest instead of a 404.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Patient portal',
  description: `The ${siteConfig.name} patient portal is in development.`,
  robots: { index: false, follow: true },
}

export default function PortalPage() {
  return (
    <Section labelledBy="portal-heading">
      <p className="eyebrow">Patient care</p>
      <h1 id="portal-heading" className="mt-2 text-step-5">
        Patient portal
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        A patient portal for viewing reports and appointments online is in development.
        Until it launches, call us for your reports, appointment details or billing
        questions.
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
