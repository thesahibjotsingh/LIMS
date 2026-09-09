'use client'

// components/sections/MobileTabBar.tsx
//
// The floating "liquid glass" bottom pill — persistent quick access to the four
// destinations a patient reaches for most, always one thumb-reach away no matter how
// far down a page they have scrolled.
//
// MOBILE ONLY. `md:hidden` on the outer wrapper — at md and up the desktop header's
// own two tiers already carry every one of these destinations, and a floating bar
// over page content that already has room to breathe would just be clutter.
//
// A FLOATING PILL, NOT AN EDGE-TO-EDGE BAR. It sits clear of both side edges and the
// bottom edge, which is what makes it read as glass rather than as a docked toolbar —
// a full-bleed bar can only be opaque or it visibly clips whatever scrolls under it,
// while a pill with margin on every side shows page content, blurred, through and
// around it. The frosted surface itself is `.glass-pill` in globals.css.
//
// Icon-only, no labels under them: four 44pt targets plus their gaps already fill a
// comfortable pill width, and a label row under each would either wrap or force type
// under the 44pt icon's own footprint. aria-label carries the accessible name instead,
// the same trade NavDrawer's own trigger makes one row up in the header.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isActiveHref } from '@/lib/is-active'

const TABS = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/doctors', label: 'Find a doctor', Icon: DoctorIcon },
  { href: '/appointments', label: 'Book appointment', Icon: CalendarIcon },
  { href: '/services', label: 'Services', Icon: ServicesIcon },
] as const

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Quick access"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 md:hidden"
      // The pill floats clear of the edge rather than sitting flush against it, so the
      // offset itself has to clear the home indicator — env(safe-area-inset-bottom)
      // plus a fixed margin, not one or the other alone.
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)', marginBottom: '0.75rem' }}
    >
      <div className="glass-pill flex items-center gap-1 rounded-full p-1.5">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActiveHref(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full
                          transition-colors ease-standard ${
                            active
                              ? 'bg-teal-800 text-white'
                              : 'text-teal-800 active:bg-teal-800/10'
                          }`}
            >
              <Icon />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function iconProps(className = 'h-5 w-5') {
  return {
    'aria-hidden': true as const,
    focusable: false as const,
    viewBox: '0 0 20 20',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }
}

function HomeIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V17h10V8.5" />
    </svg>
  )
}

function DoctorIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="6.5" r="3" />
      <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M3 8.5h14M7 3v3M13 3v3" />
    </svg>
  )
}

function ServicesIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="6" height="6" rx="1.2" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" />
    </svg>
  )
}
