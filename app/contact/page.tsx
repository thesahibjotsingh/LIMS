// app/contact/page.tsx
//
// The destination "Contact Us" already pointed at from the header nav — the label has
// linked here since Phase 1 with no page behind it, and the nav's own overview row was
// deliberately withheld for exactly that reason (see the comment on primaryNav in
// lib/site-config.ts). Add the overview row back once this page ships; it is not done
// here so that one change does the linking and this file does the content.
//
// THE MAP LINK IS A SEARCH URL, NOT AN EMBED. Google Maps embeds need an API key and a
// billing account LIMS has not supplied — a `maps.google.com/search` link needs neither
// and still gets a patient to the right place from any phone. If LIMS ever provides
// exact coordinates or a Place ID, this can become a real embed without changing what
// the link promises.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { Grid } from '@/components/primitives/Grid'
import { contact, primaryLocation, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Contact us',
  description: `Address, phone numbers and directions for ${siteConfig.name}, ${siteConfig.city}.`,
}

export default function ContactPage() {
  const mapQuery = encodeURIComponent(
    [...primaryLocation.addressLines, primaryLocation.city, primaryLocation.state].join(', '),
  )
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  return (
    <Section labelledBy="contact-heading" id="locations">
      <p className="eyebrow">Contact us</p>
      <h1 id="contact-heading" className="mt-2 text-step-5">
        Get in touch
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />

      <Grid min="sm" gap="lg" className="mt-8">
        <div className="card-geo p-6">
          <h2 className="text-step-1">{primaryLocation.name}</h2>
          <address className="mt-3 not-italic text-step--1 leading-relaxed text-ink-600">
            {primaryLocation.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">
              {primaryLocation.city}, {primaryLocation.state}
            </span>
          </address>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent mt-4 inline-block"
          >
            Get directions
          </a>
        </div>

        <div className="card-geo p-6">
          <h2 className="text-step-1">Emergency</h2>
          <p className="mt-3 text-step--1 text-ink-600">
            For urgent medical attention, call the emergency line directly.
          </p>
          <a
            href={`tel:${contact.primary}`}
            className="btn-primary mt-4 inline-flex min-h-[48px] items-center px-5 font-semibold"
          >
            Call {contact.primaryDisplay}
          </a>
        </div>

        <div className="card-geo p-6">
          <h2 className="text-step-1">Appointments &amp; billing</h2>
          <p className="mt-3 text-step--1 text-ink-600">
            For appointments, general enquiries, insurance and billing questions.
          </p>
          <a
            href={`tel:${contact.secondary}`}
            className="btn-secondary mt-4 inline-flex min-h-[48px] items-center px-5 font-semibold"
          >
            Call {contact.secondaryDisplay}
          </a>
        </div>
      </Grid>
    </Section>
  )
}
