// components/sections/SiteHeader.tsx
//
// Server component. The only JavaScript in the header is components/sections/NavDropdown,
// a client leaf — the header itself and the root layout ship none.
//
// TWO TIERS
//   tier 1  white     [logo + name + tagline] ............ [Emergency] [Book appointment]
//   tier 2  teal-50   Specialities ▾  Find a doctor  Services ▾  …  Contact Us ▾
//
// WHY TIER 2 IS teal-50 AND NOT A SOLID COPPER BAND.
// The copper sweep is this header's signature: every nav item fills left-to-right with
// copper-500 on hover. Painting the tier itself copper-500 would make that fill
// invisible — the animation would be copper arriving on copper. A sweep needs a quiet
// ground to travel across, so the tier is the palette's lightest teal under a hairline
// rule. The two tiers stay legibly separate; the copper stays the thing that moves.
//
// Contrast on that ground: the label is teal-800 on teal-50 at 7.29:1 at rest, and
// teal-950 on copper-500 at 5.28:1 once the fill lands. Both clear AA, and the label is
// never caught between two failing values mid-sweep.
//
// Eight items fit here comfortably, which is why the three secondary entries came back
// out of the dropdowns — a tier of its own removes the width constraint that put them
// there. Both tiers use the standard page container, so the logo lines up with the page
// content beneath it instead of floating in a wider band.
//
// The header is sticky. That is not decoration: the red emergency band that used to sit
// above it was always on screen, and moving the emergency number into the header would
// otherwise put it out of reach the moment a patient scrolls. Sticky keeps the same
// guarantee — the number is always one tap away.

import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/primitives/Container'
import { NavDropdown } from '@/components/sections/NavDropdown'
import type { NavItem } from '@/types'

export interface SiteHeaderProps {
  nav: NavItem[]
  /** E.164 for the emergency line. The digits are not printed on the button. */
  emergencyPhone: string
  /** Institution name, set as text beside the mark. */
  name: string
  city: string
  /** Official tagline words, e.g. ['Compassion', 'Excellence', 'Care']. */
  tagline: readonly string[]
}

// Intrinsic ratio of public/images/lims-logo.png (1756x895 = 1.962:1), scaled to the
// largest size the header ever renders. Declared rather than measured so the browser
// reserves the box on first paint — the header is above the fold, so a reflow here
// would land straight in CLS.
//
// The file carries ~28% transparent padding vertically, so the visible mark is smaller
// than the box. h-11/h-14 compensates; a shorter box would render the wordmark under
// 35px tall.
const LOGO_WIDTH = 220
const LOGO_HEIGHT = 112

export function SiteHeader({ nav, emergencyPhone, name, city, tagline }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white shadow-card">
      {/* ---- Tier 1 — lockup and actions, on white -------------------------- */}
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          {/*
            The lockup, from the official LIMS stationery: the mark, the institution
            name, then the tagline beneath it.

            The name and tagline are typeset rather than baked into the artwork. As text
            they stay legible at 44px, reflow on a 360px screen, survive a 400% browser
            zoom, and are selectable and translatable.
          */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label={`${name}, ${city} — home`}
          >
            {/*
              alt="" — the link's aria-label already names the destination, and a
              duplicate alt makes a screen reader announce the institution twice.

              priority: the logo is in the first viewport on every route. Without it
              Next lazy-loads the image and the header visibly pops in.
            */}
            <Image
              src="/images/lims-logo.png"
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              priority
              sizes="(min-width: 640px) 110px, 86px"
              className="h-11 w-auto shrink-0 sm:h-14"
            />

            <span className="flex flex-col gap-0.5">
              {/*
                One line from 640px up. Below that it wraps naturally rather than
                shrinking: the full name is 44 characters, and forcing it onto one line
                at 360px means ~8px type. LIMS traffic skews to 360-412px Android, so
                that trade would make the name unreadable for most of the audience.
              */}
              <span
                className="text-[0.6875rem] font-semibold uppercase leading-[1.35]
                           tracking-[0.06em] text-teal-800 sm:whitespace-nowrap
                           sm:text-[0.8125rem]"
              >
                {name}, {city}
              </span>

              {/*
                Tagline. ink-600 is 7.12:1 — muted by weight and size, not by dropping
                below AA. The separators are the copper micro-accent: copper-800 is
                6.13:1 on white. aria-hidden so it reads as "Compassion Excellence Care"
                rather than as punctuation.
              */}
              <span
                className="flex flex-wrap items-center gap-x-1.5 text-[0.5625rem]
                           font-medium uppercase leading-[1.4] tracking-[0.18em]
                           text-ink-600 sm:text-[0.625rem]"
              >
                {tagline.map((word, i) => (
                  <span key={word} className="flex items-center gap-x-1.5">
                    {i > 0 ? (
                      <span aria-hidden="true" className="text-copper-800">
                        &middot;
                      </span>
                    ) : null}
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/*
              EMERGENCY.
              Filled copper-700, not the copper-500 accent: white on copper-500 is 2.95:1
              and fails outright, while white on copper-700 is 5.70:1. The word
              "Emergency" is always present — this must never become a colour-coded pill
              (WCAG 1.4.1), and it is the one control on the page that has to work for
              someone who is panicking.

              The digits are no longer printed on the button. It is still a real tel:
              link, so a tap dials and a desktop click hands off to the calling app, and
              the number is still set out in full in the footer and on the contact page.
            */}
            <a
              href={`tel:${emergencyPhone}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full
                         bg-copper-700 px-5 font-semibold text-white transition-colors
                         ease-standard hover:bg-copper-800"
            >
              <PhoneIcon />
              <span>Emergency 24&times;7</span>
            </a>

            <Link
              href="/appointments"
              className="inline-flex min-h-[44px] items-center rounded-full bg-teal-800
                         px-5 font-semibold text-white transition-colors ease-standard
                         hover:bg-teal-700"
            >
              Book appointment
            </Link>
          </div>
        </div>
      </Container>

      {/* ---- Tier 2 — the navigation ribbon --------------------------------- */}
      {/* Distinct aria-label: the footer has its own <nav>, and screen-reader users
          navigate by landmark. "Navigation, navigation" tells them nothing. */}
      <nav aria-label="Primary" className="border-t border-ink-200 bg-teal-50">
        <Container>
          <ul className="flex flex-wrap items-center gap-x-1">
            {nav.map((item, index) =>
              item.children?.length ? (
                <li key={item.label}>
                  <NavDropdown
                    label={item.label}
                    items={item.children}
                    overviewHref={item.overviewLabel ? item.href : undefined}
                    overviewLabel={item.overviewLabel}
                    columns={item.children.length > 8 ? 2 : 1}
                    // The last two triggers sit near the right edge of the ribbon, where
                    // a left-anchored panel would run off the viewport.
                    alignRight={index >= nav.length - 2}
                  />
                </li>
              ) : (
                <li key={item.href}>
                  {/* .nav-sweep carries the copper fill and the teal-950 hover text —
                      see the recipe and its contrast working in app/globals.css. */}
                  <Link
                    href={item.href}
                    className="nav-sweep flex min-h-[44px] items-center whitespace-nowrap
                               px-3 text-step--1 font-semibold"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Container>
      </nav>
    </header>
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
