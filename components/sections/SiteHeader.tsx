// components/sections/SiteHeader.tsx
//
// PHASE 0 SCOPE: a server-rendered, fully keyboard-operable header with a wrapping
// nav. No JavaScript ships for it.
//
// PHASE 1 will replace the nav with a department mega-menu plus a mobile drawer.
// That drawer needs client state, a focus trap and Esc-to-close, so it becomes its own
// leaf client component (`components/sections/MobileNav.tsx`) — the header and the root
// layout stay server components. Deliberately not stubbed here: a half-built drawer
// without a focus trap is worse than a nav that simply works.

import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/primitives/Container'
import type { NavItem } from '@/types'

export interface SiteHeaderProps {
  nav: NavItem[]
  /** E.164 for the appointments line. */
  appointmentPhone: string
  /** Institution name, set as text beside the mark. */
  name: string
  city: string
  /** Official tagline words, e.g. ['Compassion', 'Excellence', 'Care']. */
  tagline: readonly string[]
}

// Intrinsic ratio of public/images/lims-logo.png (1870x841 = 2.224:1), scaled to the
// largest size the header ever renders. Declared rather than measured so the browser
// reserves the box on first paint — the header is above the fold, so a reflow here
// would land straight in CLS.
const LOGO_WIDTH = 249
const LOGO_HEIGHT = 112

export function SiteHeader({ nav, appointmentPhone, name, city, tagline }: SiteHeaderProps) {
  return (
    <header className="border-b border-ink-200 bg-white">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          {/*
            The lockup, matching the official LIMS stationery: the mark, then the full
            institution name on one line, then the tagline directly beneath it.

            The name and tagline are typeset rather than baked into the artwork. As text
            they stay legible at 40px, reflow on a 360px screen, survive a 400% browser
            zoom, and are selectable and translatable. As raster they would be none of
            those, and the supplied PNG is the mark alone in any case.
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
              sizes="(min-width: 640px) 107px, 89px"
              className="h-10 w-auto shrink-0 sm:h-12"
            />

            <span className="flex flex-col gap-0.5">
              {/*
                One line from 640px up. Below that it wraps naturally rather than
                shrinking: the full name is 44 characters, and forcing it onto one line
                at 360px means ~8px type. LIMS traffic skews to 360-412px Android, so
                that trade would make the name unreadable for most of the audience to
                satisfy a layout rule.
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
                4.67:1 on white, which is the only copper that may sit on this surface
                as a glyph. aria-hidden so it is read as "Compassion Excellence Care"
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

          <div className="flex items-center gap-3">
            <a
              href={`tel:${appointmentPhone}`}
              className="hidden min-h-[44px] items-center rounded border-2 border-teal-800
                         px-4 font-semibold text-teal-800 transition-colors ease-standard
                         hover:bg-teal-50 sm:inline-flex"
            >
              Call to book
            </a>
            <Link
              href="/appointments"
              className="inline-flex min-h-[44px] items-center rounded bg-teal-800 px-5
                         font-semibold text-white transition-colors ease-standard
                         hover:bg-teal-700"
            >
              Book appointment
            </Link>
          </div>
        </div>

        {/* Distinct aria-label: the footer has its own <nav>, and screen-reader users
            navigate by landmark. "Navigation, navigation" tells them nothing. */}
        <nav aria-label="Primary" className="pb-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {nav.map((item) => (
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
                             text-step--1 font-semibold text-teal-800 transition-colors
                             ease-standard hover:border-copper-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  )
}
