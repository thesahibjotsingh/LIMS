// app/centres/[slug]/page.tsx
//
// A service page. Right now it does one job: name the service and list the consultants
// who practise in it, if any are on the roster yet.
//
// It deliberately does NOT carry an overview, conditions treated, procedures offered,
// equipment or facilities. Those are the Department record and they arrive in Phase 2
// from LIMS. Generating them would mean writing clinical claims about what a hospital
// treats and what it can perform, which is the single worst thing to invent on a site
// like this — and it would read as authoritative precisely because it sits under the
// hospital's own name.
//
// NEXT.JS 15: `params` is a Promise and must be awaited.

import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { getDoctorsByDepartment, registrationDisplay } from '@/lib/doctors'
import { SERVICES, getService } from '@/lib/services'
import { contact, siteConfig } from '@/lib/site-config'

export const revalidate = 3600

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return SERVICES.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)

  if (!service) return { title: 'Service not found' }

  return {
    title: service.name,
    description: `${service.name} at ${siteConfig.name}, ${siteConfig.city}.`,
    alternates: { canonical: `/centres/${service.slug}` },
  }
}

const CATEGORY_EYEBROW = {
  clinical: 'Clinical department',
  diagnostics: 'Diagnostics & imaging',
  support: 'Patient support service',
} as const

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = getService(slug)

  if (!service) notFound()

  const doctors = getDoctorsByDepartment(service.slug)

  return (
    <>
      <Section tone="tint" labelledBy="service-heading">
        <p className="eyebrow">{CATEGORY_EYEBROW[service.category]}</p>
        <h1 id="service-heading" className="mt-2 text-step-4">
          {service.name}
        </h1>
        {/* Alternative names are shown because a patient arrives holding a referral
            slip that may use either wording. */}
        {service.alsoKnownAs?.length ? (
          <p className="mt-2 text-step-0 text-ink-600">
            Also known as {service.alsoKnownAs.join(', ')}
          </p>
        ) : null}
        <span className="rule-accent-lg mt-3" aria-hidden="true" />
      </Section>

      <Section labelledBy="consultants-heading">
        <h2 id="consultants-heading" className="text-step-3">
          {doctors.length > 0 ? 'Consultants' : 'Enquiries'}
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />

        {doctors.length === 0 ? (
          <p className="mt-4 max-w-prose">
            {/* No claim either way about staffing: LIMS has supplied the service list
                and four consultants, and the two do not yet line up one to one. */}
            Consultant details for this service are being added. To ask about{' '}
            {service.name.toLowerCase()} at {siteConfig.shortName}, call{' '}
            <a href={`tel:${contact.secondary}`} className="link-accent">
              {contact.secondaryDisplay}
            </a>
            .
          </p>
        ) : (
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

                {doctor.registrationNumber ? (
                  <p className="mt-3 text-step--1 text-ink-600">
                    <span className="font-semibold">Reg. no.</span>{' '}
                    <span className="tabular-nums">
                      {registrationDisplay(doctor.registrationNumber)}
                    </span>
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
        )}

        <p className="mt-10">
          <Link href="/centres" className="link-accent">
            All {SERVICES.length} services
          </Link>
        </p>
      </Section>
    </>
  )
}
