// components/sections/ServiceIndex.tsx
//
// The listing body shared by /specialities, /services and /patient-care.
//
// Those three routes exist so that a URL names the section a page is listed under —
// /specialities/urology rather than /centres/urology. What they do NOT need is three
// copies of the same grid, which is how the two "All …" links ended up pointing at the
// same place: duplicated markup drifts, and the drift is invisible until someone
// notices two menu items landing on one page.
//
// Server component.

import Link from 'next/link'
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { getDoctorsByDepartment } from '@/lib/doctors'
import { serviceHref, servicesByCategory, type ServiceCategoryDefinition } from '@/lib/services'

export interface ServiceIndexProps {
  category: ServiceCategoryDefinition
  /** Sits above the h1. */
  eyebrow: string
}

export function ServiceIndex({ category, eyebrow }: ServiceIndexProps) {
  const services = servicesByCategory(category.id)

  return (
    <Section labelledBy="service-index-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="service-index-heading" className="mt-2 text-step-5">
        {category.pageTitle}
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step-1 text-ink-950">{category.blurb}</p>

      <Grid min="sm" className="mt-10">
        {services.map((service) => {
          const doctors = getDoctorsByDepartment(service.slug)

          return (
            <Link
              key={service.slug}
              href={serviceHref(service)}
              className="card-edge flex min-h-[44px] flex-col justify-center border
                         border-teal-200 bg-white p-5 shadow-card transition-shadow
                         ease-standard hover:shadow-raised"
            >
              <h2 className="text-step-1 font-semibold text-teal-800">{service.name}</h2>
              {/* A consultant count only where a consultant is actually on the roster.
                  "0 consultants" on a service LIMS runs perfectly well is an own goal. */}
              {doctors.length > 0 ? (
                <p className="mt-1 text-step--1 text-ink-600">
                  {doctors.length} {doctors.length === 1 ? 'consultant' : 'consultants'}
                </p>
              ) : null}
            </Link>
          )
        })}
      </Grid>

      <p className="mt-10">
        <Link href="/centres" className="link-accent">
          All services at LIMS
        </Link>
      </p>
    </Section>
  )
}
