'use client'

import { useEffect, useState } from 'react'

// hooks/useTypewriterPlaceholder.ts
//
// Cycles the search field's placeholder, Medanta-style.
//
// THE PHRASES NAME THINGS THIS SITE CAN ACTUALLY FIND. The reference cycles
// "Hospitals", which works for a group with many of them; LIMS is one hospital at
// Jindal Chowk, so a placeholder inviting someone to search for hospitals promises a
// result that cannot exist. "Treatments" is the same trap — there is no procedures data
// anywhere in the index, deliberately, because inventing what a hospital treats is the
// one thing this codebase refuses to do. Every phrase below maps to a real kind of entry
// in lib/search-index.ts, so anything the placeholder suggests actually returns hits.
const PHRASES = [
  'Search for Doctors',
  'Search for Specialities',
  'Search for Services',
  'Search for Patient Care',
] as const

/** The phrase shown when the animation is off. Also the server-rendered value. */
const FIRST = PHRASES[0]

export interface TypewriterOptions {
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
  speed = 80,
  pause = 2000,
  enabled = true,
}: TypewriterOptions = {}): string {
  const reducedMotion = usePrefersReducedMotion()

  // Starts on the complete first phrase rather than an empty string. Two reasons: the
  // field never paints with an empty placeholder, and the server and the first client
  // render agree, so there is no hydration mismatch to reconcile.
  const [text, setText] = useState<string>(FIRST)
  const [deleting, setDeleting] = useState(false)
  const [index, setIndex] = useState(0)

  const animate = enabled && !reducedMotion

  useEffect(() => {
    if (!animate) return

    const full = PHRASES[index % PHRASES.length] ?? FIRST
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
  }, [animate, text, deleting, index, speed, pause])

  // Whenever the animation is off, show a complete phrase rather than whatever
  // half-typed fragment it happened to stop on.
  return animate ? text : FIRST
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
