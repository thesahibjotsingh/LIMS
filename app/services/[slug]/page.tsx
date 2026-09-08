// app/services/[slug]/page.tsx
//
// Thin route. The page body is components/sections/ServiceDetail, shared with the other
// two category detail routes.
//
// NEXT.JS 15: `params` is a Promise and must be awaited.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceDetail } from '@/components/sections/ServiceDetail'
import { getCategory, getService, servicesByCategory } from '@/lib/services'
import { siteConfig } from '@/lib/site-config'

export const revalidate = 3600

const CATEGORY = 'diagnostics' as const

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return servicesByCategory(CATEGORY).map((service) => ({ slug: service.slug }))
}

/**
 * A service is only valid under its OWN category's prefix. Without this check
 * /services/urology would render the urology page under the wrong section — the same
 * page reachable at two URLs, which is the duplicate-destination problem this split
 * exists to remove, reintroduced one level down.
 */
function serviceInThisSection(slug: string) {
  const service = getService(slug)
  return service && service.category === CATEGORY ? service : undefined
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = serviceInThisSection(slug)

  if (!service) return { title: 'Service not found' }

  return {
    title: service.name,
    description: `${service.name} at ${siteConfig.name}, ${siteConfig.city}.`,
    alternates: { canonical: `${getCategory(CATEGORY).basePath}/${service.slug}` },
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const service = serviceInThisSection(slug)

  if (!service) notFound()

  return <ServiceDetail service={service} />
}
