// app/doctors/[id]/page.tsx
//
// The canonical dynamic route of the platform. Note the param name is `id` — keep it
// consistent across links, generateStaticParams and generateMetadata.
//
// NEXT.JS 15: `params` is a Promise and must be awaited.
// (On Next 14 this would be `params: { id: string }` with no await.)
//
// PHASE 0 SCOPE: route, metadata, static params, notFound handling, and the profile's
// structural skeleton. Phase 3 adds the full profile plus the YouTube facade.
//
// The video section is intentionally absent rather than stubbed with an <iframe>.
// A raw YouTube iframe loads 500KB-1.5MB and sets third-party cookies on page load,
// before the patient clicks anything or gives consent — that breaks both the LCP budget
// and DPDP. The facade (poster + play button, youtube-nocookie injected on click,
// behind media consent) is the only permitted embed on this platform.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Section } from '@/components/primitives/Section'
import { Stack } from '@/components/primitives/Stack'
import { SAMPLE_DOCTORS, getSampleDoctor } from '@/lib/sample-data'
import { primaryLocation, siteConfig } from '@/lib/site-config'

export const revalidate = 3600

interface DoctorProfilePageProps {
  params: Promise<{ id: string }>
}

/** Pre-render every profile at build time; ISR refreshes them hourly. */
export function generateStaticParams(): Array<{ id: string }> {
  return SAMPLE_DOCTORS.map((doctor) => ({ id: doctor.id }))
}

export async function generateMetadata({
  params,
}: DoctorProfilePageProps): Promise<Metadata> {
  const { id } = await params
  const doctor = getSampleDoctor(id)

  if (!doctor) return { title: 'Doctor not found' }

  return {
    title: `${doctor.name} — ${doctor.designation}`,
    description: `${doctor.name}, ${doctor.qualifications}. ${doctor.designation} at ${siteConfig.shortName}, ${siteConfig.city}.`,
    alternates: { canonical: `/doctors/${doctor.id}` },
  }
}

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { id } = await params
  const doctor = getSampleDoctor(id)

  if (!doctor) notFound()

  // Physician structured data — a significant share of doctor discovery starts in search.
  const physicianJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.name,
    jobTitle: doctor.designation,
    medicalSpecialty: doctor.specialisations,
    knowsLanguage: doctor.languages,
    worksFor: { '@type': 'MedicalOrganization', name: siteConfig.name },
    address: {
      '@type': 'PostalAddress',
      addressLocality: primaryLocation.city,
      addressRegion: primaryLocation.state,
      addressCountry: 'IN',
    },
  }

  return (
    <>
      <Section tone="tint" labelledBy="doctor-heading">
        <Stack gap="md" className="max-w-prose">
          <p className="eyebrow">{doctor.designation}</p>
          <h1 id="doctor-heading" className="text-step-4">
            {doctor.name}
          </h1>
          {/* Post-nominals run long in India — never truncate or clamp this line. */}
          <p className="text-step-0 text-ink-600">{doctor.qualifications}</p>
          <span className="rule-accent-lg" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-accent">{doctor.experienceYears} years&rsquo; experience</span>
            <span className="text-step--1 text-ink-950">
              Speaks {doctor.languages.join(', ')}
            </span>
          </div>
        </Stack>
      </Section>

      <Section labelledBy="about-heading" width="prose">
        <h2 id="about-heading" className="text-step-3">
          About
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4">{doctor.about}</p>

        <h2 className="mt-10 text-step-3">Specialisations</h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <ul className="mt-4 list-disc space-y-1 pl-5">
          {doctor.specialisations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 text-step-3">OPD schedule</h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        {/* A real <table>: screen-reader users navigate cell-by-cell with row and column
            announcement, which only works on genuine table semantics. A grid of divs
            here is unreadable. */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-step--1">
            <caption className="sr-only">
              Outpatient department timings for {doctor.name} at {primaryLocation.name}
            </caption>
            <thead>
              <tr className="border-b border-ink-200 text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">Day</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Timing</th>
                <th scope="col" className="py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {doctor.opdSchedule.map((session) => (
                <tr key={`${session.day}-${session.startTime}`} className="border-b border-ink-100">
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

        <p className="mt-10 rounded border border-teal-200 bg-teal-50 p-4 text-step--1">
          <strong>Phase 0 placeholder.</strong> Portrait, education, positions, publications
          and the consent-gated video section arrive in Phase 3.
        </p>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }}
      />
    </>
  )
}
