// components/sections/SiteHeader.tsx
//
// Server component. The only JavaScript in the header is components/sections/NavDropdown,
// a client leaf — the header itself and the root layout ship none.
//
// STRUCTURE — one row: lockup left, nav centre, actions right.
//
//   [logo + name + tagline]   Specialities ▾ … Contact Us ▾   [Emergency] [Book]
//
// THE ROW IS A THREE-REGION GRID, NOT A WRAPPING FLEX LINE.
//   [lockup, auto] [nav, 1fr] [actions, auto]
// The middle track absorbs every pixel the other two do not use, so the nav stays
// optically centred at 1280 and at 1920 without a breakpoint per width. A wrapping flex
// row cannot do that: it centres against the container, not against the space actually
// left over, so the nav drifts as the lockup and the buttons change size.
//
// Budget at the tightest laptop width, xl/1280 (1248px usable after the gutter):
//   lockup   ~282px  (88 logo + 184 name/tagline block + gap)
//   nav      ~578px  (5 items at 12px, px-2.5, plus gaps)
//   actions  ~328px  (emergency pill + book appointment)
//   gaps       32px
//   total   ~1220px  — fits, with ~28px of slack
//
// That slack exists because the nav went from eight items to five. It is thin, so two
// things protect it: every nav label is `whitespace-nowrap` (an item may never break
// mid-label), and below xl the grid collapses to two rows deliberately rather than
// letting anything overflow or clip.
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
        {/*
          Two rows below xl (lockup+actions, then nav) and one row from xl up. Grid
          rather than flex-wrap so the middle track is a real 1fr and the nav centres
          against the leftover space, not against the container.
        */}
        <div
          className="grid grid-cols-1 items-center gap-x-4 gap-y-2 py-2
                     xl:grid-cols-[auto_1fr_auto]"
        >
          {/*
            The lockup, from the official LIMS stationery: the mark, the institution
            name, then the tagline beneath it.

            The name and tagline are typeset rather than baked into the artwork. As text
            they stay legible at 44px, reflow on a 360px screen, survive a 400% browser
            zoom, and are selectable and translatable.
          */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 justify-self-start"
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
                className="max-w-[11.5rem] text-[0.6875rem] font-semibold uppercase
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
          <nav aria-label="Primary" className="order-last w-full xl:order-none xl:w-auto">
            <ul className="flex flex-wrap items-center justify-center gap-x-1">
              {nav.map((item, index) =>
                item.children?.length ? (
                  <li key={item.label}>
                    <NavDropdown
                      label={item.label}
                      items={item.children}
                      overviewHref={item.overviewLabel ? item.href : undefined}
                      overviewLabel={item.overviewLabel}
                      columns={item.children.length > 8 ? 2 : 1}
                      // The last two triggers sit near the right edge of the row, where a
                      // left-anchored panel would run off the viewport.
                      alignRight={index >= nav.length - 2}
                    />
                  </li>
                ) : (
                  <li key={item.href}>
                    {/* .nav-sweep carries the copper fill and the teal-950 hover text —
                        see the recipe and its contrast working in app/globals.css. */}
                    <Link
                      href={item.href}
                      className="nav-sweep flex min-h-[44px] items-center
                                 whitespace-nowrap px-2.5 text-[0.75rem] font-semibold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
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
