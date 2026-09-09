export const runtime = 'edge';
// app/doctors/page.tsx
//
// Search is URL state: /doctors?q=ortho&dept=urology. That was the recorded decision and
// this is it applied — results are shareable, the Back button behaves, and the first
// paint is already-filtered HTML rather than an empty list hydrating on a slow
// connection. The header's search field is a plain GET form pointing here, so it works
// before hydration.
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
// THE DEPARTMENT FILTER IS A SEPARATE STEP FROM searchDoctors, NOT A NEW PARAMETER ON IT.
// That function free-texts across name, qualifications, designation AND department name —
// widening its own contract to also narrow by an exact department would make one function
// do two different kinds of matching. Filtering the text-search results by `dept`
// afterward keeps each concern in one place and composes: a query AND a department both
// narrow the same list, in either order.
//
// THE OPTIONS LIST IS departmentsWithDoctors(), NOT SERVICES. Fifteen clinical
// departments are on LIMS's list; four currently have a named consultant. Offering all
// fifteen would let a patient pick "Neurosurgery" and land on a guaranteed empty state —
// a dead end the search itself already goes out of its way to avoid (see the note on
// searchDoctors). The filter can only ever narrow to a department that already has
// someone to show.
//
// Still to come: pagination — not infinite scroll, which breaks keyboard users, strands
// the footer, and loses your place on back-navigation.
//
// The roster is real. Every optional field below is guarded rather than defaulted —
// see the note at the top of lib/doctors.ts.

import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { DOCTORS, departmentsWithDoctors, registrationDisplay, searchDoctors } from '@/lib/doctors'
import { SERVICES, serviceName } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Find a doctor',
  description:
    'Consultants at Lifeline Institute of Medical Sciences, Hisar — emergency medicine ' +
    'and critical care, obstetrics and gynaecology, general surgery and orthopaedics.',
}

interface DoctorsPageProps {
  searchParams: Promise<{ q?: string; dept?: string }>
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const { q, dept } = await searchParams
  const query = q?.trim() ?? ''

  // A stale or hand-edited dept value (a department that has since lost its only
  // consultant, or a typo) is treated as no filter rather than an error — the page stays
  // usable instead of quietly stranding a patient on an empty result for a reason they
  // cannot see.
  const departmentOptions = departmentsWithDoctors()
  const department = dept && departmentOptions.includes(dept) ? dept : ''

  const results = searchDoctors(query).filter(
    (doctor) => !department || doctor.departmentSlug === department,
  )

  return (
    <Section labelledBy="doctors-heading">
      <p className="eyebrow">Consultants</p>
      <h1 id="doctors-heading" className="mt-2 text-step-5">
        Find a doctor
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      {/* The same form as the header panel, plus a department select the compact header
          bar has no room for. Someone who landed here from a link should not have to
          reopen a menu to search again, and both fields carry their current value so
          refining a search starts from what was already chosen. */}
      <form
        action="/doctors"
        method="get"
        role="search"
        className="mt-6 flex max-w-2xl flex-wrap items-stretch gap-2"
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
          /* focus:ring-0 kills the forms plugin's blue box-shadow ring, which would
             otherwise sit just inside this field's own teal focus border. */
          className="h-12 min-w-0 flex-1 basis-48 rounded-full border-2 border-ink-200
                     bg-white px-4 text-step--1 text-ink-950 placeholder:text-ink-400
                     focus:border-teal-600 focus:outline-none focus:ring-0"
        />

        <label htmlFor="doctors-page-dept" className="sr-only">
          Filter by speciality
        </label>
        {/* A native <select>: full keyboard support and platform-consistent behaviour
            for free, and one more real HTML control on a site that already prefers a
            real <form>, <table> and <dialog> over hand-rolled equivalents elsewhere. */}
        <select
          id="doctors-page-dept"
          name="dept"
          defaultValue={department}
          className="h-12 shrink-0 rounded-full border-2 border-ink-200 bg-white px-4
                     text-step--1 text-ink-950 focus:border-teal-600 focus:outline-none
                     focus:ring-0"
        >
          <option value="">All specialities</option>
          {departmentOptions.map((slug) => (
            <option key={slug} value={slug}>
              {serviceName(slug)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="btn-primary inline-flex min-h-[48px] shrink-0 items-center px-5
                     text-step--1 font-semibold"
        >
          Search
        </button>
      </form>

      {/* Live region: the count is what tells a screen-reader user their search did
          something, since the results themselves are further down the page. */}
      <p aria-live="polite" aria-atomic="true" className="mt-4 text-step--1 text-ink-600">
        {query || department ? (
          <>
            {results.length} {results.length === 1 ? 'doctor' : 'doctors'}
            {query ? (
              <>
                {' '}
                matching <strong className="text-ink-950">&ldquo;{query}&rdquo;</strong>
              </>
            ) : null}
            {department ? (
              <>
                {' '}
                in <strong className="text-ink-950">{serviceName(department)}</strong>
              </>
            ) : null}
            {' · '}
            <Link href="/doctors" className="link-accent">
              Clear {query && department ? 'search & filter' : query ? 'search' : 'filter'}
            </Link>
          </>
        ) : (
          <>
            {results.length} {results.length === 1 ? 'doctor' : 'doctors'} listed
          </>
        )}
      </p>

      {/* A dead end is a bad end. When nothing matches, offer the two things that do
          work: the full roster, and a phone number answered by a person.

          department ALONE never lands here — departmentOptions only ever lists a
          department that already has a consultant, so this can only fire when the text
          query narrows a (possibly department-filtered) result set to zero. */}
      {query && results.length === 0 ? (
        <div className="mt-8 max-w-prose rounded border border-teal-200 bg-teal-50 p-5">
          <p className="text-step-0 text-ink-950">
            No consultant matches &ldquo;{query}&rdquo;
            {department ? <> in {serviceName(department)}</> : null}. The roster is small
            and still growing, so the doctor you want may not be listed yet.
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

            <ul className="mt-6 flex flex-col gap-5">
              {doctors.map((doctor) => (
                <li key={doctor.id}>
                  <article className="card-geo flex flex-col gap-4 p-6 sm:flex-row">
                    {/* Portrait, or the shared silhouette placeholder when LIMS has not
                        supplied one yet. alt="" either way: the doctor's name is already
                        the card's own heading, so a screen reader naming the photo too
                        would announce it twice. rounded-2xl (a squircle), not a circle —
                        deliberately different from the avatar-circle default, and it
                        reads as a smaller sibling of .card-geo's own asymmetric corners. */}
                    <Image
                      src={doctor.portrait?.src ?? '/images/placeholder-doctor.jpg'}
                      alt=""
                      width={doctor.portrait?.width ?? 160}
                      height={doctor.portrait?.height ?? 160}
                      className="h-20 w-20 shrink-0 rounded-2xl bg-teal-100 object-cover
                                 sm:h-24 sm:w-24"
                    />

                    <div className="flex flex-1 flex-col gap-4">
                      <h3 className="text-step-1">
                        <Link
                          href={`/doctors/${doctor.id}`}
                          className="text-teal-800 underline-offset-4 hover:underline"
                        >
                          {doctor.name}
                        </Link>
                      </h3>

                      {doctor.designation ? (
                        <p className="-mt-2 text-step-0">{doctor.designation}</p>
                      ) : null}

                      {/* Structured facts as a definition list rather than a stack of
                          unrelated paragraphs — qualifications and the registration
                          number are name/value pairs, not prose. The registration number
                          is the field a patient uses to verify a doctor against the
                          council register: rendered verbatim, and labelled, since a bare
                          number means nothing on its own. */}
                      {doctor.qualifications || doctor.registrationNumber ? (
                        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-step--1">
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

                      {/* Availability: dot AND text. Colour alone excludes colour-blind
                          users, which on a directory is a real failure rate (WCAG 1.4.1).
                          Omitted entirely until LIMS supplies real availability — a
                          default of "available" would send patients to a doctor who is
                          not in. */}
                      {doctor.availability ? (
                        <p className="inline-flex items-center gap-2 text-step--1">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full bg-success"
                          />
                          <span className="text-ink-950">{doctor.availability.label}</span>
                        </p>
                      ) : null}

                      <Link
                        href={`/doctors/${doctor.id}`}
                        className="card-cta inline-flex min-h-[48px] items-center self-start px-4"
                      >
                        View profile
                        <span className="sr-only"> of {doctor.name}</span>
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
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


