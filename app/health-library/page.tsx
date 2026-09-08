// app/health-library/page.tsx
//
// The destination "Health library" already points at from the header nav. Patient
// education videos are the planned content — see the note on components/sections's own
// missing YouTubeFacade, referenced but never built, in app/doctors/[id]/page.tsx —
// but no video links have been supplied yet, so this is the same honest holding state
// as /health-packages rather than a page pretending to have content it does not.
//
// WHEN REAL VIDEOS ARRIVE, THEY SHOULD NOT BE RAW <iframe> EMBEDS. A raw YouTube embed
// loads 500KB-1.5MB and sets third-party cookies before a patient clicks anything or
// consents to it — the exact DPDP and performance problem the doctor-profile video
// section was designed around (poster + play button, youtube-nocookie injected only on
// click, behind media consent). This page should get the same component once one
// exists, not a shortcut around it.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Health library',
  description: `Patient education resources from ${siteConfig.name}, ${siteConfig.city}.`,
}

export default function HealthLibraryPage() {
  return (
    <Section labelledBy="library-heading">
      <p className="eyebrow">Patient care</p>
      <h1 id="library-heading" className="mt-2 text-step-5">
        Health library
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <p className="mt-6 max-w-prose rounded border border-teal-200 bg-teal-50 p-5 text-step-0 text-ink-950">
        We&rsquo;re building a library of patient education videos from our
        consultants. Check back soon, or call us if you have a question you&rsquo;d
        like answered now.
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
