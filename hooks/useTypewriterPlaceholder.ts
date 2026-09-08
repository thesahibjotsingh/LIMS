'use client'

import { useEffect, useState } from 'react'

// hooks/useTypewriterPlaceholder.ts
//
// Cycles the search field's placeholder, Medanta-style.
//
// THE LIST IS A PARAMETER, because the two fields that use this hook search different
// things. The header searches the whole site, so it cycles the kinds of entry the site
// holds. The "Find a doctor" bar searches doctors only, so it cycles the prompt and then
// the consultants by name — a placeholder there that named specialities or treatments
// would advertise a search that field cannot run.
//
// KNOWN GAP, ASKED FOR DELIBERATELY: "Hospitals" and "Treatments" in the default list do
// not map to entries in lib/search-index.ts. LIMS is one hospital at Jindal Chowk, so
// there is no set of hospitals to search, and there is no procedures data in the index —
// inventing what a hospital treats is the one thing this codebase refuses to do. Both
// phrases therefore invite a search that returns nothing. If they stay, the fix is to
// give them something to find: an index entry for the hospital itself, and real
// treatment pages.
const DEFAULT_PHRASES = [
  'Search for Doctors',
  'Search for Specialities',
  'Search for Hospitals',
  'Search for Treatments',
] as const

export interface TypewriterOptions {
  /**
   * The phrases to cycle, in order. The first one is what the field shows before
   * hydration and whenever the animation is off, so it must stand on its own.
   *
   * Pass a STABLE array. A literal built inline in the render body is a new reference
   * every render, which re-runs the effect and resets the timer on each pass — the
   * animation stalls a character in. Hoist it to a module constant, or memoise it.
   */
  phrases?: readonly string[]
  /** Milliseconds per character while typing. Deleting runs at half this. */
  speed?: number
  /** How long a completed phrase rests before it starts deleting. */
  pause?: number
  /**
   * Run the animation. Pass false whenever it would be pointless or unwelcome —
   * the field is closed, or the user has typed something — and the timers stop
   * entirely rather than ticking away behind a hidden control on every page.
   */
  enabled?: boolean
}

export function useTypewriterPlaceholder({
  phrases = DEFAULT_PHRASES,
  speed = 80,
  pause = 2000,
  enabled = true,
}: TypewriterOptions = {}): string {
  const reducedMotion = usePrefersReducedMotion()

  /** The phrase shown when the animation is off. Also the server-rendered value. */
  const first = phrases[0] ?? DEFAULT_PHRASES[0]

  // Starts on the complete first phrase rather than an empty string. Two reasons: the
  // field never paints with an empty placeholder, and the server and the first client
  // render agree, so there is no hydration mismatch to reconcile.
  const [text, setText] = useState<string>(first)
  const [deleting, setDeleting] = useState(false)
  const [index, setIndex] = useState(0)

  const animate = enabled && !reducedMotion

  useEffect(() => {
    if (!animate) return

    const full = phrases[index % phrases.length] ?? first
    const atFull = !deleting && text === full
    const atEmpty = deleting && text === ''

    /*
     * ONE TIMER PER STATE, ALWAYS CLEANED UP.
     *
     * The obvious shape of this — scheduling the pause with its own setTimeout inside
     * the tick handler — leaks. That inner timer is not returned from the effect, so
     * nothing clears it on unmount, and because completing a phrase also changes state,
     * the effect re-runs and schedules another one on top. They stack, and the phrase
     * starts deleting several times over.
     *
     * Deriving the delay from the current state instead means there is exactly one
     * timer in flight, and the effect's own cleanup covers it.
     */
    const delay = atFull ? pause : atEmpty ? 0 : deleting ? speed / 2 : speed

    const timer = setTimeout(() => {
      if (atFull) {
        setDeleting(true)
      } else if (atEmpty) {
        setDeleting(false)
        setIndex((value) => value + 1)
      } else {
        setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1))
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [animate, text, deleting, index, speed, pause, phrases, first])

  // Whenever the animation is off, show a complete phrase rather than whatever
  // half-typed fragment it happened to stop on.
  return animate ? text : first
}

/**
 * Tracks prefers-reduced-motion.
 *
 * The animation is the kind WCAG 2.2.2 is about: it starts on its own and never ends.
 * Honouring the OS setting is the mechanism that stops it, and typing is the other —
 * the field's own `enabled` flag goes false the moment there is a query.
 *
 * Starts false so the server and the first client render agree; the real value arrives
 * in the effect.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}
