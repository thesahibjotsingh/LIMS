// app/appointments/page.tsx
//
// The destination every "Book appointment" button on the site points at — the header
// CTA on every page, the hero, every doctor profile's "Request an appointment". Until
// this page existed, all of those were dead ends.
//
// STATIC, NOT DYNAMIC. Unlike /doctors, this page reads no searchParams and its content
// (the department/doctor option lists) changes only when the roster or catalogue does —
// so it prerenders like any other page instead of paying the per-request cost /doctors
// accepts for shareable filtered URLs. The form itself is the one dynamic thing on the
// page, and it lives entirely in the client leaf AppointmentForm; this file stays a
// server component.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'
import { AppointmentForm } from '@/components/sections/AppointmentForm'
import { DOCTORS } from '@/lib/doctors'
import { SERVICE_CATEGORIES, servicesByCategory } from '@/lib/services'
import { contact } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Book an appointment',
  description:
    'Request an appointment at Lifeline Institute of Medical Sciences, Hisar. Leave ' +
    'your details and our team will call you to confirm a time.',
}

export default function AppointmentsPage() {
  const servicesByCategoryMap = Object.fromEntries(
    SERVICE_CATEGORIES.map((category) => [category.id, servicesByCategory(category.id)]),
  )

  // Computed per-request (this page is otherwise static, but this one value cannot be
  // baked in at build time) so the date field's `min` never lags behind an ISR-stale
  // build — a "preferred date" that quietly accepts yesterday because the page was
  // built two days ago is exactly the kind of drift a hospital form cannot afford.
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <Section labelledBy="appointments-heading">
      <p className="eyebrow">Appointments</p>
      <h1 id="appointments-heading" className="mt-2 text-step-5">
        Book an appointment
      </h1>
      <span className="rule-accent-lg mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step-1 text-ink-950">
        Leave your details below and our appointments team will call you back to confirm
        a time. Prefer to talk now?{' '}
        <a href={`tel:${contact.secondary}`} className="link-accent">
          Call {contact.secondaryDisplay}
        </a>
        .
      </p>

      <div className="mt-10">
        <AppointmentForm
          categories={SERVICE_CATEGORIES}
          servicesByCategory={servicesByCategoryMap}
          doctors={DOCTORS}
          todayIso={todayIso}
        />
      </div>
    </Section>
  )
}
