'use client'

// components/sections/NavDrawer.tsx
//
// The mobile counterpart to the desktop nav ribbon in SiteHeader. Below `lg` the
// ribbon — eight items, several with 7-15 children — has nowhere to go: it wraps
// onto three or four lines and pushes the hero below the fold before a patient has
// scrolled at all. This trades that for a single "Menu" trigger and a right-hand
// drawer that holds the same data.
//
// SAME DATA, DIFFERENT SHAPE. NavDrawer takes the identical `nav` prop SiteHeader
// already builds for the desktop ribbon — nothing is duplicated or hand-maintained
// twice. A `children` entry becomes an accordion section instead of a hover
// dropdown, because touch has no hover to open one with. A `panel` entry
// ("Find a doctor") becomes a plain link to its `href` rather than trying to
// replicate DoctorSearchPanel's full search bar inside a 22rem-wide drawer — the
// destination page carries the identical search form inline, so nothing is lost.
//
// ONE SECTION OPEN AT A TIME. Fifteen departments is already a scroll; two
// expanded accordions stacked would push "Contact Us" several screens down. This
// mirrors the drawer to a single list a thumb can scan top to bottom.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { isActiveHref } from '@/lib/is-active'
import type { NavItem } from '@/types'

export interface NavDrawerProps {
  nav: NavItem[]
}

export function NavDrawer({ nav }: NavDrawerProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const titleId = useId()

  const openDrawer = useCallback(() => {
    dialogRef.current?.showModal()
  }, [])

  const closeDrawer = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // showModal() already returns focus to whichever element had it when the dialog
  // opened — the trigger, in every case here — so there is nothing to do on close
  // beyond collapsing whichever accordion section was left open, for next time.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => setOpenSection(null)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  // Close on navigation. Following a link unmounts nothing here — the drawer and
  // the page beneath it are both still mounted — so without this the panel stays
  // open over the page it just navigated to.
  useEffect(() => {
    dialogRef.current?.close()
  }, [pathname])

  // Clicking ::backdrop dispatches a click whose target is the <dialog> element
  // itself, never a descendant — see the note in globals.css. Comparing target to
  // currentTarget is what tells a backdrop click apart from a click on the panel's
  // own content without needing a separate overlay element to listen on.
  const onDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) closeDrawer()
    },
    [closeDrawer],
  )

  return (
    <>
      {/*
        Icon-only, matching SiteSearch's trigger beside it: this now lives in the
        same cramped action row as search, Emergency and Book appointment, where a
        visible "Menu" label would cost width the row does not have. aria-label
        carries the accessible name instead — the same trade SiteSearch's own
        "Search this site" button already makes one slot over.
      */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDrawer}
        aria-label="Open menu"
        className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center
                   justify-center lg:hidden"
      >
        <MenuIcon />
      </button>

      {/*
        Same two disabled rules, same reason as EmergencyCallButton's dialog: showModal()
        already binds Escape to close and traps focus natively, and the visible Close
        button is in the tab order. This handler only adds click-the-backdrop for mouse
        and touch users on top of both — a keydown listener to satisfy the linter would
        duplicate Escape rather than add anything a keyboard user does not already have.
      */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-labelledby={titleId}
        className="nav-drawer"
      >
        <div className="flex min-h-[56px] shrink-0 items-center justify-between border-b border-ink-200 px-4">
          <p id={titleId} className="font-serif text-step-1 text-teal-800">
            Menu
          </p>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close menu"
            className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto py-2">
          <ul>
            {nav.map((item) => {
              if (item.panel) {
                // "Find a doctor": the label already goes straight to /doctors on
                // desktop too — the chevron there only ever opened the search bar,
                // which this drawer does not attempt to reproduce.
                return (
                  <li key={item.href} className="border-b border-ink-100 last:border-b-0">
                    <Link href={item.href} className="drawer-row">
                      {item.label}
                    </Link>
                  </li>
                )
              }

              if (item.children?.length) {
                const expanded = openSection === item.label
                const panelId = `${titleId}-${item.label.replace(/\s+/g, '-')}`
                const active = item.children.some((child) => isActiveHref(pathname, child.href))

                return (
                  <li key={item.href} className="border-b border-ink-100 last:border-b-0">
                    {/* A split control, the same shape NavDropdown uses on desktop: the
                        label is a real link to the section's own index page, and the
                        chevron is a separate button that only ever expands or
                        collapses the list beneath it. One element cannot do both — a
                        button here would make the index page unreachable without
                        opening the accordion first. */}
                    <div className="flex items-stretch">
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className="drawer-row flex-1 border-b-0"
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        aria-label={`${expanded ? 'Hide' : 'Show'} ${item.label} list`}
                        onClick={() => setOpenSection(expanded ? null : item.label)}
                        className="flex min-h-[48px] w-12 shrink-0 items-center justify-center text-teal-800"
                      >
                        <Chevron open={expanded} />
                      </button>
                    </div>

                    {expanded ? (
                      <ul id={panelId} className="bg-teal-50 pb-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={isActiveHref(pathname, child.href) ? 'page' : undefined}
                              className="flex min-h-[48px] items-center py-2 pl-8 pr-5
                                         text-step--1 text-teal-800"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                        {item.overviewLabel ? (
                          <li>
                            <Link
                              href={item.href}
                              className="flex min-h-[48px] items-center py-2 pl-8 pr-5
                                         text-step--1 font-semibold text-copper-800"
                            >
                              {item.overviewLabel}
                            </Link>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </li>
                )
              }

              return (
                <li key={item.href} className="border-b border-ink-100 last:border-b-0">
                  <Link
                    href={item.href}
                    aria-current={isActiveHref(pathname, item.href) ? 'page' : undefined}
                    className="drawer-row"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </dialog>
    </>
  )
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
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
