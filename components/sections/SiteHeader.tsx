// components/sections/SiteHeader.tsx
//
// Server component. The only JavaScript in the header is components/sections/NavDropdown,
// a client leaf — the header itself and the root layout ship none.
//
// STRUCTURE
//   row 1  white     logo lockup            emergency · call back · book appointment
//   row 2  copper    Specialities ▾  Find a doctor  Services ▾  …  Contact Us ▾
//
// THE RIBBON'S TEXT COLOUR IS NOT THE BRAND PRIMARY, AND CANNOT BE.
// On a solid copper-500 (#D68060) band, measured against that exact background:
//   white ...... 2.95:1  fails AA
//   teal-800 ... 2.63:1  fails AA — the brand primary is WORSE than white here
//   teal-900 ... 3.87:1  large text only
//   teal-950 ... 5.28:1  passes  <- what the ribbon uses
// Copper is a mid-tone: it is bright enough to kill white text and dark enough to kill
// mid-tone teal. Only the deepest teal survives on it. teal-800 is still the primary
// everywhere else in the header, including inside the dropdown panels.
//
// The header is sticky. That is not decoration: the red emergency band that used to sit
// above it was always on screen, and moving the emergency number into the header would
// otherwise put it out of reach the moment a patient scrolls. Sticky keeps the same
// guarantee — the number is always one tap away — with the cleaner layout.

import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/primitives/Container'
import { NavDropdown } from '@/components/sections/NavDropdown'
import type { NavItem } from '@/types'

export interface SiteHeaderProps {
  nav: NavItem[]
  /** E.164 for the emergency line. */
  emergencyPhone: string
  emergencyPhoneDisplay: string
  /** E.164 for the appointments desk. */
  appointmentPhone: string
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

export function SiteHeader({
  nav,
  emergencyPhone,
  emergencyPhoneDisplay,
  appointmentPhone,
  name,
  city,
  tagline,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white shadow-card">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          {/*
            The lockup, matching the official LIMS stationery: the mark, the full
            institution name on one line, then the tagline directly beneath it.

            The name and tagline are typeset rather than baked into the artwork. As text
            they stay legible at 44px, reflow on a 360px screen, survive a 400% browser
            zoom, and are selectable and translatable.
          */}
          <Link
            href="/"
            className="group flex items-center gap-3"
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
                below AA. The separators are the copper micro-accent: copper-700 is
                5.70:1 on white. aria-hidden so it reads as "Compassion Excellence Care"
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
                      <span aria-hidden="true" className="text-copper-700">
                        &middot;
                      </span>
                    ) : null}
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/*
              EMERGENCY.
              Filled copper-700, not the copper-500 accent: white on copper-500 is 2.95:1
              and fails outright, while white on copper-700 is 5.70:1. The word
              "Emergency" is always present — this must never become a colour-coded pill
              (WCAG 1.4.1), and it is the one control on the page that has to work for
              someone who is panicking.

              The digits are spelled out from md up: a patient on a desktop cannot tap a
              tel: link and reads the number off the screen instead.
            */}
            <a
              href={`tel:${emergencyPhone}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full
                         bg-copper-700 px-4 font-semibold text-white transition-colors
                         ease-standard hover:bg-copper-800"
            >
              <PhoneIcon />
              <span>Emergency 24&times;7</span>
              <span className="hidden font-normal tabular-nums md:inline">
                {emergencyPhoneDisplay}
              </span>
            </a>

            <a
              href={`tel:${appointmentPhone}`}
              className="hidden min-h-[44px] items-center rounded-full border-2
                         border-teal-800 px-4 font-semibold text-teal-800 transition-colors
                         ease-standard hover:bg-teal-50 lg:inline-flex"
            >
              Request a call back
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

      {/* Distinct aria-label: the footer has its own <nav>, and screen-reader users
          navigate by landmark. "Navigation, navigation" tells them nothing. */}
      <nav aria-label="Primary" className="bg-copper-500">
        <Container>
          <ul className="flex flex-wrap items-center gap-x-7">
            {nav.map((item) =>
              item.children?.length ? (
                <li key={item.label}>
                  <NavDropdown
                    label={item.label}
                    items={item.children}
                    overviewHref={item.href}
                    overviewLabel={`All ${item.label.toLowerCase()}`}
                    columns={item.children.length > 8 ? 2 : 1}
                  />
                </li>
              ) : (
                <li key={item.href}>
                  {/*
                    Hover is a copper underline drawn with border-b rather than
                    text-decoration, so it can be 2px and sit clear of the descenders.
                    border-transparent in the rest state reserves the space — otherwise
                    every nav item shifts 2px on hover.

                    copper-600, not the brand copper-500: as a state indicator this has to
                    clear 3:1 (WCAG 1.4.11) and copper-500 manages only 2.95:1 on white.
                  */}
                  <Link
                    href={item.href}
                    className="flex min-h-[44px] items-center border-b-2 border-transparent
                               px-1 text-step--1 font-semibold text-teal-950
                               transition-colors ease-standard hover:border-teal-950"
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
