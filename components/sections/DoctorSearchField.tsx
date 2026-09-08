'use client'

// components/sections/DoctorSearchField.tsx
//
// The input inside the "Find a doctor" bar, split out as the one client leaf of an
// otherwise server-rendered panel.
//
// WHY IT IS ITS OWN FILE. DoctorSearchPanel is a server component and the rest of it —
// the form, the submit button, the two shortcuts — needs no JS. Marking that whole file
// 'use client' to get one animated placeholder would ship the entire bar to the browser
// for an effect. This leaf carries the hook and nothing else.
//
// The panel is mounted only while the dropdown is open (see NavDropdown), so the
// animation cannot tick behind a closed menu — that is the same guarantee SiteSearch
// gets from its `enabled` flag, here bought by unmounting instead.
//
// STILL UNCONTROLLED. The field keeps its own value so the surrounding
// <form method="get"> submits it natively, before hydration and with the bundle blocked.
// Only emptiness is tracked in React, which is all the hook needs: once someone types,
// the placeholder is invisible anyway and the motion stops — the second of the two
// mechanisms WCAG 2.2.2 asks for, the first being the hook's reduced-motion check.

import { useState } from 'react'
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder'

export interface DoctorSearchFieldProps {
  /**
   * The phrases to cycle. The panel passes the prompt followed by the consultants' own
   * names, so everything this field offers is something typing it would actually find.
   *
   * The names come down as a prop rather than being imported here: lib/doctors.ts runs
   * a consistency check at module scope and carries every field of every record, none of
   * which the browser needs to animate four strings.
   */
  phrases: readonly string[]
}

export function DoctorSearchField({ phrases }: DoctorSearchFieldProps) {
  const [empty, setEmpty] = useState(true)
  const placeholder = useTypewriterPlaceholder({ phrases, enabled: empty })

  return (
    <div className="relative min-w-0 flex-1">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
                   text-teal-600"
      >
        <SearchIcon />
      </span>
      <input
        id="doctor-search"
        type="search"
        name="q"
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => setEmpty(event.target.value === '')}
        /* No outline and no ring: this field's own teal border is the single focus
           edge. focus:ring-0 kills the forms plugin's blue box-shadow ring, which
           outline-none cannot touch because it is not an outline; the two
           outline-none rules cover globals.css, which targets :focus-visible. */
        className="h-11 w-full rounded-full border-2 border-ink-200 bg-white pl-10 pr-4
                   text-step--1 text-ink-950 placeholder:text-ink-400
                   focus:border-teal-600 focus:outline-none focus:ring-0
                   focus-visible:outline-none"
      />
    </div>
  )
}

function SearchIcon() {
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
      <circle cx="9" cy="9" r="6" />
      <path d="m13.5 13.5 4 4" />
    </svg>
  )
}
