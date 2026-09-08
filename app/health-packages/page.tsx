// app/health-packages/page.tsx
//
// The destination "Health packages" already points at from the header nav and the
// footer's Patient services list. A real package listing needs package names, included
// tests, fasting requirements and prices LIMS has not supplied — see the HealthPackage
// type in types/index.ts, built for exactly this content, still unused because
// inventing a price for a health check-up is the same category of harm as inventing a
// doctor's years of experience. This is the honest holding state until that data
// arrives, matching the pattern ServiceDetail already uses when a department has no
// named consultant yet, not a placeholder pretending to be a finished page.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Health check packages',
  description: `Health check-up packages at ${siteConfig.name}, ${siteConfig.city}.`,
}

export default function HealthPackagesPage() {
  return (
    <Section labelledBy="packages-heading">
      <p className="eyebrow">Patient care</p>
      <h1 id="packages-heading" className="mt-2 text-step-5">
        Health check packages
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        Our health check-up packages are being finalised. To ask about a health
        check-up — what it covers, whether fasting is required, and the cost — call
        our team directly and we&rsquo;ll talk you through what&rsquo;s available.
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
