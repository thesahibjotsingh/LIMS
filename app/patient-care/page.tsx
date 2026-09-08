// app/patient-care/page.tsx
//
// Thin route. The listing itself is components/sections/ServiceIndex, shared with the
// other two category indexes — the only thing that differs between them is which
// category they pass, and duplicating the grid three times is how two menu items ended
// up pointing at the same page in the first place.

import type { Metadata } from 'next'
import { ServiceIndex } from '@/components/sections/ServiceIndex'
import { getCategory, servicesByCategory } from '@/lib/services'
import { siteConfig } from '@/lib/site-config'

export const revalidate = 3600

const category = getCategory('support')

export const metadata: Metadata = {
  title: category.pageTitle,
  description:
    `${servicesByCategory(category.id).length} ${category.pageTitle.toLowerCase()} at ` +
    `${siteConfig.name}, ${siteConfig.city}. ${category.blurb}`,
  alternates: { canonical: category.basePath },
}

export default function Page() {
  return <ServiceIndex category={category} eyebrow="Alongside your treatment" />
}
