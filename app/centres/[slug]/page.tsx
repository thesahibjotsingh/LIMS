// app/centres/[slug]/page.tsx
//
// Every service used to live at /centres/<slug>. They now live under the section they
// belong to — /specialities, /services or /patient-care — so this route exists only to
// forward the old URLs.
//
// It is a redirecting route rather than a list of rules in next.config.mjs on purpose.
// A config list would be a second copy of the slug-to-category mapping, and it would go
// stale the first time a service is recategorised; this reads the same lib/services
// data the new routes do, so the forward is correct by construction and there is
// nothing to keep in sync.
//
// 308, via permanentRedirect: the move is permanent, and 308 tells search engines to
// transfer ranking rather than treat this as a temporary detour. The preview deployment
// already has these URLs, so they must not simply start 404ing.
//
// Safe to delete once nothing links to /centres/* — inbound external links are the only
// reason to keep it, so give it a release or two.

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { SERVICES, getService, serviceHref } from '@/lib/services'

interface LegacyServicePageProps {
  params: Promise<{ slug: string }>
}

/** Pre-render the forward for every known slug so the redirect costs no cold start. */
export function generateStaticParams(): Array<{ slug: string }> {
  return SERVICES.map((service) => ({ slug: service.slug }))
}

// Never index a URL whose only job is to point somewhere else.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default async function LegacyServicePage({ params }: LegacyServicePageProps) {
  const { slug } = await params
  const service = getService(slug)

  // An unknown slug was a 404 before the move and stays one. Redirecting it to the
  // index instead would turn every typo into a soft 404 that reports success.
  if (!service) notFound()

  permanentRedirect(serviceHref(service))
}
