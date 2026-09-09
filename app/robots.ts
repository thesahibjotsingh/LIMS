// app/robots.ts
// Nothing on this platform needs to be hidden from a crawler — there is no staging
// content, no user-generated area, and no personal data behind a public route (see the
// privacy boundary note in types/index.ts). /api is excluded because it serves the
// appointment and callback form handlers, not pages.

import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
