// components/sections/DoctorSearchPanel.tsx
//
// The bar behind "Find a doctor" in the nav. It spans the header rather than hanging off
// the nav item — see the positioning note in NavDropdown — so its contents are laid out
// as one row: field, submit, then the two shortcuts.
//
// A REAL <form method="get">, not an onChange handler. It submits to /doctors?q=…, which
// buys three things a JS-only search does not:
//   • it works before hydration and with the bundle blocked — the bar is in the header of
//     every page, so it is among the first things anyone can reach
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
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      {/*
        The field takes the room and the shortcuts sit beside it. max-w keeps the input
        from stretching to 1900px on a wide monitor, where a search field the width of
        the screen reads as a text area rather than a control.
      */}
      <form
        action="/doctors"
        method="get"
        role="search"
        className="flex min-w-0 flex-1 basis-80 items-stretch gap-2 lg:max-w-2xl"
      >
        {/*
          A real label, visually hidden. A placeholder is not a label: it disappears the
          moment someone types, so anyone relying on it has nothing left to check what
          the field wanted — and screen readers announce placeholders inconsistently.
        */}
        <label htmlFor="doctor-search" className="sr-only">
          Search for doctors by name, speciality or qualification
        </label>

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
            placeholder="Search for Doctors"
            autoComplete="off"
            className="h-11 w-full rounded-full border-2 border-ink-200 bg-white pl-10 pr-4
                       text-step--1 text-ink-950 placeholder:text-ink-400
                       focus:border-teal-600"
          />
        </div>

        <button
          type="submit"
          className="btn-primary inline-flex min-h-[44px] shrink-0 items-center gap-2 px-5
                     text-step--1 font-semibold"
        >
          <SearchIcon />
          Search
        </button>
      </form>

      {/*
        Shortcuts, inline. A vertical rule separates them from the form on wide screens:
        they are a different job, and without the divider a second control on the same
        row reads as a second way to submit the search.
      */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:border-l lg:border-ink-200 lg:pl-8">
        <Link
          href="/appointments"
          className="menu-row flex min-h-[44px] items-center gap-2 whitespace-nowrap pl-5
                     pr-3 text-step--1 font-semibold text-teal-800"
        >
          <CalendarIcon />
          Book an appointment
        </Link>

        <Link
          href="/doctors"
          className="menu-row flex min-h-[44px] items-center whitespace-nowrap pl-5 pr-3
                     text-step--1 font-semibold text-copper-800"
        >
          Browse all doctors
        </Link>
      </div>
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
