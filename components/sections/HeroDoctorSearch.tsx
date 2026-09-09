'use client'

// components/sections/HeroDoctorSearch.tsx
//
// The floating search bar under the mobile hero photo. A real <form method="get">
// submitting to /doctors?q=…, same contract as DoctorSearchPanel in the header — see
// that file for why a GET form beats an onChange handler here: it works before
// hydration, the result is a shareable URL, and /doctors renders already-filtered.
//
// NOT A REUSE OF DoctorSearchField. That field hardcodes id="doctor-search" for the
// header's own single instance; mounting a second copy on the same page would collide.
// This is deliberately a separate, simpler leaf — a static placeholder instead of the
// header's typewriter animation, plus the clear button the mockup calls for, which the
// header field has no room for beside its own submit button.

import { useId, useState } from 'react'

export function HeroDoctorSearch() {
  const [value, setValue] = useState('')
  const id = useId()

  return (
    <form action="/doctors" method="get" role="search" className="relative">
      <label htmlFor={id} className="sr-only">
        Search for doctors by name, speciality or qualification
      </label>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-600"
      >
        <SearchIcon />
      </span>

      <input
        id={id}
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search for Doctors"
        autoComplete="off"
        /* h-14, not the site's usual h-12: this bar carries no adjacent submit
           button — see the header field — so it is the one full-width target on
           the card and can afford to be a little taller and easier to land a
           thumb on. No outline/ring on focus: the border going teal-800 is the
           one focus edge, same rule DoctorSearchField itself uses one file over. */
        className="h-14 w-full rounded-full border-2 border-teal-600 bg-white pl-12
                   pr-12 text-step-0 text-ink-950 shadow-raised
                   placeholder:text-ink-400 focus:border-teal-800 focus:outline-none
                   focus:ring-0 focus-visible:outline-none"
      />

      {/* Only rendered once there is something to clear — an empty field has
          nothing for the button to do, and a control with no effect is worse
          than no control. */}
      {value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2
                     items-center justify-center rounded-full text-ink-400
                     transition-colors ease-standard active:bg-ink-100"
        >
          <ClearIcon />
        </button>
      ) : null}
    </form>
  )
}

function SearchIcon() {
  return (
    <svg
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5 shrink-0"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m13.5 13.5 4 4" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
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
