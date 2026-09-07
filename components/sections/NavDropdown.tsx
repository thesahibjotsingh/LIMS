'use client'

// components/sections/NavDropdown.tsx
//
// The ONLY client component in the header. SiteHeader and the root layout stay server
// components; this is a leaf, so the JS cost is the dropdown behaviour and nothing else.
//
// OPENS ON HOVER — and also on click, on Enter/Space, and on keyboard focus.
//
// The trigger and every row carry .nav-sweep, the left-to-right copper fill defined in
// app/globals.css. Its text goes to teal-950 rather than staying teal-800: mid-sweep a
// label straddles its resting ground and copper-500, and teal-800 is only 2.63:1 on the
// copper half. teal-950 clears AA on both halves at once — 5.28:1 on copper-500, 15.57:1
// on white inside the panels, 14.5:1 on the teal-50 ribbon. See the working next to the
// recipe.
//
// Hover ALONE cannot be the whole mechanism, and this is not a preference:
//   • a keyboard user has no pointer, so a hover-only menu is unreachable
//   • on touch there is no hover at all. The first tap would both open the menu and
//     follow the parent link, so the menu is unusable on a phone — and LIMS traffic is
//     majority mid-range Android
//   • :hover with a CSS-only panel also fails WCAG 1.4.13, which requires hoverable,
//     dismissable, persistent content
// So hover is the pointer affordance layered on top of a real disclosure button. The
// visual result is what was asked for; the button underneath is what makes it work.
//
// The close is delayed ~120ms. Without it, the few pixels of gap between the trigger and
// the panel count as a mouseleave and the menu snaps shut while the pointer is travelling
// toward it — the single most common bug in hover menus.
//
// Deliberately NOT a menubar. WAI-ARIA `menu`/`menuitem` roles are for application menus
// and change how screen readers traverse content — arrow keys, no Tab. This is a list of
// links, so it stays a disclosure button controlling a plain <ul>, which is what the ARIA
// Authoring Practices recommend for site navigation.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { NavItem } from '@/types'

/** Grace period for the pointer to cross the gap between trigger and panel. */
const CLOSE_DELAY_MS = 120

export interface NavDropdownProps {
  label: string
  items: NavItem[]
  /** Optional link to the section's own index page, rendered as the last row. */
  overviewHref?: string
  overviewLabel?: string
  /** Two columns for long lists such as the 15 clinical departments. */
  columns?: 1 | 2
  /** Anchor the panel to the trigger's right edge — for triggers near the row's end. */
  alignRight?: boolean
}

export function NavDropdown({
  label,
  items,
  overviewHref,
  overviewLabel,
  columns = 1,
  alignRight = false,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const openNow = useCallback(() => {
    cancelClose()
    setOpen(true)
  }, [cancelClose])

  const closeSoon = useCallback(() => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }, [cancelClose])

  const closeNow = useCallback(
    (returnFocus = false) => {
      cancelClose()
      setOpen(false)
      if (returnFocus) triggerRef.current?.focus()
    },
    [cancelClose],
  )

  // Close when the route changes. Without this the panel stays open over the new page
  // after a link inside it is followed.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => () => cancelClose(), [cancelClose])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeNow(true)
      }
    }

    // pointerdown, not click: closing on click lets the press land on the page behind
    // before the panel has gone, which reads as a lost tap.
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) closeNow()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, closeNow])

  // Tabbing past the last link closes the panel, the same way moving the pointer away
  // does. Without this the panel stays open behind wherever focus went next.
  function onBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeNow()
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? closeNow() : openNow())}
        className="nav-sweep flex min-h-[44px] items-center gap-1.5 whitespace-nowrap
                   px-3 text-step--1 font-semibold"
      >
        {label}
        {/* Decorative: aria-expanded on the button already announces the state. */}
        <Chevron open={open} />
      </button>

      {/*
        Rendered only when open. Keeping it mounted and hidden would put 15 links into
        the tab order of every page for no benefit.

        pt-2 on the wrapper is the hover bridge: it covers the gap between the trigger
        and the panel, so the pointer never crosses dead space on its way down and the
        menu does not close under it.

        alignRight flips the anchor for triggers near the end of the row, where a
        left-anchored panel would run off the viewport. max-w on the inner panel is the
        backstop for every other case.
      */}
      {open ? (
        <div
          id={panelId}
          className={`absolute top-full z-50 pt-2 ${alignRight ? 'right-0' : 'left-0'}`}
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <div
            className="max-w-[calc(100vw-2rem)] rounded-lg border border-ink-200 bg-white
                       p-2 shadow-raised motion-safe:animate-[dropdown_140ms_ease-out]"
          >
            <ul className={columns === 2 ? 'grid w-[34rem] max-w-full sm:grid-cols-2' : 'w-64'}>
              {items.map((item) => (
                <li key={item.href}>
                  {/* Same copper sweep as the triggers, so the menu reads as one
                      surface rather than two hover languages. */}
                  <Link
                    href={item.href}
                    className="nav-sweep flex min-h-[44px] items-center px-3 text-step--1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {overviewHref && overviewLabel ? (
                <li className={columns === 2 ? 'sm:col-span-2' : undefined}>
                  {/* The section's own index. Kept visually distinct from the
                      department rows: copper-800 text (6.13:1) and a rule above it, so
                      it reads as "everything" rather than as one more department. */}
                  <Link
                    href={overviewHref}
                    className="nav-sweep mt-1 flex min-h-[44px] items-center border-t
                               border-ink-200 px-3 text-step--1 font-semibold
                               !text-copper-800 hover:!text-teal-950"
                  >
                    {overviewLabel}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ease-standard ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  )
}
