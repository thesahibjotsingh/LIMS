// components/sections/SiteFooter.tsx
//
// Carries the DPDP surface: privacy notice, consent preferences (the withdrawal
// mechanism, which the Act requires to be as easy as giving consent), and the named
// grievance officer. These links exist from Phase 1 even though the pages behind them
// fill out later — retrofitting a rights surface into a finished IA is painful, and its
// absence at launch is a visible gap.
//
// Server component.

import Link from 'next/link'
import { Container } from '@/components/primitives/Container'
import { RequestCallbackButton } from '@/components/sections/RequestCallbackButton'
import type { Location, NavItem } from '@/types'

export interface SiteFooterProps {
  centres: NavItem[]
  patientServices: NavItem[]
  primaryLocation: Location
}

export function SiteFooter({ centres, patientServices, primaryLocation }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    // max-md:pb-24 reserves room for the floating MobileTabBar pill, which is fixed
    // over page content rather than pushing it up — without this the footer's own
    // last row of links sits underneath the glass pill on a phone.
    <footer className="on-dark bg-teal-900 text-white max-md:pb-24">
      {/* Thematic divider: the one copper line that marks the page ending and the
          institutional footer beginning. copper-500 on teal-900 is 3.89:1 — fine for
          a non-text element (WCAG 1.4.11 wants 3:1), and it would not be fine as text. */}
      <span className="divider-accent" aria-hidden="true" />
      <Container>
        <div className="grid gap-10 py-section md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-step-1 font-semibold text-white">
              Lifeline Institute of Medical Sciences
            </p>
            <span className="rule-accent-lg mt-3" aria-hidden="true" />
            <address className="mt-4 not-italic text-step--1 leading-relaxed text-teal-100">
              {primaryLocation.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block">
                {primaryLocation.city}, {primaryLocation.state}
                {primaryLocation.pincode ? ` ${primaryLocation.pincode}` : ''}
              </span>
              {/* href is E.164; the visible text is the formatted form. Keeping the two
                  apart is what stops a space-separated number reaching a tel: URI. */}
              <a
                href={`tel:${primaryLocation.phone}`}
                className="mt-3 inline-flex min-h-[48px] items-center font-semibold
                           text-white underline-offset-4 hover:underline"
              >
                {primaryLocation.phoneDisplay ?? primaryLocation.phone}
              </a>
            </address>

            {/* The lower-commitment third path, right beside the number it is an
                alternative to: call now, or leave your number and someone calls you.
                Outside the <address> element deliberately — it is an action, not a
                fact about how to reach the hospital. */}
            <RequestCallbackButton
              className="mt-1 inline-flex min-h-[48px] items-center text-step--1
                         font-semibold text-copper-300 underline-offset-4
                         hover:text-white hover:underline"
            >
              Request a call back
            </RequestCallbackButton>
          </div>

          <FooterNav
            title="Clinical departments"
            items={centres}
            label="Clinical departments"
            moreHref="/centres"
            moreLabel="All services"
          />
          <FooterNav title="Patient services" items={patientServices} label="Patient services" />

          <nav aria-label="Legal and privacy">
            <h2 className="text-step-0 font-semibold text-white">Privacy &amp; policies</h2>
            <ul className="mt-4 space-y-1">
              {[
                { label: 'Privacy notice', href: '/privacy' },
                // The consent-withdrawal mechanism. Required on every page under DPDP.
                { label: 'Cookie & consent preferences', href: '/privacy/preferences' },
                { label: 'Your data rights', href: '/privacy/your-rights' },
                { label: 'Grievance officer', href: '/privacy/grievance' },
                { label: 'Terms of use', href: '/terms' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[48px] items-center text-step--1 text-teal-100
                               underline-offset-4 hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-copper-500/40 py-6 text-step--1 text-teal-200">
          <p>&copy; {year} Lifeline Institute of Medical Sciences, Hisar. All rights reserved.</p>
          <p className="mt-1">
            Information on this website is for general awareness and is not a substitute for
            professional medical advice, diagnosis or treatment.
          </p>
        </div>
      </Container>
    </footer>
  )
}

interface FooterNavProps {
  title: string
  items: NavItem[]
  label: string
  /** Optional "see everything" link, for lists that are deliberately truncated. */
  moreHref?: string
  moreLabel?: string
}

function FooterNav({ title, items, label, moreHref, moreLabel }: FooterNavProps) {
  return (
    <nav aria-label={label}>
      <h2 className="text-step-0 font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-[48px] items-center text-step--1 text-teal-100
                         underline-offset-4 hover:text-white hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
        {moreHref && moreLabel ? (
          <li>
            <Link
              href={moreHref}
              className="flex min-h-[48px] items-center text-step--1 font-semibold
                         text-copper-300 underline underline-offset-4 hover:text-white"
            >
              {moreLabel}
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
