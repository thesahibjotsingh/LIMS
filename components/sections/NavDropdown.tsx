'use client'

// components/sections/NavDropdown.tsx
//
// The ONLY client component in the header. SiteHeader and the root layout stay server
// components; this is a leaf, so the JS cost is the dropdown behaviour and nothing else.
//
// OPENS ON HOVER — and from the chevron button by click or Enter/Space.
//
// NOT on focus, which it used to do. That was harmless while the trigger was one button;
// with a split control it means tabbing onto the label unfurls 15 panel links into the
// tab path before the next nav item — three times over, so ~45 extra stops to cross a
// ribbon of eight. A keyboard user opens the menu when they mean to, using the chevron.
//
// The label beside the chevron is a LINK to the section's index page, not part of the
// button. See the note on the split control below for why one element cannot be both.
//
// The trigger carries .nav-underline — a copper bar that grows left to right along its
// bottom edge — and the rows inside the panel carry .menu-row: a teal-100 lift and a 6px
// teal strip, the same language as the content cards, one step smaller. Neither uses a
// fill. A menu is a list of 20-odd rows the cursor rakes across on the way to one of
// them, and flooding each in turn is noise. Nothing repaints either: every row label
// clears AA on the tint at its resting colour. See app/globals.css.
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
import { isActiveHref } from '@/lib/is-active'
import type { NavItem } from '@/types'

/** Grace period for the pointer to cross the gap between trigger and panel. */
const CLOSE_DELAY_MS = 120

export interface NavDropdownProps {
  label: string
  /** The section's own index page. Clicking the label goes here. */
  href: string
  /**
   * Arbitrary panel content, rendered instead of `items`. Passed as a node from the
   * server component that owns the header, so a panel like the doctor search stays a
   * server component and ships no JS of its own — only this disclosure does.
   */
  panel?: React.ReactNode
  /**
   * Render the panel as a bar spanning the whole header rather than a floating box
   * anchored to this item. See the note on the positioning context below — it is the
   * reason the underline moved off the outer wrapper.
   */
  fullWidth?: boolean
  items?: NavItem[]
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
  href,
  panel,
  fullWidth = false,
  items = [],
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

  /*
   * Active when one of the CHILDREN matches, never when the trigger's own href does.
   *
   * Specialities and Services both point at /centres, so matching on the trigger would
   * light both of them up on every service page and on /centres itself — an indicator
   * that is always on for two items tells a patient nothing. Matching on children
   * disambiguates: /centres/urology lights Specialities, /centres/ultrasound lights
   * Services, and /centres itself lights neither, which is correct — that page is the
   * whole catalogue, not one branch of it.
   */
  const active = items.some((item) => isActiveHref(pathname, item.href))

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
    /*
      THE POSITIONING CONTEXT IS THE POINT OF THIS WRAPPER.

      A floating panel is absolute against this wrapper, so the wrapper is relative.
      A full-width bar has to be absolute against the <header> instead — the header is
      sticky, which makes it a positioned ancestor, so a panel with inset-x-0 spans the
      whole header the moment no nearer relative ancestor stands in the way.

      That is why .nav-underline moved down onto the trigger span: the recipe applies
      `relative` itself, so leaving it here would silently re-anchor the bar to this one
      nav item and quietly undo the full-width layout. Same visual result either way —
      the underline spans the link and the chevron, which is what it did before.
    */
    <div
      ref={wrapperRef}
      className={fullWidth ? undefined : 'relative'}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onBlur={onBlurCapture}
    >
      {/*
        A SPLIT CONTROL: a link that navigates, and a chevron button that opens the menu.

        One element cannot do both jobs. Make it a button and the section page is
        unreachable by click, which is what it was. Make it a link and the menu is
        unreachable on touch, where there is no hover to fall back on — and LIMS traffic
        is majority mid-range Android, so that is not an edge case.

        Split, every input gets a route to both:
          pointer   hover opens the menu, clicking the label goes to the section
          touch     tap the label to go to the section, tap the chevron for the menu
          keyboard  Tab to the link and Enter, or Tab to the chevron and Enter/Space

        The chevron is a real 44px target, not a decoration inside the link. It carries
        its own accessible name because "▾" announces as nothing.
      */}
      <span
        className="nav-underline flex items-stretch"
        data-open={open ? 'true' : undefined}
        data-active={active ? 'true' : undefined}
      >
        <Link
          href={href}
          aria-current={active ? 'page' : undefined}
          className="flex min-h-[48px] items-center whitespace-nowrap py-0 pl-3 pr-1.5
                     text-step--1 font-semibold text-teal-800"
        >
          {label}
        </Link>

        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Hide' : 'Show'} ${label} menu`}
          onClick={() => (open ? closeNow() : openNow())}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center
                     pl-0.5 pr-3 text-teal-800"
        >
          <Chevron open={open} />
        </button>
      </span>

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
      {open && fullWidth ? (
        /*
          The mega-bar. No rounding, no max-width, no hover bridge: it butts directly
          against the bottom of the header, so there is no gap for the pointer to cross
          on its way in. Its inner padding matches the header's own so the field lines
          up with the logo above it rather than floating at an unrelated inset.
        */
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-50 border-b border-ink-200 bg-white
                     shadow-raised motion-safe:animate-[dropdown_140ms_ease-out]"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <div className="w-full px-6 py-4 lg:px-12">{panel}</div>
        </div>
      ) : null}

      {open && !fullWidth ? (
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
            {panel ?? (
            <ul className={columns === 2 ? 'grid w-[34rem] max-w-full sm:grid-cols-2' : 'w-64'}>
              {items.map((item) => (
                <li key={item.href}>
                  {/* .menu-row is the card language at menu scale: a teal-100 lift and
                      a 6px teal strip, no fill. pl-5 clears the strip. */}
                  <Link
                    href={item.href}
                    className="menu-row flex min-h-[48px] items-center pl-5 pr-3
                               text-step--1 text-teal-800"
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
                    className="menu-row mt-1 flex min-h-[48px] items-center rounded-none
                               border-t border-ink-200 pl-5 pr-3 text-step--1
                               font-semibold text-copper-800"
                  >
                    {overviewLabel}
                  </Link>
                </li>
              ) : null}
            </ul>
            )}
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
