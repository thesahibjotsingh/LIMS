// components/sections/DoctorSearchPanel.tsx
//
// The panel behind "Find a doctor" in the nav.
//
// A REAL <form method="get">, not an onChange handler. It submits to /doctors?q=…, which
// buys three things a JS-only search does not:
//   • it works before hydration and with the bundle blocked — the panel is in the
//     header of every page, so it is the first thing someone can reach
//   • the result is a URL, so it can be shared, bookmarked, and reached with Back
//   • the directory renders already-filtered HTML rather than an empty list that
//     populates on a slow connection
// That is the decision already recorded in app/doctors/page.tsx, applied here.
//
// Server component. Nothing in it needs client JS; the surrounding disclosure is the
// only part that does.

import Link from 'next/link'

export function DoctorSearchPanel() {
  return (
    <div className="w-[min(34rem,calc(100vw-3rem))] p-2">
      <form action="/doctors" method="get" role="search" className="flex items-stretch gap-2">
        {/*
          A real label, visually hidden. A placeholder is not a label: it disappears the
          moment someone types, so anyone relying on it has nothing left to check what
          the field wanted — and screen readers announce placeholders inconsistently.
        */}
        <label htmlFor="doctor-search" className="sr-only">
          Search for doctors by name, speciality or qualification
        </label>

        <div className="relative flex-1">
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
            placeholder="Search for Doctors"
            autoComplete="off"
            className="h-11 w-full rounded-full border-2 border-ink-200 bg-white pl-10 pr-4
                       text-step--1 text-ink-950 placeholder:text-ink-400
                       focus:border-teal-600"
          />
        </div>

        <button
          type="submit"
          className="sweep-solid inline-flex min-h-[44px] shrink-0 items-center gap-2 px-5
                     text-step--1 font-semibold"
        >
          <SearchIcon />
          Search
        </button>
      </form>

      {/*
        The booking shortcut. Separated by a rule rather than sitting in the form row:
        it is a different job, and a second control inside a search row reads as a
        second way to submit the search.
      */}
      <Link
        href="/appointments"
        className="menu-row mt-2 flex min-h-[44px] items-center gap-2 border-t
                   border-ink-200 pl-5 pr-3 text-step--1 font-semibold text-teal-800"
      >
        <CalendarIcon />
        Book an appointment
      </Link>

      <Link
        href="/doctors"
        className="menu-row flex min-h-[44px] items-center pl-5 pr-3 text-step--1
                   font-semibold text-copper-800"
      >
        Browse all doctors
      </Link>
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

function CalendarIcon() {
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
      className="h-4 w-4 shrink-0"
    >
      <rect x="2.5" y="4" width="15" height="13" rx="2" />
      <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" />
    </svg>
  )
}
