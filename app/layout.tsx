// app/layout.tsx
// Root layout. Server component — no "use client" here or on any page, ever.
// Interactivity is pushed down to leaf components so the public site ships as close
// to zero JavaScript as Next.js allows.

import type { Metadata, Viewport } from 'next'
import { fontVariables } from '@/lib/fonts'
import {
  centresNav,
  contact,
  patientServicesNav,
  primaryLocation,
  primaryNav,
  siteConfig,
} from '@/lib/site-config'
import { EmergencyBar } from '@/components/sections/EmergencyBar'
import { SiteHeader } from '@/components/sections/SiteHeader'
import { SiteFooter } from '@/components/sections/SiteFooter'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}, ${siteConfig.city}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: siteConfig.name,
    title: `${siteConfig.name}, ${siteConfig.city}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },

  // Favicon set derived from public/images/lims-favicon.png (1254x1254 master).
  // The master itself is ~1 MB and is never served — public/icons/* are the trimmed,
  // resized derivatives. Regenerate them if the master changes; see README.
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    // iOS composites transparent icons onto black, which kills the teal — this one
    // is flattened onto white.
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0F5B66', // Primary Teal
  width: 'device-width',
  initialScale: 1,
  // Never set maximumScale or userScalable:false — blocking pinch-zoom breaks
  // WCAG 1.4.4 and is hostile to the low-vision users this site exists for.
}

/**
 * Organisation-level structured data. Phase 3 adds a Physician entity per doctor
 * profile; Phase 2 adds MedicalClinic per department.
 */
const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  slogan: siteConfig.tagline.join(' · '),
  address: {
    '@type': 'PostalAddress',
    streetAddress: primaryLocation.addressLines.join(', '),
    addressLocality: primaryLocation.city,
    addressRegion: primaryLocation.state,
    // Only emitted when LIMS has confirmed one. A guessed postal code in structured
    // data is worse than an absent field: search engines treat it as asserted fact.
    ...(primaryLocation.pincode ? { postalCode: primaryLocation.pincode } : {}),
    addressCountry: 'IN',
  },
  telephone: [contact.primary, contact.secondary],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        {/* First focusable element in the document (WCAG 2.4.1). */}
        <a href="#content" className="skip-link">
          Skip to main content
        </a>

        {/* Labels, not just numbers, come from config — the role split between the two
            published LIMS lines is still unconfirmed. See lib/site-config.ts. */}
        <EmergencyBar
          primaryNumber={contact.primary}
          primaryNumberDisplay={contact.primaryDisplay}
          primaryLabel="Emergency"
          secondaryNumber={contact.secondary}
          secondaryNumberDisplay={contact.secondaryDisplay}
          secondaryLabel="Appointments"
        />

        <SiteHeader
          nav={primaryNav}
          appointmentPhone={contact.secondary}
          name={siteConfig.name}
          city={siteConfig.city}
          tagline={siteConfig.tagline}
        />

        <main id="content" className="flex-1">
          {children}
        </main>

        <SiteFooter
          centres={centresNav}
          patientServices={patientServicesNav}
          primaryLocation={primaryLocation}
        />

        <script
          type="application/ld+json"
          // Static, developer-authored object — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
      </body>
    </html>
  )
}
