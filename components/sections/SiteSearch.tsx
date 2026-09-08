'use client'

// components/sections/SiteSearch.tsx
//
// Site-wide search: a magnifier in the header that opens an overlay, filters as you
// type, and routes to the hit.
//
// THE OVERLAY IS A NATIVE <dialog>, opened with showModal(). That hands the browser four
// things this must not get wrong: the background goes inert, focus is moved inside and
// trapped, Escape closes, and focus returns to the trigger. A div with role="dialog"
// needs all four written by hand and eventually gets one of them wrong.
//
// THE FIELD IS A REAL COMBOBOX, not an input with a list under it. Filtering as you type
// creates content a keyboard user has no way to reach — Tab would walk them out of the
// field and through every hit, and a screen reader would never be told the list changed.
// So it carries the full pattern: aria-expanded, aria-controls, aria-activedescendant,
// a listbox of options, arrow keys to move, Enter to go, and a live region announcing
// the count. Half of this pattern is worse than none of it, which is why the earlier
// search field in the nav was deliberately left as a plain form.
//
// The results are <a> elements inside role="option". Strictly, an option should not
// contain an interactive element; the alternative is routing on click alone, which
// takes away middle-click and "open in new tab" from a list of destinations. The link
// is the more useful trade and it is what the established combobox implementations do.
//
// The index ships to the client because filtering is local: ~35 short entries, a few KB.
// A network round-trip per keystroke would be slower, would fail offline, and would need
// an endpoint that does not exist.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { searchSite, type SearchEntry } from '@/lib/search-index'

const LISTBOX_ID = 'site-search-listbox'
const optionId = (index: number) => `site-search-option-${index}`

export function SiteSearch() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const results = useMemo(() => searchSite(query), [query])

  const open = useCallback(() => {
    dialogRef.current?.showModal()
    // Focus the field rather than relying on autofocus: the dialog is reopened many
    // times in a session and autofocus only fires on the first mount.
    inputRef.current?.focus()
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
    setQuery('')
    setActive(0)
  }, [])

  // A new query invalidates the previous highlight — without this, typing while the
  // third row is active leaves the highlight on whatever now sits third.
  useEffect(() => {
    setActive(0)
  }, [query])

  const go = useCallback(
    (entry: SearchEntry) => {
      close()
      router.push(entry.href)
    },
    [close, router],
  )

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (index + 1) % results.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + results.length) % results.length)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActive(results.length - 1)
      return
    }

    if (event.key === 'Enter') {
      const entry = results[active]
      if (entry) {
        event.preventDefault()
        go(entry)
      }
    }
  }

  // Clicking the backdrop targets the dialog itself; clicking the panel targets a child.
  function onDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search this site"
        className="sweep inline-flex h-11 w-11 shrink-0 items-center justify-center
                   rounded-full border-2 border-teal-800"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        onClose={close}
        aria-label="Search this site"
        className="mt-[10vh] w-[min(40rem,calc(100vw-2rem))] rounded-lg border
                   border-ink-200 bg-white p-0 text-ink-950 shadow-raised
                   backdrop:bg-ink-950/60"
      >
        <div className="p-4">
          <div className="flex items-stretch gap-2">
            <div className="relative min-w-0 flex-1">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
                           text-teal-600"
              >
                <SearchIcon className="h-4 w-4" />
              </span>
              <label htmlFor="site-search-input" className="sr-only">
                Search doctors, specialities and services
              </label>
              <input
                ref={inputRef}
                id="site-search-input"
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={LISTBOX_ID}
                aria-autocomplete="list"
                aria-activedescendant={
                  results.length > 0 ? optionId(active) : undefined
                }
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search doctors, specialities, services"
                className="h-11 w-full rounded-full border-2 border-ink-200 bg-white pl-10
                           pr-4 text-step--1 text-ink-950 placeholder:text-ink-400
                           focus:border-teal-600"
              />
            </div>

            <button
              type="button"
              onClick={close}
              className="sweep inline-flex min-h-[44px] shrink-0 items-center rounded-full
                         border-2 border-teal-800 px-4 text-step--1 font-semibold"
            >
              Close
            </button>
          </div>

          {/*
            The count is what tells a screen-reader user their typing did something.
            Without it the list changes silently and the only feedback is visual.
          */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {query
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for ${query}`
              : ''}
          </p>

          {query && results.length === 0 ? (
            <p className="mt-4 text-step--1 text-ink-600">
              Nothing matches &ldquo;{query}&rdquo;. Try a department, a doctor&rsquo;s
              name, or a test such as &ldquo;ultrasound&rdquo;.
            </p>
          ) : null}

          <ul
            id={LISTBOX_ID}
            role="listbox"
            aria-label="Search results"
            className={results.length > 0 ? 'mt-3 max-h-[50vh] overflow-y-auto' : 'sr-only'}
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
                  onClick={close}
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
                  <span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-copper-800">
                    {entry.kind}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
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
