// app/terms/page.tsx
// Linked from the footer since Phase 1, unbuilt until now. Same reasoning as /privacy:
// terms of use are a legal document that has to come from LIMS or counsel, not a
// generic template presented as binding.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Terms of use',
  description: `Terms of use for the ${siteConfig.name} website.`,
}

export default function TermsPage() {
  return (
    <Section labelledBy="terms-heading">
      <p className="eyebrow">Privacy &amp; policies</p>
      <h1 id="terms-heading" className="mt-2 text-step-5">
        Terms of use
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        Our terms of use are being finalised. In the meantime: information on this
        website is provided for general awareness and is not a substitute for
        professional medical advice, diagnosis or treatment. For questions about using
        this site, contact us directly.
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
