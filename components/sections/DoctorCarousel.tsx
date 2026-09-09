'use client'

// components/sections/DoctorCarousel.tsx
//
// "Meet our consultants" — one slide per doctor on the real roster (lib/doctors.ts),
// stepped through with arrows rather than autoplay. No auto-advance, on purpose: this
// site carries a sitewide prefers-reduced-motion guard for a clinical audience that
// includes vestibular disorders, and a carousel that moves on its own without a visible
// pause control is exactly the pattern that guard exists to rule out (WCAG 2.2.2).
// Manual-only sidesteps the requirement entirely instead of half-meeting it.
//
// REAL FIELDS ONLY, FROM lib/doctors.ts. Name, department, qualifications and
// registration number are the verified facts LIMS has supplied — the same ones the
// doctor directory and profile pages already show.
//
// THE BIO AND QUOTE BELOW ARE DEMO COPY, NOT REAL CONTENT, AND ARE KEPT OUT OF
// lib/doctors.ts ON PURPOSE. That file feeds the doctor's real profile page and the
// Physician structured data sent to search engines — mixing invented bio text into it
// would risk a fabricated quote being indexed as a fact about a named, real physician,
// which is the exact harm doctors.ts's own file header warns against. DEMO_COPY lives
// only here, is visually marked as a sample on the page itself, and every entry should
// be deleted the moment LIMS supplies the doctor's real words.
//
// PORTRAITS: initials on a coloured tile, not a stock photo. A downloaded photo of an
// unrelated person, captioned with a real doctor's name, misrepresents a real physician
// — a risk worth avoiding even for a placeholder that will be swapped later. The tile
// makes the gap obvious instead of quietly filling it with someone else's face.

import { useId, useState } from 'react'
import Link from 'next/link'
import { registrationDisplay } from '@/lib/doctors'
import { serviceName } from '@/lib/services'
import type { Doctor } from '@/types'

export interface DoctorCarouselProps {
  doctors: Doctor[]
}

/**
 * DEMO-ONLY placeholder copy, keyed by doctor id.
 * Replace each entry with the doctor's own words once LIMS supplies them, and delete
 * this object entirely once every doctor on the roster has real content. See the file
 * header for why this cannot live in lib/doctors.ts.
 */
const DEMO_COPY: Record<string, { bio: string; quote: string }> = {
  'udit-choudhary': {
    bio: 'Sample shape only — two or three sentences on what Dr. Choudhary treats day to day, how long he has practised, and what a patient can expect arriving in Emergency.',
    quote: 'Sample shape only — one short sentence in the doctor’s own words about their approach to patient care.',
  },
  'shweta-godara': {
    bio: 'Sample shape only — two or three sentences on Dr. Godara’s practice in obstetrics and gynaecology, and what a first appointment looks like.',
    quote: 'Sample shape only — one short sentence in the doctor’s own words about their approach to patient care.',
  },
  'vikash-raj': {
    bio: 'Sample shape only — two or three sentences on Dr. Raj’s work in general and laparoscopic surgery, and his experience treating it.',
    quote: 'Sample shape only — one short sentence in the doctor’s own words about their approach to patient care.',
  },
  'harshal-godara': {
    bio: 'Sample shape only — two or three sentences on Dr. Godara’s practice in orthopaedics and joint replacement, and who he typically treats.',
    quote: 'Sample shape only — one short sentence in the doctor’s own words about their approach to patient care.',
  },
}

const AVATAR_TONES = ['bg-teal-700', 'bg-copper-700', 'bg-teal-600', 'bg-copper-600']

/** "Dr. Udit Choudhary" -> "UC". Drops any leading salutation so the initials are the
 *  person's own, not "D" for "Dr." */
function initials(name: string): string {
  const words = name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function DoctorCarousel({ doctors }: DoctorCarouselProps) {
  const [index, setIndex] = useState(0)
  const liveRegionId = useId()

  const doctor = doctors[index]
  if (!doctor) return null

  const department = serviceName(doctor.departmentSlug)
  const demo = DEMO_COPY[doctor.id]
  // Alternates the portrait side per slide, so "own layout per doctor" is a real
  // structural difference rather than four identical templates with new words.
  const reversed = index % 2 === 1

  const goTo = (next: number) => {
    setIndex(((next % doctors.length) + doctors.length) % doctors.length)
  }

  return (
    <div>
      <div
        key={doctor.id}
        className={`flex flex-col gap-8 sm:items-center motion-safe:animate-[dropdown_200ms_ease-out]
                    ${reversed ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
      >
        {/* Portrait placeholder — see file header. */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            aria-hidden="true"
            className={`flex h-32 w-32 items-center justify-center rounded-2xl text-step-3
                        font-semibold text-white sm:h-40 sm:w-40 ${AVATAR_TONES[index % AVATAR_TONES.length]}`}
          >
            {initials(doctor.name)}
          </div>
          <span className="badge-accent-soft">Photo coming soon</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow">{department}</p>
          <h3 className="mt-2 text-step-3">{doctor.name}</h3>

          {doctor.designation ? (
            <p className="mt-1 text-step-0 text-ink-950">{doctor.designation}</p>
          ) : null}

          {doctor.qualifications || doctor.registrationNumber ? (
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-step--1">
              {doctor.qualifications ? (
                <div>
                  <dt className="sr-only">Qualifications</dt>
                  <dd className="text-ink-600">{doctor.qualifications}</dd>
                </div>
              ) : null}
              {doctor.registrationNumber ? (
                <div>
                  <dt className="inline font-semibold text-ink-600">Reg. no. </dt>
                  <dd className="inline tabular-nums text-ink-600">
                    {registrationDisplay(doctor.registrationNumber)}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {/* Demo-only content, visually set apart from the verified fields above with
              a dashed border and an explicit label — never let this read as fact. */}
          {demo ? (
            <div className="mt-5 rounded-lg border border-dashed border-copper-300 bg-copper-50/60 p-4">
              <p className="eyebrow">Sample content — replace with the doctor&rsquo;s own words</p>
              <p className="mt-2 text-step--1 italic text-ink-600">{demo.bio}</p>
              <p className="mt-3 text-step--1 italic text-ink-600">&ldquo;{demo.quote}&rdquo;</p>
            </div>
          ) : null}

          <Link
            href={`/doctors/${doctor.id}`}
            className="card-cta mt-5 inline-flex min-h-[48px] items-center px-4"
          >
            View full profile
            <span className="sr-only"> of {doctor.name}</span>
          </Link>
        </div>
      </div>

      {/* Announces the change for anyone not looking at the slide when it updates —
          the same job the search results count plays in SiteSearch. */}
      <p id={liveRegionId} aria-live="polite" aria-atomic="true" className="sr-only">
        Showing {index + 1} of {doctors.length}: {doctor.name}
      </p>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous doctor"
          aria-controls={liveRegionId}
          className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <ChevronIcon className="h-5 w-5 rotate-180" />
        </button>

        <p className="text-step--1 tabular-nums text-ink-600" aria-hidden="true">
          {index + 1} / {doctors.length}
        </p>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next doctor"
          aria-controls={liveRegionId}
          className="btn-ghost inline-flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <ChevronIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
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
      className={className}
    >
      <path d="m7.5 4 6 6-6 6" />
    </svg>
  )
}
