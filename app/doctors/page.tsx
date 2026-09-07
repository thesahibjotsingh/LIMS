// app/doctors/page.tsx
//
// PHASE 0 SCOPE: the directory route exists, renders from typed data, and is fully
// keyboard-operable. Filters, search and the real DoctorCard land in Phase 3.
//
// Design decisions already locked in for Phase 3, recorded here so they are not
// re-litigated:
//   • Filters are URL state (?dept=general-surgery) so results are shareable and the
//     back button behaves. This is safe because a department is not personal data —
//     a patient identifier must never appear in a URL (see references/privacy-dpdp.md).
//   • Filtering happens in a Server Component reading searchParams, so the first paint
//     is already-filtered HTML rather than an empty list hydrating on a slow connection.
//   • Pagination, not infinite scroll: infinite scroll breaks keyboard users, strands
//     the footer, and loses your place on back-navigation.
//
// The roster is real. Every optional field below is guarded rather than defaulted —
// see the note at the top of lib/doctors.ts.

import Link from 'next/link'
import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { Grid } from '@/components/primitives/Grid'
import { DOCTORS, getDoctorsByDepartment, registrationDisplay } from '@/lib/doctors'
import { SERVICES } from '@/lib/services'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Find a doctor',
  description:
    'Consultants at Lifeline Institute of Medical Sciences, Hisar — emergency medicine ' +
    'and critical care, obstetrics and gynaecology, general surgery and orthopaedics.',
}

export default function DoctorsPage() {
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
        {DOCTORS.length} {DOCTORS.length === 1 ? 'doctor' : 'doctors'} listed
      </p>

      {/* Grouped by department rather than one flat list. With four consultants across
          four departments a flat list tells a patient nothing about where to go, and
          the department is the thing they actually arrive knowing. */}
      {/* Iterate the service catalogue, not the roster, so departments always appear
          in LIMS's own order rather than in whatever order doctors were added. */}
      {SERVICES.map((service) => {
        const doctors = getDoctorsByDepartment(service.slug)
        if (doctors.length === 0) return null

        const headingId = `department-${service.slug}`

        return (
          <section key={service.slug} aria-labelledby={headingId} className="mt-12">
            <h2 id={headingId} className="text-step-2">
              {service.name}
            </h2>
            <span className="rule-accent mt-3" aria-hidden="true" />

            <Grid className="mt-6">
              {doctors.map((doctor) => (
                <article
                  key={doctor.id}
                  className="sweep-card flex flex-col border border-ink-200 bg-white p-5
                             shadow-card transition-shadow ease-standard hover:shadow-raised"
                >
                  <h3 className="text-step-1">
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="text-teal-800 underline-offset-4 hover:underline"
                    >
                      {doctor.name}
                    </Link>
                  </h3>

                  {doctor.qualifications ? (
                    <p className="mt-1 text-step--1 text-ink-600">{doctor.qualifications}</p>
                  ) : null}

                  {doctor.designation ? (
                    <p className="mt-2 text-step-0">{doctor.designation}</p>
                  ) : null}

                  {/* The registration number is the field a patient uses to verify a
                      doctor against the council register. Rendered verbatim, and
                      labelled — a bare number means nothing on its own. */}
                  {doctor.registrationNumber ? (
                    <p className="mt-3 text-step--1 text-ink-600">
                      <span className="font-semibold">Reg. no.</span>{' '}
                      <span className="tabular-nums">{registrationDisplay(doctor.registrationNumber)}</span>
                    </p>
                  ) : null}

                  {/* Availability: dot AND text. Colour alone excludes colour-blind users,
                      which on a directory is a real failure rate (WCAG 1.4.1).
                      Omitted entirely until LIMS supplies real availability — a default
                      of "available" would send patients to a doctor who is not in. */}
                  {doctor.availability ? (
                    <p className="mt-4 inline-flex items-center gap-2 text-step--1">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full bg-success"
                      />
                      <span className="text-ink-950">{doctor.availability.label}</span>
                    </p>
                  ) : null}

                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="mt-5 inline-flex min-h-[44px] items-center self-start rounded-full
                               border-2 border-current px-4 font-semibold text-teal-800"
                  >
                    View profile
                    <span className="sr-only"> of {doctor.name}</span>
                  </Link>
                </article>
              ))}
            </Grid>
          </section>
        )
      })}

      <p className="mt-12 rounded border border-teal-200 bg-teal-50 p-4 text-step--1">
        Consultant photographs, OPD timings and profiles are being added. To book with any
        doctor listed here, call the appointments line or use{' '}
        <Link href="/appointments" className="link-accent">
          book an appointment
        </Link>
        . For a service without a named consultant, see{' '}
        <Link href="/centres" className="link-accent">
          all services
        </Link>
        .
      </p>
    </Section>
  )
}
