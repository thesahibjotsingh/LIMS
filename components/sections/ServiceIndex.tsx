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

import Image from 'next/image'
import Link from 'next/link'
import { Section } from '@/components/primitives/Section'
import { centreIconSrc } from '@/lib/centre-icons'
import { getDoctorsByDepartment } from '@/lib/doctors'
import {
  SERVICE_CARD_CLASSNAME,
  SERVICE_GRID_CLASSNAME,
  SERVICE_ICON_CLASSNAME,
  SERVICE_ICON_SIZE,
  SERVICE_TITLE_CLASSNAME,
} from '@/lib/service-grid'
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

      {/* SERVICE_GRID_CLASSNAME / SERVICE_CARD_CLASSNAME (lib/service-grid.ts): shared
          with the home page's Centres of Excellence grid and /centres, so all four
          places this same service list is shown render the identical grid and the
          identical card size — see that file for why a shared constant replaced each
          page's own copy. */}
      <div className={`mt-10 ${SERVICE_GRID_CLASSNAME}`}>
        {services.map((service) => {
          const doctors = getDoctorsByDepartment(service.slug)
          const iconSrc = centreIconSrc(service.slug)

          return (
            <Link key={service.slug} href={serviceHref(service)} className={SERVICE_CARD_CLASSNAME}>
              {/* Icon-only where LIMS has supplied one (see lib/centre-icons.ts) —
                  conditional, not a generic fallback glyph, so a service without an
                  asset yet reads as "no icon" rather than a guess. */}
              {iconSrc ? (
                <Image
                  src={iconSrc}
                  alt=""
                  width={SERVICE_ICON_SIZE}
                  height={SERVICE_ICON_SIZE}
                  loading="eager"
                  className={SERVICE_ICON_CLASSNAME}
                />
              ) : null}
              <div className="min-w-0">
                <h2 className={SERVICE_TITLE_CLASSNAME}>{service.name}</h2>
                {/* A consultant count only where a consultant is actually on the roster.
                    "0 consultants" on a service LIMS runs perfectly well is an own goal. */}
                {doctors.length > 0 ? (
                  <p className="mt-0.5 text-[0.7rem] leading-tight text-ink-600">
                    {doctors.length} {doctors.length === 1 ? 'consultant' : 'consultants'}
                  </p>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>

      <p className="mt-10">
        <Link href="/centres" className="link-accent">
          All services at LIMS
        </Link>
      </p>
    </Section>
  )
}
