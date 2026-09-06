// app/doctors/page.tsx
//
// PHASE 0 SCOPE: the directory route exists, renders from typed data, and is fully
// keyboard-operable. Filters, search and the real DoctorCard land in Phase 3.
//
// Design decisions already locked in for Phase 3, recorded here so they are not
// re-litigated:
//   • Filters are URL state (?dept=cardiac-sciences) so results are shareable and the
//     back button behaves. This is safe because a department is not personal data —
//     a patient identifier must never appear in a URL (see references/privacy-dpdp.md).
//   • Filtering happens in a Server Component reading searchParams, so the first paint
//     is already-filtered HTML rather than an empty list hydrating on a slow connection.
//   • Pagination, not infinite scroll: infinite scroll breaks keyboard users, strands
//     the footer, and loses your place on back-navigation.

import Link from 'next/link'
import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { Grid } from '@/components/primitives/Grid'
import { SAMPLE_DOCTORS } from '@/lib/sample-data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Find a doctor',
  description:
    'Search consultants at Lifeline Institute of Medical Sciences, Hisar by department, ' +
    'speciality, language and availability.',
}

export default function DoctorsPage() {
  const doctors = SAMPLE_DOCTORS

  return (
    <Section labelledBy="doctors-heading">
      <p className="eyebrow">Consultants</p>
      <h1 id="doctors-heading" className="mt-2 text-step-5">
        Find a doctor
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      {/* Live region: screen-reader users are told the result count changed when Phase 3
          wires up filtering. Sighted users read the same sentence. */}
      <p aria-live="polite" aria-atomic="true" className="mt-4 text-step--1 text-ink-600">
        {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} listed
      </p>

      <Grid className="mt-8">
        {doctors.map((doctor) => (
          <article
            key={doctor.id}
            className="card-accent flex flex-col rounded border border-ink-200 bg-white
                       p-5 pl-7 shadow-card transition-shadow ease-standard
                       hover:shadow-raised"
          >
            {/* Department badge. Copper carries it as a *fill* with copper-800 text on
                copper-50 — copper-500 as text on white is 2.95:1 and fails. The badge
                repeats data that is also in the profile, so it is never the only place
                a department is stated (WCAG 1.4.1). */}
            <span className="badge-accent-soft mb-3 self-start capitalize">
              {doctor.departmentSlug.replace(/-/g, ' ')}
            </span>
            <h2 className="text-step-1">
              <Link
                href={`/doctors/${doctor.id}`}
                className="text-teal-800 underline-offset-4 hover:underline"
              >
                {doctor.name}
              </Link>
            </h2>
            <p className="mt-1 text-step--1 text-ink-600">{doctor.qualifications}</p>
            <p className="mt-2 text-step-0">{doctor.designation}</p>

            {/* Availability: dot AND text. Colour alone excludes colour-blind users,
                which on a directory is a real failure rate (WCAG 1.4.1). */}
            <p className="mt-4 inline-flex items-center gap-2 text-step--1">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-success" />
              <span className="text-ink-950">{doctor.availability.label}</span>
            </p>

            <Link
              href={`/doctors/${doctor.id}`}
              className="mt-5 inline-flex min-h-[44px] items-center self-start rounded
                         border-2 border-teal-800 px-4 font-semibold text-teal-800
                         transition-colors ease-standard hover:bg-teal-50"
            >
              View profile
              <span className="sr-only"> of {doctor.name}</span>
            </Link>
          </article>
        ))}
      </Grid>

      <p className="mt-10 rounded border border-caution/30 bg-copper-50 p-4 text-step--1">
        <strong>Phase 0 placeholder.</strong> These are structural fixtures, not real
        consultants. Filters, search and the full DoctorCard arrive in Phase 3.
      </p>
    </Section>
  )
}
