// app/doctors/[id]/page.tsx
//
// The canonical dynamic route of the platform. Note the param name is `id` — keep it
// consistent across links, generateStaticParams and generateMetadata.
//
// NEXT.JS 15: `params` is a Promise and must be awaited.
// (On Next 14 this would be `params: { id: string }` with no await.)
//
// The roster is real, and LIMS has so far supplied names, qualifications, department
// and registration numbers. Every other section on this page renders only when its data
// exists. Nothing is defaulted: an invented OPD timing sends a patient to the hospital
// on the wrong day, and an invented credential is worse than that.
//
// The video section is intentionally absent rather than stubbed with an <iframe>.
// A raw YouTube iframe loads 500KB-1.5MB and sets third-party cookies on page load,
// before the patient clicks anything or gives consent — that breaks both the LCP budget
// and DPDP. The facade (poster + play button, youtube-nocookie injected on click,
// behind media consent) is the only permitted embed on this platform.

import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Section } from '@/components/primitives/Section'
import { Stack } from '@/components/primitives/Stack'
import { DOCTORS, getDoctor, registrationDisplay } from '@/lib/doctors'
import { serviceHrefBySlug, serviceName } from '@/lib/services'
import { contact, primaryLocation, siteConfig } from '@/lib/site-config'

export const revalidate = 3600

interface DoctorProfilePageProps {
  params: Promise<{ id: string }>
}

/** Pre-render every profile at build time; ISR refreshes them hourly. */
export function generateStaticParams(): Array<{ id: string }> {
  return DOCTORS.map((doctor) => ({ id: doctor.id }))
}

export async function generateMetadata({
  params,
}: DoctorProfilePageProps): Promise<Metadata> {
  const { id } = await params
  const doctor = getDoctor(id)

  if (!doctor) return { title: 'Doctor not found' }

  const department = serviceName(doctor.departmentSlug)
  const credentials = [doctor.qualifications, doctor.designation].filter(Boolean).join(', ')

  return {
    title: doctor.designation ? `${doctor.name} — ${doctor.designation}` : doctor.name,
    description: [
      credentials ? `${doctor.name}, ${credentials}.` : `${doctor.name}.`,
      `${department} at ${siteConfig.shortName}, ${siteConfig.city}.`,
    ].join(' '),
    alternates: { canonical: `/doctors/${doctor.id}` },
  }
}

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { id } = await params
  const doctor = getDoctor(id)

  if (!doctor) notFound()

  const department = serviceName(doctor.departmentSlug)

  // Physician structured data — a significant share of doctor discovery starts in search.
  // Optional keys are spread in only when the value exists: an empty medicalSpecialty or
  // a placeholder jobTitle is asserted to search engines as fact about a named person.
  const physicianJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.name,
    medicalSpecialty: department,
    ...(doctor.designation ? { jobTitle: doctor.designation } : {}),
    ...(doctor.languages?.length ? { knowsLanguage: doctor.languages } : {}),
    worksFor: { '@type': 'MedicalOrganization', name: siteConfig.name, url: siteConfig.url },
    address: {
      '@type': 'PostalAddress',
      streetAddress: primaryLocation.addressLines.join(', '),
      addressLocality: primaryLocation.city,
      addressRegion: primaryLocation.state,
      addressCountry: 'IN',
    },
  }

  return (
    <>
      <Section tone="tint" labelledBy="doctor-heading">
        <Stack gap="md" className="max-w-prose">
          {/* Resolved through lib/services so it follows the department to whichever
              section it belongs to, rather than assuming a prefix. */}
          <Link
            href={serviceHrefBySlug(doctor.departmentSlug) ?? '/centres'}
            className="eyebrow hover:underline"
          >
            {department}
          </Link>
          <h1 id="doctor-heading" className="text-step-4">
            {doctor.name}
          </h1>

          {/* Post-nominals run long in India — never truncate or clamp this line. */}
          {doctor.qualifications ? (
            <p className="text-step-0 text-ink-600">{doctor.qualifications}</p>
          ) : null}

          {doctor.designation ? (
            <p className="text-step-0 text-ink-950">{doctor.designation}</p>
          ) : null}

          <span className="rule-accent-lg" aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {doctor.experienceYears ? (
              <span className="badge-accent">
                {doctor.experienceYears} years&rsquo; experience
              </span>
            ) : null}

            {/* Verbatim, and labelled: this is what a patient checks against the council
                register, so a reformatted number is a broken number. */}
            {doctor.registrationNumber ? (
              <span className="text-step--1 text-ink-950">
                <span className="font-semibold">Registration no.</span>{' '}
                <span className="tabular-nums">{registrationDisplay(doctor.registrationNumber)}</span>
              </span>
            ) : null}
          </div>

          {doctor.languages?.length ? (
            <p className="text-step--1 text-ink-950">Speaks {doctor.languages.join(', ')}</p>
          ) : null}
        </Stack>
      </Section>

      <Section labelledBy="appointment-heading" width="prose">
        {doctor.about ? (
          <>
            <h2 className="text-step-3">About</h2>
            <span className="rule-accent mt-3" aria-hidden="true" />
            <p className="mt-4">{doctor.about}</p>
          </>
        ) : null}

        {doctor.specialisations?.length ? (
          <>
            <h2 className="mt-10 text-step-3">Specialisations</h2>
            <span className="rule-accent mt-3" aria-hidden="true" />
            <ul className="mt-4 list-disc space-y-1 pl-5">
              {doctor.specialisations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {doctor.opdSchedule?.length ? (
          <>
            <h2 className="mt-10 text-step-3">OPD schedule</h2>
            <span className="rule-accent mt-3" aria-hidden="true" />
            {/* A real <table>: screen-reader users navigate cell-by-cell with row and
                column announcement, which only works on genuine table semantics. A grid
                of divs here is unreadable. */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-step--1">
                <caption className="sr-only">
                  Outpatient department timings for {doctor.name} at {primaryLocation.name}
                </caption>
                <thead>
                  <tr className="border-b border-ink-200 text-left">
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Day
                    </th>
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Timing
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doctor.opdSchedule.map((session) => (
                    <tr
                      key={`${session.day}-${session.startTime}`}
                      className="border-b border-ink-100"
                    >
                      <th scope="row" className="py-2 pr-4 font-normal capitalize">
                        {session.day}
                      </th>
                      <td className="py-2 pr-4 tabular-nums">
                        {session.startTime} &ndash; {session.endTime}
                      </td>
                      <td className="py-2 text-ink-600">{session.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {/*
          Always rendered, and the reason this section is `labelledBy`. Until LIMS
          supplies OPD timings this is the only actionable thing on the page, so it
          cannot sit behind a conditional — a profile a patient cannot act on is worse
          than no profile at all.
        */}
        <h2 id="appointment-heading" className="mt-10 text-step-3">
          Book with {doctor.name}
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4">
          OPD timings for this consultant are not published yet. To book, call the
          appointments line or request an appointment online.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`tel:${contact.secondary}`}
            className="sweep-solid inline-flex min-h-[44px] items-center px-5 font-semibold"
          >
            Call {contact.secondaryDisplay}
          </a>
          <Link
            href="/appointments"
            className="btn-secondary inline-flex min-h-[44px] items-center px-5
                       font-semibold"
          >
            Request an appointment
          </Link>
        </div>

        <p className="mt-10">
          <Link href="/doctors" className="link-accent">
            Back to all doctors
          </Link>
        </p>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
      />
    </>
  )
}
