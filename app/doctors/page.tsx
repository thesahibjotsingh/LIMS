// app/doctors/page.tsx
//
// Search is URL state: /doctors?q=ortho. That was the recorded decision and this is it
// applied — results are shareable, the Back button behaves, and the first paint is
// already-filtered HTML rather than an empty list hydrating on a slow connection. The
// header's search field is a plain GET form pointing here, so it works before hydration.
//
// A query string is safe here because a speciality is not personal data. A patient
// identifier must never appear in a URL (see the DPDP notes), which is why this searches
// the roster and never the patient.
//
// Reading searchParams makes this route dynamic rather than prerendered. That is the
// cost of server-side filtering and it is the right side of the trade at this size: the
// alternative is shipping the roster to the client and filtering there, which loses the
// shareable URL and the pre-filtered first paint.
//
// Still to come: department filters alongside the text query, and pagination — not
// infinite scroll, which breaks keyboard users, strands the footer, and loses your place
// on back-navigation.
//
// The roster is real. Every optional field below is guarded rather than defaulted —
// see the note at the top of lib/doctors.ts.

import Link from 'next/link'
import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { Grid } from '@/components/primitives/Grid'
import { DOCTORS, registrationDisplay, searchDoctors } from '@/lib/doctors'
import { SERVICES } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Find a doctor',
  description:
    'Consultants at Lifeline Institute of Medical Sciences, Hisar — emergency medicine ' +
    'and critical care, obstetrics and gynaecology, general surgery and orthopaedics.',
}

interface DoctorsPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const results = searchDoctors(query)

  return (
    <Section labelledBy="doctors-heading">
      <p className="eyebrow">Consultants</p>
      <h1 id="doctors-heading" className="mt-2 text-step-5">
        Find a doctor
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      {/* The same form as the header panel, repeated on the page itself. Someone who
          landed here from a link should not have to reopen a menu to search again, and
          it carries the current query so refining a search starts from what you typed. */}
      <form
        action="/doctors"
        method="get"
        role="search"
        className="mt-6 flex max-w-xl items-stretch gap-2"
      >
        <label htmlFor="doctors-page-search" className="sr-only">
          Search for doctors by name, speciality or qualification
        </label>
        <input
          id="doctors-page-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search for Doctors"
          className="h-11 w-full rounded-full border-2 border-ink-200 bg-white px-4
                     text-step--1 text-ink-950 placeholder:text-ink-400
                     focus:border-teal-600"
        />
        <button
          type="submit"
          className="sweep-solid inline-flex min-h-[44px] shrink-0 items-center px-5
                     text-step--1 font-semibold"
        >
          Search
        </button>
      </form>

      {/* Live region: the count is what tells a screen-reader user their search did
          something, since the results themselves are further down the page. */}
      <p aria-live="polite" aria-atomic="true" className="mt-4 text-step--1 text-ink-600">
        {query ? (
          <>
            {results.length} {results.length === 1 ? 'doctor' : 'doctors'} matching{' '}
            <strong className="text-ink-950">&ldquo;{query}&rdquo;</strong>
            {' · '}
            <Link href="/doctors" className="link-accent">
              Clear search
            </Link>
          </>
        ) : (
          <>
            {results.length} {results.length === 1 ? 'doctor' : 'doctors'} listed
          </>
        )}
      </p>

      {/* A dead end is a bad end. When nothing matches, offer the two things that do
          work: the full roster, and a phone number answered by a person. */}
      {query && results.length === 0 ? (
        <div className="mt-8 max-w-prose rounded border border-teal-200 bg-teal-50 p-5">
          <p className="text-step-0 text-ink-950">
            No consultant matches &ldquo;{query}&rdquo;. The roster is small and still
            growing, so the doctor you want may not be listed yet.
          </p>
          <p className="mt-3 text-step--1">
            <Link href="/doctors" className="link-accent">
              See all {DOCTORS.length} doctors
            </Link>{' '}
            or{' '}
            <Link href="/centres" className="link-accent">
              browse by service
            </Link>
            .
          </p>
        </div>
      ) : null}

      {/* Grouped by department rather than one flat list. With four consultants across
          four departments a flat list tells a patient nothing about where to go, and
          the department is the thing they actually arrive knowing. */}
      {/* Iterate the service catalogue, not the roster, so departments always appear
          in LIMS's own order rather than in whatever order doctors were added. The
          grouping applies to the search results, so a query narrows the sections rather
          than flattening them into one list. */}
      {SERVICES.map((service) => {
        const doctors = results.filter((doctor) => doctor.departmentSlug === service.slug)
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
                  className="card-edge flex flex-col border border-ink-200 bg-white p-5
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
                    className="card-cta mt-5 inline-flex min-h-[44px] items-center self-start px-4"
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

export const runtime = 'edge';

export const runtime = 'edge';
