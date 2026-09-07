// app/centres/page.tsx
//
// The full LIMS service catalogue — all 26 services, grouped.
//
// Grouped rather than listed flat because 26 undifferentiated tiles ask a patient to
// tell "Neurosurgery" apart from "Color Doppler" unaided: one is a department you are
// referred to, the other is a test you are sent for. The grouping is an editorial
// judgement and is flagged as such in lib/services.ts.
//
// A tile shows a consultant count only where a consultant is actually on the roster.
// "0 consultants" on a service LIMS runs perfectly well would be an own goal, so the
// line is absent rather than zero.

import Link from 'next/link'
import type { Metadata } from 'next'
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { getDoctorsByDepartment } from '@/lib/doctors'
import { SERVICE_CATEGORIES, SERVICES, servicesByCategory } from '@/lib/services'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Centres of Excellence',
  description:
    `All ${SERVICES.length} clinical, diagnostic and support services at Lifeline ` +
    'Institute of Medical Sciences, Hisar — from emergency care and surgery to ' +
    'imaging, pathology and physiotherapy.',
}

export default function CentresPage() {
  return (
    <Section labelledBy="centres-heading">
      <p className="eyebrow">Specialist care</p>
      <h1 id="centres-heading" className="mt-2 text-step-5">
        Centres of Excellence
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step-1 text-ink-950">
        {SERVICES.length} clinical, diagnostic and support services at our Jindal Chowk
        campus.
      </p>

      {SERVICE_CATEGORIES.map((category) => {
        const services = servicesByCategory(category.id)
        if (services.length === 0) return null

        const headingId = `category-${category.id}`

        return (
          <section key={category.id} aria-labelledby={headingId} className="mt-14">
            <h2 id={headingId} className="text-step-3">
              {category.name}
            </h2>
            <span className="rule-accent mt-3" aria-hidden="true" />
            <p className="mt-3 max-w-prose text-ink-600">{category.blurb}</p>

            <Grid min="sm" className="mt-6">
              {services.map((service) => {
                const doctors = getDoctorsByDepartment(service.slug)

                return (
                  <Link
                    key={service.slug}
                    href={`/centres/${service.slug}`}
                    className="card-accent flex min-h-[44px] flex-col justify-center rounded
                               border border-teal-200 bg-white p-5 pl-7 shadow-card
                               transition-shadow ease-standard hover:shadow-raised"
                  >
                    <h3 className="text-step-1 font-semibold text-teal-800">
                      {service.name}
                    </h3>
                    {doctors.length > 0 ? (
                      <p className="mt-1 text-step--1 text-ink-600">
                        {doctors.length}{' '}
                        {doctors.length === 1 ? 'consultant' : 'consultants'}
                      </p>
                    ) : null}
                  </Link>
                )
              })}
            </Grid>
          </section>
        )
      })}
    </Section>
  )
}
