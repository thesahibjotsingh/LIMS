// app/privacy/your-rights/page.tsx
//
// Linked from the footer since Phase 1, unbuilt until now. The DPDP Act gives patients
// specific, real rights (access, correction, erasure, grievance redress) — this page
// names them honestly rather than inventing LIMS-specific procedures for exercising them
// before those procedures exist.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Your data rights',
  description: `Your rights over the information ${siteConfig.name} holds about you.`,
}

export default function YourRightsPage() {
  return (
    <Section labelledBy="rights-heading">
      <p className="eyebrow">Privacy &amp; policies</p>
      <h1 id="rights-heading" className="mt-2 text-step-5">
        Your data rights
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose text-step-1 text-ink-950">
        Under India&rsquo;s Digital Personal Data Protection Act, you have the right to:
      </p>
      <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 text-ink-950">
        <li>Know what personal data we hold about you and why</li>
        <li>Ask us to correct inaccurate or incomplete data</li>
        <li>Ask us to erase data we no longer need to keep</li>
        <li>Withdraw consent you previously gave, at any time</li>
        <li>Raise a grievance if you believe your data has been mishandled</li>
      </ul>

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        The step-by-step process for exercising each of these is being finalised. Until
        then, contact our{' '}
        <Link href="/privacy/grievance" className="link-accent">
          grievance officer
        </Link>{' '}
        or call us directly and we will handle your request.
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
