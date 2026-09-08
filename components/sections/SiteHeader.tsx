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
// The ribbon's indicator is a copper underline that grows left to right. Painting the
// tier itself copper-500 would make it invisible — copper arriving on copper. The
// indicator needs a quiet ground to draw on, so the tier is the palette's lightest teal
// under a hairline rule. The two tiers stay legibly separate; the copper stays the thing
// that moves.
//
// Labels are teal-800 on teal-50 at 7.29:1 and never change colour, because nothing
// fills behind them here — only the 3px bar at the bottom edge moves.
//
// Eight items fit here comfortably, which is why the three secondary entries came back
// out of the dropdowns — a tier of its own removes the width constraint that put them
// there.
//
// THE HEADER IS FLUID; THE PAGE BENEATH IT IS NOT.
// Both tiers are edge-to-edge — w-full with px-6 / lg:px-12 — rather than sitting in the
// 80rem page container. The logo therefore locks to the left margin and the buttons to
// the right, at every width, and tier 2 centres between them. The trade is that on a
// screen wider than 80rem the header no longer lines up with the page content below it:
// the header runs to the edges while the content stays centred. That is the intended
// look here, but it is a real misalignment, so PADDING_X is a single constant — both
// tiers share it, and the day the page container changes there is one number to
// reconcile, not four.
//
// The header is sticky. That is not decoration: the red emergency band that used to sit
// above it was always on screen, and moving the emergency number into the header would
// otherwise put it out of reach the moment a patient scrolls. Sticky keeps the same
// guarantee — the number is always one tap away.

import Image from 'next/image'
import Link from 'next/link'
import { DoctorSearchPanel } from '@/components/sections/DoctorSearchPanel'
import { EmergencyCallButton } from '@/components/sections/EmergencyCallButton'
import { SiteSearch } from '@/components/sections/SiteSearch'
import { NavDropdown } from '@/components/sections/NavDropdown'
import { NavLink } from '@/components/sections/NavLink'
import type { NavItem } from '@/types'

export interface SiteHeaderProps {
  nav: NavItem[]
  /** E.164 for the emergency line. The digits are not printed on the button. */
  emergencyPhone: string
  /** Human-formatted, for the desktop dialog. */
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
// than the box. h-11/h-14 compensates; a shorter box would render the wordmark under
// 35px tall.
const LOGO_WIDTH = 220
const LOGO_HEIGHT = 112

// Intrinsic ratio of public/images/beacon.png (150x109). Declared so the browser
// reserves the box on first paint — this sits above the fold on every route, and a
// stale ratio here lands directly in CLS. It read 321x292 until the asset was
// replaced; these are re-measured from the file rather than assumed.
const BEACON_WIDTH = 150
const BEACON_HEIGHT = 109

/**
 * Screen padding for both header tiers. Declared once so the nav can never drift out of
 * alignment with the lockup above it — the two are only aligned because they share this
 * exact string.
 */
const PADDING_X = 'w-full px-6 lg:px-12'

/**
 * The nav tier's own px-3 on each item means the ribbon's visual edge sits 12px inside
 * its padding box. That mattered while the nav was left-aligned under the logo; centred,
 * there is nothing to align to, so it simply shares PADDING_X and the padding only does
 * work at narrow widths, where it keeps a wrapped row off the screen edge.
 */

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
      {/* ---- Tier 1 — lockup and actions, on white -------------------------- */}
      <div className={PADDING_X}>
        {/* justify-between with no container: the lockup is flush to the left screen
            padding and the actions flush to the right, with the gap between them
            absorbing whatever width is left. */}
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
            {/* Site-wide search. First in the action group so it reads as a utility
                rather than competing with the two calls to action beside it. */}
            <SiteSearch />

            {/*
              EMERGENCY.
              Filled copper-700, not the copper-500 accent: white on copper-500 is 2.95:1
              and fails outright, while white on copper-700 is 5.70:1. The word
              "Emergency" is always present — this must never become a colour-coded pill
              (WCAG 1.4.1), and it is the one control on the page that has to work for
              someone who is panicking.

              The digits are not printed on the button. On a phone it dials; on a
              desktop, where a tel: link is at best a handoff prompt, it opens a dialog
              that puts the number on screen in readable type. That behaviour lives in
              EmergencyCallButton, which enhances a real tel: anchor rather than
              replacing it — see the note at the top of that file.
            */}
            <EmergencyCallButton
              phone={emergencyPhone}
              phoneDisplay={emergencyPhoneDisplay}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full
                         bg-beacon py-1 pl-2 pr-4 font-semibold text-white
                         transition-colors ease-standard hover:bg-beacon-dark"
            >
              {/*
                NO CHIP BEHIND THE BEACON, and that is the point of matching the fill.
                The asset is a red disc with a white glyph inside it, so a pill in the
                same red swallows the disc and leaves only the glyph — the graphic reads
                as part of the button rather than as a sticker stuck on it.

                The pill is one percent darker than the disc: #E91C26 against the
                asset's #EB1C26. At 1.015:1 the seam is invisible, and it is what lifts
                the white label from 4.44:1 — just under AA — to 4.51:1.

                priority, not lazy: this is above the fold on every route and it is the
                emergency control. Lazy-loading it means the one button someone may be
                reaching for in a hurry paints as a gap first. sizes tells Next how
                small it actually renders, so it stops fetching a 750px variant.
              */}
              <Image
                src="/images/beacon.png"
                alt=""
                width={BEACON_WIDTH}
                height={BEACON_HEIGHT}
                priority
                sizes="32px"
                className="h-7 w-auto shrink-0"
              />

              {/*
                The visible label is "24×7" to match the compact mock. On its own that
                does not say what the button does — a beacon glyph is the only cue, and
                icon-alone identification on the site's highest-stakes control is not
                something to leave to inference. The word is kept for assistive tech, so
                the accessible name is "Emergency 24×7" rather than "24×7".
              */}
              <span className="sr-only">Emergency</span>
              <span aria-hidden="true">24&times;7</span>
            </EmergencyCallButton>

            {/* .btn-primary rests copper-700 and teal-800 sweeps in from the left;
                .btn-secondary is the same pair inverted. The white label never changes
                colour, which is what lets the fill travel rather than fade — mid-sweep
                the label sits on both fills at once, so one colour has to clear AA on
                each. The working is in app/globals.css. */}
            <Link
              href="/appointments"
              className="btn-primary inline-flex min-h-[44px] items-center px-5
                         font-semibold"
            >
              Book appointment
            </Link>
          </div>
        </div>
      </div>

      {/* ---- Tier 2 — the navigation ribbon --------------------------------- */}
      {/* Distinct aria-label: the footer has its own <nav>, and screen-reader users
          navigate by landmark. "Navigation, navigation" tells them nothing. */}
      <nav aria-label="Primary" className="border-t border-ink-200 bg-teal-50">
        <div className={PADDING_X}>
          {/* Centred, not left-aligned under the logo. With tier 1 running lockup-left
              and actions-right across the full screen, a centred ribbon is the axis that
              holds the two ends together; left-aligning it puts every item on one side
              and leaves the right half of a wide header empty.

              justify-center also does the right thing when the row wraps at narrow
              widths — each line centres on its own rather than leaving a ragged tail. */}
          <ul className="flex flex-wrap items-center justify-center gap-x-1">
            {nav.map((item, index) =>
              item.children?.length || item.panel ? (
                <li key={item.label}>
                  <NavDropdown
                    label={item.label}
                    href={item.href}
                    // A named panel renders custom content; otherwise the children list.
                    panel={item.panel === 'doctor-search' ? <DoctorSearchPanel /> : undefined}
                    // A search row is one line of controls, so it reads as a bar across
                    // the header rather than a box hanging off one nav item.
                    fullWidth={Boolean(item.panel)}
                    items={item.children}
                    overviewHref={item.overviewLabel ? item.href : undefined}
                    overviewLabel={item.overviewLabel}
                    columns={(item.children?.length ?? 0) > 8 ? 2 : 1}
                    // The last two triggers sit near the right edge of the ribbon, where
                    // a left-anchored panel would run off the viewport.
                    alignRight={index >= nav.length - 2}
                  />
                </li>
              ) : (
                <li key={item.href}>
                  {/* NavLink is a client leaf purely so it can read the pathname and
                      mark itself aria-current. .nav-underline draws the copper state bar;
                      the ribbon items carry no fill. */}
                  <NavLink
                    href={item.href}
                    label={item.label}
                    className="flex min-h-[44px] items-center whitespace-nowrap px-3
                               text-step--1 font-semibold"
                  />
                </li>
              ),
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}

