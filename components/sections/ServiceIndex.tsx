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
import { gridColsClassName } from '@/lib/grid-cols'
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

      {/* Fixed column counts, not the shared Grid primitive's auto-fit — same choice
          and the same reasoning as the home page's Centres of Excellence grid.
          gridColsClassName (lib/grid-cols.ts) sizes the count to this particular
          list — capped at 6 on desktop, and chosen so the last row is never a single
          stranded card (7 diagnostics services would orphan one at a flat 6; 4
          patient-care services would sit three-quarters empty at a flat 6). */}
      <div className={`mt-10 grid gap-4 ${gridColsClassName(services.length)}`}>
        {services.map((service) => {
          const doctors = getDoctorsByDepartment(service.slug)
          const iconSrc = centreIconSrc(service.slug)

          return (
            <Link
              key={service.slug}
              href={serviceHref(service)}
              className="card-geo flex min-h-[236px] flex-col items-center gap-3 p-5 pt-8
                         text-center"
            >
              {/* Icon-only where LIMS has supplied one (see lib/centre-icons.ts) —
                  conditional, not a generic fallback glyph, so a service without an
                  asset yet reads as "no icon" rather than a guess. Vertical
                  icon-over-label, matching /centres and the home page's Centres of
                  Excellence grid — one consistent card language across every place
                  this same service list is shown.

                  loading="eager": this grid starts right below the h1, so most of
                  these tiles sit above the fold. The browser's native loading="lazy"
                  only fires reliably for images that cross INTO view during a scroll
                  — one already in the initial viewport before any scroll happens can
                  simply never load. These icons are a few KB each, so eager-loading
                  the whole (short) grid costs nothing worth trading for icons that
                  silently never appear on first paint. */}
              {iconSrc ? (
                <Image
                  src={iconSrc}
                  alt=""
                  width={96}
                  height={96}
                  loading="eager"
                  className="h-14 w-14 object-contain"
                />
              ) : null}
              <div>
                <h2 className="text-step-0 font-semibold text-teal-800">{service.name}</h2>
                {/* A consultant count only where a consultant is actually on the roster.
                    "0 consultants" on a service LIMS runs perfectly well is an own goal. */}
                {doctors.length > 0 ? (
                  <p className="mt-1 text-step--1 text-ink-600">
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
