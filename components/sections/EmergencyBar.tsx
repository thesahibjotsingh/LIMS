// components/sections/EmergencyBar.tsx
//
// The single highest-stakes element on the platform.
//
// Someone reaching this site during an emergency is on a phone, stressed, possibly
// outdoors in bright sun, and will not scroll or open a menu. So this bar is:
//   - first in the DOM, above the header
//   - never collapsed into a hamburger, never below the fold
//   - a real tel: link with a 44px minimum target
//   - labelled in words, not by a phone glyph alone
//
// Every label is a prop rather than a hardcoded string. LIMS publishes two numbers with
// no stated roles, so the wording that goes above the fold is a decision the content
// owner has to be able to change in one place — including removing a claim like "24x7"
// that nobody has verified. See the note on `contact` in lib/site-config.ts.
//
// Server component. No JS ships for it.

import { Container } from '@/components/primitives/Container'

export interface EmergencyBarProps {
  /** E.164 for the tel: href, e.g. "+919254984121". */
  primaryNumber: string
  /** Human-formatted for display, e.g. "+91 92549 84121". */
  primaryNumberDisplay: string
  /** What this line is for, in the patient's words. */
  primaryLabel: string
  secondaryNumber?: string
  secondaryNumberDisplay?: string
  secondaryLabel?: string
}

export function EmergencyBar({
  primaryNumber,
  primaryNumberDisplay,
  primaryLabel,
  secondaryNumber,
  secondaryNumberDisplay,
  secondaryLabel,
}: EmergencyBarProps) {
  return (
    <div className="on-dark bg-emergency text-white">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1">
          <a
            href={`tel:${primaryNumber}`}
            className="flex min-h-[44px] items-center gap-2 text-step--1 font-semibold
                       underline-offset-4 hover:underline"
          >
            {/* Decorative: the adjacent text already names the action. */}
            <PhoneIcon />
            <span>{primaryLabel}</span>
            <span className="font-normal tabular-nums">{primaryNumberDisplay}</span>
          </a>

          {secondaryNumber && secondaryNumberDisplay && secondaryLabel ? (
            <a
              href={`tel:${secondaryNumber}`}
              className="flex min-h-[44px] items-center gap-2 text-step--1
                         underline-offset-4 hover:underline"
            >
              <span className="font-semibold">{secondaryLabel}</span>
              <span className="tabular-nums">{secondaryNumberDisplay}</span>
            </a>
          ) : null}
        </div>
      </Container>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0"
    >
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.6a1.5 1.5 0 0 1 1.46 1.14l.6 2.4a1.5 1.5 0 0 1-.42 1.44l-1.1 1.1a11.6 11.6 0 0 0 4.28 4.28l1.1-1.1a1.5 1.5 0 0 1 1.44-.42l2.4.6A1.5 1.5 0 0 1 18 12.9v1.6a1.5 1.5 0 0 1-1.5 1.5A14.5 14.5 0 0 1 2 3.5Z" />
    </svg>
  )
}
