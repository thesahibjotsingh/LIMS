// app/sitemap.ts
// Generated from the same typed data every nav, card and link on the site already
// resolves through — a service or doctor route cannot exist here without also existing
// for real, and a new service or consultant is picked up with no second edit.
//
// Legacy /centres/[slug] forwards are deliberately excluded: they 308-redirect, and a
// sitemap listing a URL that immediately redirects elsewhere just makes a crawler do
// two requests for the one that matters.

import type { MetadataRoute } from 'next'
import { DOCTORS } from '@/lib/doctors'
import { SERVICES, serviceHref } from '@/lib/services'
import { siteConfig } from '@/lib/site-config'

const STATIC_ROUTES = [
  '/',
  '/about',
  '/appointments',
  '/centres',
  '/contact',
  '/doctors',
  '/health-library',
  '/health-packages',
  '/specialities',
  '/services',
  '/patient-care',
  '/patient-care/insurance',
  '/privacy',
  '/privacy/preferences',
  '/privacy/your-rights',
  '/privacy/grievance',
  '/terms',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const serviceRoutes = SERVICES.map((service) => serviceHref(service))
  const doctorRoutes = DOCTORS.map((doctor) => `/doctors/${doctor.id}`)

  return [...STATIC_ROUTES, ...serviceRoutes, ...doctorRoutes].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
  }))
}
