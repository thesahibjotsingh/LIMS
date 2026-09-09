// app/privacy/page.tsx
//
// Linked from the footer since Phase 1 (see the note at the top of SiteFooter.tsx) with
// no page behind it — found while building app/sitemap.ts, which is what a dead link in
// production actually looks like from the data layer: a route nothing resolves.
//
// A privacy notice is exactly the page this platform's own rule about invented content
// applies to hardest: the DPDP-mandated substance (what is collected, why, retention,
// third parties) has to come from LIMS's own data-handling practices, not from a
// plausible-sounding template. This is the same honest holding state as
// /health-packages, not a finished policy.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: `How ${siteConfig.name}, ${siteConfig.city} handles your information.`,
}

export default function PrivacyPage() {
  return (
    <Section labelledBy="privacy-heading">
      <p className="eyebrow">Privacy &amp; policies</p>
      <h1 id="privacy-heading" className="mt-2 text-step-5">
        Privacy notice
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        Our full privacy notice, covering what information we collect, how it is used and
        how long it is kept, is being finalised. For a question about your data now,
        contact us directly and we will answer it.
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
