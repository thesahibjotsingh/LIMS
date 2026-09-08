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
// layout cost is affordable — the rule it breaks is about repeated animation on many
// elements, and this is neither.
//
// A TRANSITION BETWEEN TWO STATES, NOT A KEYFRAME. The first version ran a keyframe to
// `width: 100%`, and 100% resolved against the 44px wrapper rather than the bar's own
// width — so it expanded to 44px and then snapped to full width when the animation
// ended. That snap was the choppiness. A transition between two explicit widths cannot
// have that bug, and it runs in both directions, so closing is now animated too.
//
// The bar therefore stays MOUNTED and is inert while closed. A transition needs a
// previous value to move from; an element mounted at its final width has nothing to
// animate. `inert` is what makes that safe — it takes the collapsed field out of the tab
// order and out of the accessibility tree, so there is no invisible input in the header
// of every page.
//
// The trigger stays in flow too, covered by the bar rather than removed. Hiding it was
// pulling a 44px item out of the action group on every open, which shifted the Emergency
// and Book appointment buttons sideways — the layout shift this was supposed to avoid.
//
// TWO TRAPS LIVE HERE. Both made the search unopenable, and neither is visible from
// any single line of code, so they are written down.
//
// 1. THE COLLAPSED BAR SAT ON TOP OF THE TRIGGER AND ATE THE CLICK. It is absolutely
//    positioned at right-0 and 44px wide while closed, which is exactly the trigger's
//    box. `inert` stops it handling the click itself, but an inert subtree is not
//    hit-testable and the browser does not fall through to what is underneath:
//    document.elementFromPoint() over the button returned null, so a real mouse click
//    landed on nothing. The gate has to be pointer-events-none on the POSITIONING
//    WRAPPER: putting it on the bar alone left the wrapper itself — same 44px box, same
//    z-50 — still swallowing the click. inert is not enough either; it stops the subtree
//    handling events but does not let them through to what is beneath.
//    Worth knowing that trigger.click() in a test dispatches straight at the element and
//    skips hit-testing entirely, so this passes every scripted check and fails every
//    human one. Test it with elementFromPoint over the trigger, not with .click().
//
// 2. THE INERT/BLUR TRAP. Opening puts `inert` on the trigger while it still holds
//    focus; the browser blurs an inert element immediately, and that blur reaches the
//    wrapper with relatedTarget === null. A close-on-blur handler that trusts
//    relatedTarget therefore closed the search in the same tick it opened. See
//    scheduleBlurCheck below.
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
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder'
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
  /** Pending deferred blur check, cancelled on unmount and on every new blur. */
  const blurCheck = useRef<number | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  const results = useMemo(() => searchSite(query), [query])

  /*
   * The cycling placeholder runs only while the field is open AND empty.
   *
   * Closed, the bar is inert and off-screen, so animating it would be a timer firing
   * every 80ms behind a hidden control on every page of the site for nothing. Once
   * there is a query the placeholder is not visible anyway, and typing is what stops
   * the motion — which, with the hook's prefers-reduced-motion check, is the pair of
   * mechanisms WCAG 2.2.2 asks for.
   */
  const placeholder = useTypewriterPlaceholder({ enabled: open && query === '' })

  const openSearch = useCallback(() => setOpen(true), [])

  const closeSearch = useCallback((returnFocus = false) => {
    restoreFocus.current = returnFocus
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  /*
   * Focus the field as it opens, and hand focus back to the trigger on a deliberate
   * close. useLayoutEffect rather than useEffect: this runs before paint, so the field
   * is focused in the same frame the bar appears and the first keystroke cannot be
   * dropped into a field that is not ready yet. It also shortens the window in which
   * activeElement is body, which is what the deferred blur check has to tolerate.
   *
   * Both directions are safe against inert: by the time this runs React has already
   * committed, so the trigger has lost inert on close and the field has lost it on open.
   */
  useLayoutEffect(() => {
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

  /*
   * WHY THIS IS DEFERRED, AND WHY IT DOES NOT TRUST relatedTarget.
   *
   * This handler used to close the moment relatedTarget fell outside the wrapper, and
   * that made the search unopenable. Clicking the trigger sets `open`, which puts
   * `inert` on the trigger while it still holds focus; a browser blurs an element the
   * instant it becomes inert, and that blur arrives here with relatedTarget === null.
   * "Not inside the wrapper" was therefore true, so the search closed in the same tick
   * it opened — and because closeSearch() also clears the query, anything typed in the
   * gap disappeared with it.
   *
   * relatedTarget is null in several legitimate cases: focus moving to an element that
   * has just rendered, focus leaving for the browser chrome, and exactly this one. So
   * instead of trusting it, the check waits a frame and asks where focus actually
   * landed.
   *
   * document.body is treated as "still open" on purpose. Between the blur and the
   * effect that focuses the field, activeElement is briefly body; closing on that would
   * reintroduce the same bug one frame later. A click that lands outside is handled by
   * the pointerdown listener above, which is the reliable signal for that case.
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
        Borderless. The hover fill from .sweep is the whole affordance — a ring around a
        44px icon reads as a button that has been switched off next to two filled ones.
        Still a 44px target: the padding does the work the border used to.
      */}
      {/*
        Borderless at rest, rich teal on interaction, and never removed from the layout.
        The expanded bar covers it, so it does not need hiding — and hiding it was
        pulling a 44px item out of the action group, shifting the two buttons beside it
        on every open.
      */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        aria-expanded={open}
        aria-controls={open ? FIELD_ID : undefined}
        aria-label="Search this site"
        // Covered by the bar while open, so it must not be reachable or announced.
        inert={open}
        className="btn-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {/*
        The bar. right-0 with an animated width is what makes it grow leftward out of the
        icon: the right edge is pinned where the icon sits, so every pixel it gains
        appears on the left.
      */}
      {/*
        pointer-events GO ON THIS WRAPPER, not on the bar inside it. While closed this
        div is 44px wide at right-0 — pixel-for-pixel the trigger's own box — and it sits
        at z-50 above it. Left interactive it swallows every click aimed at the button,
        which is precisely how the search became unopenable.
      */}
      <div
        className={`absolute right-0 top-1/2 z-50 -translate-y-1/2 ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/*
          ONE BORDER, ON THIS WRAPPER, AND NOWHERE ELSE. The input inside carries no
          border and no outline of its own — that was the nested double ring. Focus is
          shown by this border going teal-600 (4.05:1 on white, past the 3:1 a focus
          indicator needs), so the field still announces focus with a single edge rather
          than a ring inside a ring.

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
                          : 'w-11 border-transparent opacity-0'
                      }`}
        >
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
              placeholder={placeholder}
              /*
                No border, no outline and NO RING: the wrapper carries the single edge.
                All three are needed, and they remove three different things.

                  focus:outline-none / focus-visible:outline-none
                    the outline from globals.css, which targets :focus-visible

                  focus:ring-0
                    the ring @tailwindcss/forms puts on every focused text input —
                    --tw-ring-color: #2563eb painted through box-shadow, not outline.
                    That was the blue frame inside the pill, and outline-none cannot
                    touch it because it is not an outline.
              */
              className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 text-step--1
                         text-ink-950 placeholder:text-ink-400 focus:outline-none
                         focus:ring-0 focus-visible:outline-none"
            />

            <button
              type="button"
              onClick={() => closeSearch(true)}
              aria-label="Close search"
              className="btn-ghost inline-flex h-9 w-9 shrink-0 items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>

          {/* The count is what tells a screen-reader user their typing did something. */}
        {open ? (
          <>
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
          </>
        ) : null}
      </div>
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
