// components/sections/SiteHeader.tsx
//
// Server component. The only JavaScript in the header is components/sections/NavDropdown,
// a client leaf — the header itself and the root layout ship none.
//
// STRUCTURE — one row: lockup left, nav centre, actions right.
//
//   [logo + name + tagline]   Specialities ▾ … Contact Us ▾   [Emergency] [Book]
//
// HOW FAR THE SINGLE ROW ACTUALLY GOES — measured, not guessed.
//   lockup   ~306px  (88 logo + 208 two-line name/tagline + gap)
//   nav      ~836px  (8 items at 12px, px-3, plus gaps)
//   actions  ~328px  (emergency pill + book appointment)
//   total   ~1470px
// The page container caps at 80rem/1280, which cannot hold that, so the header opts
// into `wide` (96rem) — 1504px of usable width once the gutter is off. The single row
// therefore engages at 2xl (1536px) and the nav drops to its own centred row below it.
//
// Shrinking the type to force one row lower down was the alternative and is not worth
// it: 8 items under 12px on a site read by people with failing eyesight is a worse
// trade than a second row. The real lever is fewer top-level items — folding Health
// packages, Health library and About LIMS into existing menus would bring the single
// row down to about 1280px. That is a content decision, so it is not made here.
//
// Below 2xl everything else still holds: no ribbon, lockup left, actions right.
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
  /** E.164 for the emergency line. */
  emergencyPhone: string
  emergencyPhoneDisplay: string
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
// than the box. h-11/h-12 compensates; a shorter box would render the wordmark under
// 32px tall.
const LOGO_WIDTH = 220
const LOGO_HEIGHT = 112

export function SiteHeader({
  nav,
  emergencyPhone,
  emergencyPhoneDisplay,
  name,
  city,
  tagline,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white shadow-card">
      <Container width="wide">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
          {/*
            The lockup, from the official LIMS stationery: the mark, the institution
            name, then the tagline beneath it.

            The name and tagline are typeset rather than baked into the artwork. As text
            they stay legible at 44px, reflow on a 360px screen, survive a 400% browser
            zoom, and are selectable and translatable.
          */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
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
              sizes="(min-width: 640px) 94px, 86px"
              className="h-11 w-auto shrink-0 sm:h-12"
            />

            <span className="flex flex-col gap-0.5">
              {/*
                Wrapped to two lines at a fixed measure rather than run on one. The full
                name is 44 characters — on one line it is ~370px, which is the single
                biggest obstacle to fitting this header in one row. Two lines make the
                lockup ~200px and keep the type at a readable size.
              */}
              <span
                className="max-w-[13rem] text-[0.6875rem] font-semibold uppercase
                           leading-[1.3] tracking-[0.05em] text-teal-800"
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
                           font-medium uppercase leading-[1.4] tracking-[0.12em]
                           text-ink-600"
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

          {/*
            Centre column on wide screens; its own full-width row below that.
            `order-last` + `w-full` is what moves it under the lockup when there is not
            enough room, without a second markup path or a media-query component.

            Distinct aria-label: the footer has its own <nav>, and screen-reader users
            navigate by landmark. "Navigation, navigation" tells them nothing.
          */}
          <nav
            aria-label="Primary"
            className="order-last w-full 2xl:order-none 2xl:w-auto 2xl:flex-1"
          >
            <ul className="flex flex-wrap items-center justify-center gap-x-1">
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
                    {/* .nav-sweep carries the copper fill and the teal-950 hover text —
                        see the recipe and its contrast working in app/globals.css. */}
                    <Link
                      href={item.href}
                      className="nav-sweep flex min-h-[44px] items-center px-3
                                 text-[0.75rem] font-semibold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {/*
              EMERGENCY.
              Filled copper-700, not the copper-500 accent: white on copper-500 is 2.95:1
              and fails outright, while white on copper-700 is 5.70:1. The word
              "Emergency" is always present — this must never become a colour-coded pill
              (WCAG 1.4.1), and it is the one control on the page that has to work for
              someone who is panicking.

              The digits are spelled out from 2xl up, where the row has the room: a
              patient on a desktop cannot tap a tel: link and reads the number instead.
            */}
            <a
              href={`tel:${emergencyPhone}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full
                         bg-copper-700 px-4 text-[0.8125rem] font-semibold text-white
                         transition-colors ease-standard hover:bg-copper-800"
            >
              <PhoneIcon />
              <span>Emergency 24&times;7</span>
              <span className="hidden font-normal tabular-nums 2xl:inline">
                {emergencyPhoneDisplay}
              </span>
            </a>

            <Link
              href="/appointments"
              className="inline-flex min-h-[44px] items-center rounded-full bg-teal-800
                         px-5 text-[0.8125rem] font-semibold text-white transition-colors
                         ease-standard hover:bg-teal-700"
            >
              Book appointment
            </Link>
          </div>
        </div>
      </Container>
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
