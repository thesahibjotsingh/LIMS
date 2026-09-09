// app/not-found.tsx
//
// Next renders this for every unmatched route and every explicit notFound() call (see
// app/doctors/[id]/page.tsx, app/centres/[slug]/page.tsx). Before this file existed,
// both cases fell through to Next's own bare default page — the one dead end on the
// site that didn't get the "here's what does work" treatment already used on
// /doctors when a search comes back empty.
//
// Server component: a 404 needs no interactivity, so it ships no JavaScript.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/primitives/Section'
import { contact, siteConfig } from '@/lib/site-config'

// A URL that resolves to nothing has nothing worth indexing.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <Section tone="tint" labelledBy="not-found-heading">
      <p className="eyebrow">Error 404</p>
      <h1 id="not-found-heading" className="mt-2 text-step-5">
        We can&rsquo;t find that page
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step-1 text-ink-950">
        The page you followed may have moved, or the link may be out of date. Here&rsquo;s
        where to go instead.
      </p>

      <ul className="mt-8 flex flex-wrap gap-3">
        {[
          { label: 'Home', href: '/' },
          { label: 'Find a doctor', href: '/doctors' },
          { label: 'Centres of Excellence', href: '/centres' },
          { label: 'Contact us', href: '/contact' },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="card-geo flex min-h-[48px] items-center px-5 text-step-0
                         font-semibold text-teal-800"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-prose text-step--1 text-ink-600">
        Looking for a specific department or consultant? Our team can point you the right
        way.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={`tel:${contact.secondary}`}
          className="btn-primary inline-flex min-h-[48px] items-center px-5 font-semibold"
        >
          Call {contact.secondaryDisplay}
        </a>
      </div>

      <p className="sr-only">{siteConfig.name}</p>
    </Section>
  )
}
