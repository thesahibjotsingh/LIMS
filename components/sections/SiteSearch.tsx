'use client'

// components/sections/SiteSearch.tsx
//
// Site-wide search: a borderless magnifier in the header that expands right-to-left into
// a search bar, filters as you type, and routes to the hit.
//
// IT OVERLAYS, IT DOES NOT PUSH. The bar is absolutely positioned against the action
// group and anchored right, so expanding it moves nothing else. Laying it out in flow
// would shove the Emergency button leftward on every open — animating the position of
// the one control someone might be reaching for in a panic is not a trade worth making
// for an effect.
//
// WIDTH, NOT TRANSFORM. Everywhere else in this codebase an animation is a transform,
// because the compositor can run it off the main thread. Not here: scaleX would squash
// the placeholder and the icon along with the box, and a search bar that unsquashes as
// it opens looks broken. This is one element animating once per interaction, so the
// layout cost is affordable — the rule it breaks is a rule about repeated animation on
// many elements, and this is neither.
//
// NO LONGER A <dialog>. An inline expander is not modal: the page behind stays live and
// usable, so trapping focus and making the background inert would be wrong. What it does
// still need is written out by hand below — Escape, outside pointerdown, focus leaving,
// route change, and focus returning to the trigger.
//
// THE FIELD IS A REAL COMBOBOX. Filtering as you type creates content a keyboard user
// has no way to reach: Tab would walk them out of the field and through every hit, and a
// screen reader would never be told the list changed. So it carries the full pattern —
// aria-expanded, aria-controls, aria-activedescendant, a listbox of options, arrow keys,
// Enter to go, and a live region announcing the count. Half of this pattern is worse
// than none of it.
//
// The results are <a> elements inside role="option". Strictly an option should not
// contain an interactive element; the alternative is routing on click alone, which takes
// middle-click and open-in-new-tab away from a list of destinations. The link is the
// more useful trade and it is what the established implementations do.

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { searchSite, type SearchEntry } from '@/lib/search-index'

const FIELD_ID = 'site-search-input'
const LISTBOX_ID = 'site-search-listbox'
const optionId = (index: number) => `site-search-option-${index}`

export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  /** Set when closing, so focus only returns to the trigger on a deliberate close. */
  const restoreFocus = useRef(false)

  const router = useRouter()
  const pathname = usePathname()

  const results = useMemo(() => searchSite(query), [query])

  const openSearch = useCallback(() => setOpen(true), [])

  const closeSearch = useCallback((returnFocus = false) => {
    restoreFocus.current = returnFocus
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  // Focus the field as it opens, and hand focus back to the trigger on a deliberate
  // close. Both run after the DOM update, which is why the trigger can be display:none
  // while open — it is back in the tree by the time this fires.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    } else if (restoreFocus.current) {
      restoreFocus.current = false
      triggerRef.current?.focus()
    }
  }, [open])

  // A new query invalidates the previous highlight — without this, typing while the
  // third row is active leaves the highlight on whatever now sits third.
  useEffect(() => {
    setActive(0)
  }, [query])

  // Close on navigation. Following a result unmounts nothing, so without this the bar
  // stays open over the page it just took you to.
  useEffect(() => {
    setOpen(false)
    setQuery('')
  }, [pathname])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeSearch(true)
      }
    }

    // pointerdown, not click: closing on click lets the press land on the page behind
    // before the bar has gone, which reads as a lost tap.
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) closeSearch()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, closeSearch])

  function onBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeSearch()
  }

  function onFieldKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(results.length - 1)
    } else if (event.key === 'Enter') {
      const entry: SearchEntry | undefined = results[active]
      if (entry) {
        event.preventDefault()
        closeSearch()
        router.push(entry.href)
      }
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center" onBlur={onBlurCapture}>
      {/*
        Borderless. The hover fill from .sweep is the whole affordance — a ring around a
        44px icon reads as a button that has been switched off next to two filled ones.
        Still a 44px target: the padding does the work the border used to.
      */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        aria-expanded={open}
        // Only while the field exists. A dangling IDREF is an invalid reference, and
        // some screen readers announce a control that points at nothing as broken.
        aria-controls={open ? FIELD_ID : undefined}
        aria-label="Search this site"
        className={`sweep inline-flex h-11 w-11 shrink-0 items-center justify-center
                    rounded-full ${open ? 'hidden' : ''}`}
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {/*
        The expanding bar. right-0 with an animated width is what makes it grow leftward
        out of the icon: the right edge is pinned where the icon was, so every pixel it
        gains appears on the left.

        Rendered only while open. Keeping a zero-width input mounted would leave a
        focusable, screen-reader-visible field in the header of every page.
      */}
      {open ? (
        <div
          className="absolute right-0 top-1/2 z-50 w-[min(30rem,calc(100vw-3rem))]
                     -translate-y-1/2 motion-safe:animate-[search-expand_220ms_cubic-bezier(0.2,0,0,1)]"
        >
          <div className="flex items-center gap-1 rounded-full border-2 border-teal-800 bg-white pl-3 pr-1">
            <span aria-hidden="true" className="shrink-0 text-teal-600">
              <SearchIcon className="h-4 w-4" />
            </span>

            <label htmlFor={FIELD_ID} className="sr-only">
              Search doctors, specialities and services
            </label>
            <input
              ref={inputRef}
              id={FIELD_ID}
              type="text"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={LISTBOX_ID}
              aria-autocomplete="list"
              aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onFieldKeyDown}
              placeholder="Search doctors, specialities, services"
              className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 text-step--1
                         text-ink-950 placeholder:text-ink-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => closeSearch(true)}
              aria-label="Close search"
              className="sweep inline-flex h-9 w-9 shrink-0 items-center justify-center
                         rounded-full"
            >
              <CloseIcon />
            </button>
          </div>

          {/* The count is what tells a screen-reader user their typing did something. */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {query
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for ${query}`
              : ''}
          </p>

          {query && results.length === 0 ? (
            <p
              className="mt-2 rounded-lg border border-ink-200 bg-white p-4 text-step--1
                         text-ink-600 shadow-raised"
            >
              Nothing matches &ldquo;{query}&rdquo;. Try a department, a doctor&rsquo;s
              name, or a test such as &ldquo;ultrasound&rdquo;.
            </p>
          ) : null}

          <ul
            id={LISTBOX_ID}
            role="listbox"
            aria-label="Search results"
            className={
              results.length > 0
                ? `mt-2 max-h-[60vh] overflow-y-auto rounded-lg border border-ink-200
                   bg-white p-2 shadow-raised
                   motion-safe:animate-[dropdown_140ms_ease-out]`
                : 'sr-only'
            }
          >
            {results.map((entry, index) => (
              <li
                key={entry.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                // Hovering moves the highlight, so the mouse and the keyboard never
                // disagree about which row Enter would open.
                onMouseEnter={() => setActive(index)}
                className={index === active ? 'rounded bg-teal-100' : 'rounded'}
              >
                <Link
                  href={entry.href}
                  onClick={() => closeSearch()}
                  className="flex items-baseline justify-between gap-3 px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-step--1 font-semibold text-teal-800">
                      {entry.title}
                    </span>
                    {entry.subtitle ? (
                      <span className="block truncate text-[0.75rem] text-ink-600">
                        {entry.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="shrink-0 text-[0.6875rem] font-semibold uppercase
                               tracking-[0.08em] text-copper-800"
                  >
                    {entry.kind}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={`shrink-0 ${className ?? ''}`}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m13.5 13.5 4 4" />
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
      className="h-4 w-4 shrink-0"
    >
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  )
}
