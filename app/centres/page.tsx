// app/centres/page.tsx
//
// The full LIMS service catalogue — all 26 services, grouped.
//
// This is the only page that shows all three sections together. Each section also has
// its own route — /specialities, /services, /patient-care — and its heading here links
// to it, so this page is the overview and those are the destinations.
//
// Grouped rather than listed flat because 26 undifferentiated tiles ask a patient to
// tell "Neurosurgery" apart from "Color Doppler" unaided: one is a department you are
// referred to, the other is a test you are sent for. The grouping is an editorial
// judgement and is flagged as such in lib/services.ts.
//
// A tile shows a consultant count only where a consultant is actually on the roster.
// "0 consultants" on a service LIMS runs perfectly well would be an own goal, so the
// line is absent rather than zero.

import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { centreIconSrc } from '@/lib/centre-icons'
import { getDoctorsByDepartment } from '@/lib/doctors'
import {
  SERVICE_CATEGORIES,
  SERVICES,
  serviceHref,
  servicesByCategory,
  type ServiceCategory,
} from '@/lib/services'

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

        const CategoryIcon = CATEGORY_ICONS[category.id]

        return (
          <section key={category.id} aria-labelledby={headingId} className="mt-14">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                           bg-teal-100 text-teal-800"
              >
                <CategoryIcon className="h-5 w-5" />
              </span>
              <h2 id={headingId} className="text-step-3">
                <Link href={category.basePath} className="text-teal-800 hover:underline">
                  {category.name}
                </Link>
              </h2>
            </div>
            <span className="rule-accent mt-3" aria-hidden="true" />
            <p className="mt-3 max-w-prose text-ink-600">{category.blurb}</p>

            {/* min="xs" + vertical icon-over-label reads as a scannable specialty
                index, applied to all three categories for one consistent grid
                language down the page — even though only clinical has a supplied
                icon today, so diagnostics/support tiles simply centre their label
                with no icon slot, rather than looking like a different component. */}
            <Grid min="xs" gap="sm" className="mt-6">
              {services.map((service) => {
                const doctors = getDoctorsByDepartment(service.slug)
                const iconSrc = centreIconSrc(service.slug)

                return (
                  <Link
                    key={service.slug}
                    href={serviceHref(service)}
                    className="card-geo flex min-h-[48px] flex-col items-center gap-3 p-5
                               text-center"
                  >
                    {/* Only clinical departments have a supplied icon today — see
                        lib/centre-icons.ts. Absent elsewhere rather than a generic
                        stand-in, so a diagnostics or support tile without one reads
                        as "not supplied yet", not as a guess. */}
                    {iconSrc ? (
                      <Image src={iconSrc} alt="" width={80} height={80} className="h-12 w-12" />
                    ) : null}
                    <div>
                      <h3 className="text-step-0 font-semibold text-teal-800">
                        {service.name}
                      </h3>
                      {doctors.length > 0 ? (
                        <p className="mt-1 text-step--1 text-ink-600">
                          {doctors.length}{' '}
                          {doctors.length === 1 ? 'consultant' : 'consultants'}
                        </p>
                      ) : null}
                    </div>
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

/* ---------------------------------------------------------------------------
   Category pictograms — one per section, drawn from circles and straight lines
   only (the same restraint SiteSearch's own icons use), not an icon-kit import.
   Chosen for what each category actually is, not a borrowed SaaS metaphor: a
   cross for clinical treatment, scan rings for diagnostics and imaging, and a
   lifebuoy for patient support — which happens to echo "Lifeline" too.
   --------------------------------------------------------------------------- */

interface IconProps {
  className?: string
}

function ClinicalIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  )
}

function DiagnosticsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SupportIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" />
    </svg>
  )
}

const CATEGORY_ICONS: Record<ServiceCategory, React.ComponentType<IconProps>> = {
  clinical: ClinicalIcon,
  diagnostics: DiagnosticsIcon,
  support: SupportIcon,
}
