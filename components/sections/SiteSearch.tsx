'use client'

// components/sections/SiteSearch.tsx
//
// Site-wide search: a borderless magnifier in the header. Two different expanded shapes
// below and above `lg`, sharing one trigger and one piece of state.
//
// WHY TWO SHAPES INSTEAD OF ONE RESPONSIVE ONE. The desktop bar grows right-to-left out
// of the TRIGGER'S OWN position — `relative` lives on this component's own wrapper below,
// not on the header's actions row — so it stops short of Emergency and Book appointment
// instead of covering them; that is the whole visual point of it. Anchoring it to the
// wider actions row instead (a change made and then reverted — see git history) fixes
// nothing at `lg` and up, where there is always room for the bar to grow into on the
// trigger's own left, and costs the one thing that made this shape worth keeping: at
// wide viewports the bar then grows wide enough to sit on top of both buttons beside it.
// Trigger-anchoring only becomes a bug below `lg`, on a phone, where other buttons
// crowd the same row and there may not be enough room to the trigger's own left — which
// is the actual, real incident this file's earlier version fixed. The fix for that
// narrow case is the mobile panel below, not changing what desktop anchors to.
//
// ONE TRIGGER, TWO PANELS, BOTH MAY BE MOUNTED AT ONCE. The trigger button is shared;
// only the expanded content differs per breakpoint, switched with `hidden lg:block` /
// `lg:hidden` rather than a JS media-query read (no hydration mismatch, no resize
// listener). Both panels exist in the DOM while `open` is true, on every viewport — the
// one CSS hides is `display:none`, which makes it non-focusable, so calling `.focus()`
// on its input is a harmless no-op. That is what lets a single `openSearch`/`closeSearch`
// pair and a single set of keyboard/outside-click/blur handlers drive both shapes instead
// of duplicating that logic per breakpoint.
//
// THE DESKTOP BAR IS THE ORIGINAL MECHANISM, UNCHANGED. Always mounted and width-
// animated rather than conditionally rendered, because "grows out of the icon" is a
// width transition by definition — there is no fade-in that reads as growth. That is
// also why it still needs the trap-avoidance the mobile panel does not: collapsed, it
// sits exactly on top of the trigger (right-0, matching the trigger's own box), so
// `inert` and a pointer-events gate keep the two from fighting over clicks and focus.
// Both traps are documented in detail just above where they are handled below.
//
// THE MOBILE PANEL IS `fixed`, NOT `absolute` AGAINST <header> OR THE TRIGGER. It was
// `absolute inset-x-0 top-full` at first — the same mechanism NavDropdown's own
// full-width mega-panel uses, spanning <header> because sticky counts as positioned —
// which worked, but needed the header to carry no nearer positioned descendant between
// it and this component. The desktop bar's own `relative` (on this component's wrapper,
// directly below) is exactly such a descendant, so the two requirements cannot share one
// ancestor chain: the mobile panel needs nothing closer than <header> in the way, and the
// desktop bar needs something local. `fixed` sidesteps the conflict rather than picking a
// side — it resolves against the viewport regardless of any `relative` ancestor in
// between, so the desktop bar keeps its trigger-anchored context and the mobile panel
// stops needing an ancestor at all. Its `top` is measured directly from <header>'s own
// rendered bottom edge when the panel opens — a single read, not a subscription, because
// the header's height cannot change while a modal-less inline panel like this is the
// only thing open above it.
//
// Conditionally rendered, with the shared `dropdown` entrance keyframe every other
// panel on this site uses, because it does not overlap the trigger and so has neither
// trap to guard against.
//
// THE FIELD IS STILL A REAL COMBOBOX, IN BOTH SHAPES. Filtering as you type creates
// content a keyboard user has no way to reach otherwise: Tab would walk them out of the
// field and through every hit, and a screen reader would never be told the list changed.
// So each carries the full pattern — aria-expanded, aria-controls, aria-activedescendant,
// a listbox of options, arrow keys, Enter to go, and a live region announcing the count.
//
// The results are <a> elements inside role="option" in both shapes. Strictly an option
// should not contain an interactive element; the alternative is routing on click alone,
// which takes middle-click and open-in-new-tab away from a list of destinations. The
// link is the more useful trade and it is what the established implementations do.

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder'
import { searchSite, type SearchEntry } from '@/lib/search-index'

export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  /** The mobile panel's `top`, read from <header>'s own rendered bottom edge — see the
   *  file header note for why this is a one-time measurement rather than `absolute`
   *  against the header. 0 until the first open; never rendered before then. */
  const [mobilePanelTop, setMobilePanelTop] = useState(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  /** Set when closing, so focus only returns to the trigger on a deliberate close. */
  const restoreFocus = useRef(false)
  /** Pending deferred blur check, cancelled on unmount and on every new blur. */
  const blurCheck = useRef<number | null>(null)

  const desktopFieldId = useId()
  const desktopListboxId = useId()
  const mobileFieldId = useId()
  const mobileListboxId = useId()
  const mobilePanelId = useId()

  const router = useRouter()
  const pathname = usePathname()

  const results = useMemo(() => searchSite(query), [query])

  /*
   * The cycling placeholder runs only while the field is open AND empty. One flag drives
   * the placeholder text used by BOTH inputs — only one of them is ever visible, so
   * showing the same cycling text in both is correct, not duplicated motion.
   */
  const placeholder = useTypewriterPlaceholder({ enabled: open && query === '' })

  const openSearch = useCallback(() => {
    // The one `<header>` on the page is the site-wide sticky one from SiteHeader —
    // queried directly rather than threaded down as a prop, since nothing else about
    // this component needs to know the header exists. getBoundingClientRect().bottom
    // is already viewport-relative, the same coordinate space `fixed` positions in, so
    // no unit conversion is needed between measuring it and using it.
    const header = document.querySelector('header')
    if (header) setMobilePanelTop(header.getBoundingClientRect().bottom)
    setOpen(true)
  }, [])

  const closeSearch = useCallback((returnFocus = false) => {
    restoreFocus.current = returnFocus
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  /*
   * Focuses whichever input is actually visible. Calling .focus() on the other one is
   * not a bug to guard against — an element hidden via `display:none` (which is what
   * `hidden`/`lg:hidden` resolve to) cannot receive focus, so that call is a documented
   * no-op rather than something that needs its own branch.
   *
   * useLayoutEffect rather than useEffect: this runs before paint, so the field is
   * focused in the same frame the panel appears and the first keystroke cannot be
   * dropped into a field that is not ready yet.
   */
  useLayoutEffect(() => {
    if (open) {
      desktopInputRef.current?.focus()
      mobileInputRef.current?.focus()
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

  // Close on navigation. Following a result unmounts nothing else on the page, so
  // without this the panel stays open over the page it just took you to.
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
    // before the panel has gone, which reads as a lost tap.
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

  /*
   * DEFERRED, AND DOES NOT TRUST relatedTarget DIRECTLY.
   *
   * On the desktop bar, opening puts `inert` on the trigger while it still holds focus;
   * the browser blurs an inert element immediately, and that blur reaches this handler
   * with relatedTarget === null. relatedTarget is null in other legitimate cases too
   * (focus moving to an element that has just rendered, focus leaving for the browser
   * chrome), so a handler that trusts it directly closes on cases it should not. Waiting
   * a frame and asking where focus actually landed answers the real question instead of
   * inferring it from a value with more than one legitimate meaning.
   */
  const scheduleBlurCheck = useCallback(() => {
    if (blurCheck.current !== null) cancelAnimationFrame(blurCheck.current)
    blurCheck.current = requestAnimationFrame(() => {
      blurCheck.current = null
      const focused = document.activeElement
      if (!focused || focused === document.body) return
      if (!wrapperRef.current?.contains(focused)) closeSearch()
    })
  }, [closeSearch])

  useEffect(
    () => () => {
      if (blurCheck.current !== null) cancelAnimationFrame(blurCheck.current)
    },
    [],
  )

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
    <div
      ref={wrapperRef}
      className="relative flex items-center"
      onBlur={open ? scheduleBlurCheck : undefined}
    >
      {/*
        Borderless. The teal fill on hover/focus/aria-expanded is the whole affordance —
        a ring around a 48px icon reads as a button that has been switched off next to
        two filled ones. Still a real 48px target: the padding does the work a border
        used to. Shared by both panels; see the file header for why `inert` here is a
        desktop-only requirement that costs mobile nothing.
      */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        aria-expanded={open}
        aria-controls={open ? (mobileFieldId + ' ' + desktopFieldId) : undefined}
        aria-label="Search this site"
        // Covered by the desktop bar while open, so it must not be reachable or
        // announced there. Costs the mobile panel nothing — it does not overlap the
        // trigger, so this only ever matters at `lg` and up.
        inert={open}
        className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center justify-center"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {/* ---------------------------------------------------------------------
          DESKTOP — grows right-to-left out of the icon. `lg` and up only.
          --------------------------------------------------------------------- */}
      {/*
        pointer-events GO ON THIS WRAPPER, not on the bar inside it. While closed this
        div is 48px wide at right-0 — pixel-for-pixel the trigger's own box — and it
        sits at z-50 above it. Left interactive it swallows every click aimed at the
        button, which is precisely how the search became unopenable the first time this
        was built. `inert` on the bar's own content is not enough either; it stops the
        subtree handling events but does not let clicks fall through to what is beneath.
      */}
      <div
        className={`absolute right-0 top-1/2 z-50 hidden -translate-y-1/2 lg:block ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/*
          ONE BORDER, ON THIS WRAPPER, AND NOWHERE ELSE. The input inside carries no
          border and no outline of its own — that would be a nested double ring. Focus
          is shown by this border going teal-600 (4.05:1 on white, past the 3:1 a focus
          indicator needs).

          overflow-hidden clips the contents while the bar is narrow, so the icon and
          placeholder are revealed by the expansion instead of spilling out of it.
        */}
        <div
          inert={!open}
          className={`flex items-center gap-1 overflow-hidden rounded-full border-2
                      bg-white pl-3 pr-1
                      transition-[width,opacity,border-color] duration-300
                      ease-[cubic-bezier(0.16,1,0.3,1)]
                      focus-within:border-teal-600
                      ${
                        open
                          ? 'w-[min(30rem,calc(100vw-3rem))] border-ink-200 opacity-100'
                          : 'w-12 border-transparent opacity-0'
                      }`}
        >
          <span aria-hidden="true" className="shrink-0 text-teal-600">
            <SearchIcon className="h-4 w-4" />
          </span>

          <label htmlFor={desktopFieldId} className="sr-only">
            Search doctors, specialities and services
          </label>
          <input
            ref={desktopInputRef}
            id={desktopFieldId}
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={desktopListboxId}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? desktopOptionId(active) : undefined}
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onFieldKeyDown}
            placeholder={placeholder}
            /*
              No border, no outline and NO RING: the wrapper carries the single edge.
                focus:outline-none / focus-visible:outline-none
                  the outline from globals.css, which targets :focus-visible
                focus:ring-0
                  the ring @tailwindcss/forms puts on every focused text input,
                  painted through box-shadow, not outline — outline-none cannot
                  touch it because it is not an outline.
            */
            className="h-12 min-w-0 flex-1 border-0 bg-transparent px-2 text-step--1
                       text-ink-950 placeholder:text-ink-400 focus:outline-none
                       focus:ring-0 focus-visible:outline-none"
          />

          <button
            type="button"
            onClick={() => closeSearch(true)}
            aria-label="Close search"
            className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {open ? (
          <SearchResults
            query={query}
            results={results}
            active={active}
            listboxId={desktopListboxId}
            optionId={desktopOptionId}
            onSelectActive={setActive}
            onNavigate={closeSearch}
            widthClassName="max-w-2xl"
          />
        ) : null}
      </div>

      {/* ---------------------------------------------------------------------
          MOBILE — full-width panel below the whole header. Below `lg` only.
          --------------------------------------------------------------------- */}
      {open ? (
        <div
          id={mobilePanelId}
          style={{ top: mobilePanelTop }}
          className="fixed inset-x-0 z-50 border-b border-ink-200 bg-white shadow-raised
                     motion-safe:animate-[dropdown_140ms_ease-out] lg:hidden"
        >
          <div className="w-full px-6 py-4">
            <div className="flex max-w-2xl items-center gap-1 rounded-full border-2
                             border-ink-200 bg-white pl-3 pr-1 focus-within:border-teal-600">
              <span aria-hidden="true" className="shrink-0 text-teal-600">
                <SearchIcon className="h-4 w-4" />
              </span>

              <label htmlFor={mobileFieldId} className="sr-only">
                Search doctors, specialities and services
              </label>
              <input
                ref={mobileInputRef}
                id={mobileFieldId}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={mobileListboxId}
                aria-autocomplete="list"
                aria-activedescendant={results.length > 0 ? mobileOptionId(active) : undefined}
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onFieldKeyDown}
                placeholder={placeholder}
                className="h-12 min-w-0 flex-1 border-0 bg-transparent px-2 text-step--1
                           text-ink-950 placeholder:text-ink-400 focus:outline-none
                           focus:ring-0 focus-visible:outline-none"
              />

              <button
                type="button"
                onClick={() => closeSearch(true)}
                aria-label="Close search"
                className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center justify-center"
              >
                <CloseIcon />
              </button>
            </div>

            <SearchResults
              query={query}
              results={results}
              active={active}
              listboxId={mobileListboxId}
              optionId={mobileOptionId}
              onSelectActive={setActive}
              onNavigate={closeSearch}
              widthClassName="max-w-2xl"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

const desktopOptionId = (index: number) => `site-search-desktop-option-${index}`
const mobileOptionId = (index: number) => `site-search-mobile-option-${index}`

interface SearchResultsProps {
  query: string
  results: SearchEntry[]
  active: number
  listboxId: string
  optionId: (index: number) => string
  onSelectActive: (index: number) => void
  onNavigate: () => void
  widthClassName: string
}

/** The count live-region, "no results" message, and results listbox — identical markup
 *  for both panel shapes, factored out so the two do not drift against each other. */
function SearchResults({
  query,
  results,
  active,
  listboxId,
  optionId,
  onSelectActive,
  onNavigate,
  widthClassName,
}: SearchResultsProps) {
  return (
    <>
      {/* The count is what tells a screen-reader user their typing did something. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {query
          ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for ${query}`
          : ''}
      </p>

      {query && results.length === 0 ? (
        <p
          className={`mt-2 ${widthClassName} rounded-lg border border-ink-200 bg-white
                      p-4 text-step--1 text-ink-600 shadow-raised`}
        >
          Nothing matches &ldquo;{query}&rdquo;. Try a department, a doctor&rsquo;s name,
          or a test such as &ldquo;ultrasound&rdquo;.
        </p>
      ) : null}

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Search results"
        className={
          results.length > 0
            ? `mt-2 max-h-[60vh] ${widthClassName} overflow-y-auto rounded-lg border
               border-ink-200 bg-white p-2 shadow-raised
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
            onMouseEnter={() => onSelectActive(index)}
            className={index === active ? 'rounded bg-teal-100' : 'rounded'}
          >
            <Link
              href={entry.href}
              onClick={() => onNavigate()}
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
