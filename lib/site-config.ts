// lib/site-config.ts
//
// Single source of truth for navigation, contact details and locations.
//
// Contact details below are REAL, transcribed from the official LIMS card:
//   Jindal Chowk, Hisar · 9254984121, 9254984122 · www.limshisar.com
//
// What is still an assumption is which number serves which purpose — the card lists
// both numbers without roles. See the note on `contact` before launch.
//
// From Phase 2 this is likely to move behind a CMS. Keeping it in one typed module now
// means that migration touches one file, not thirty components.

import type { Location, NavItem } from '@/types'

export const siteConfig = {
  name: 'Lifeline Institute of Medical Sciences',
  shortName: 'LIMS',
  city: 'Hisar',
  /** The official tagline, as printed on LIMS stationery. */
  tagline: ['Compassion', 'Excellence', 'Care'] as const,
  description:
    'Multi-speciality hospital at Jindal Chowk, Hisar, Haryana — Centres of Excellence ' +
    'in cardiac sciences, orthopaedics, neurosciences and more.',
  url: 'https://www.limshisar.com',
  urlDisplay: 'www.limshisar.com',
} as const

/**
 * The two published LIMS numbers.
 *
 * >>> ROLE ASSIGNMENT IS AN ASSUMPTION — CONFIRM WITH LIMS BEFORE LAUNCH <<<
 *
 * The card prints both numbers with no labels. `primary` is surfaced in the top bar
 * as the emergency line and `secondary` as the appointments line, because that is the
 * conventional split and someone in distress needs *a* number above the fold. But if
 * either line is in fact a reception desk that closes at night, the top bar is telling
 * a patient to call a phone nobody answers — which on a hospital site is a safety
 * problem, not a copy problem.
 *
 * Three things to confirm with LIMS:
 *   1. Which of the two numbers is answered in an emergency.
 *   2. Whether either line is genuinely 24x7 (no "24x7" claim is made anywhere in the
 *      UI until this is confirmed).
 *   3. Whether there is a separate ambulance number. The top bar has a slot for one
 *      and currently renders without it rather than pointing at a guess.
 */
export const contact = {
  primary: '+919254984121',
  primaryDisplay: '+91 92549 84121',
  secondary: '+919254984122',
  secondaryDisplay: '+91 92549 84122',
  /** TODO: dedicated ambulance line, if LIMS operates one. */
  ambulance: undefined as string | undefined,
  ambulanceDisplay: undefined as string | undefined,
} as const

export const primaryLocation: Location = {
  id: 'hisar-main',
  name: 'LIMS Hisar',
  addressLines: ['Jindal Chowk'],
  city: 'Hisar',
  state: 'Haryana',
  // pincode deliberately omitted — not on the official card, and inventing one puts a
  // wrong postal code into the site's structured data.
  phone: contact.primaryDisplay,
}

/**
 * Primary navigation. Phase 1 turns "Centres of Excellence" into a mega-menu once the
 * real Centre list is confirmed — at more than ~8 entries a flat dropdown stops working.
 */
export const primaryNav: NavItem[] = [
  { label: 'Centres of Excellence', href: '/centres' },
  { label: 'Find a doctor', href: '/doctors' },
  { label: 'Health packages', href: '/health-packages' },
  { label: 'Patient care', href: '/patient-care' },
  { label: 'Health library', href: '/health-library' },
  { label: 'About LIMS', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/** TODO: replace with the real Centres, in the order LIMS wants them ranked. */
export const centresNav: NavItem[] = [
  { label: 'Cardiac Sciences', href: '/centres/cardiac-sciences' },
  { label: 'Orthopaedics & Joint Replacement', href: '/centres/orthopaedics' },
  { label: 'Neurosciences', href: '/centres/neurosciences' },
  { label: 'Mother & Child Care', href: '/centres/mother-and-child' },
  { label: 'Nephrology & Urology', href: '/centres/nephrology-urology' },
  { label: 'Critical Care', href: '/centres/critical-care' },
]

export const patientServicesNav: NavItem[] = [
  { label: 'Book an appointment', href: '/appointments' },
  { label: 'Health check packages', href: '/health-packages' },
  { label: 'Visitor information', href: '/patient-care/visitors' },
  { label: 'Insurance & billing', href: '/patient-care/insurance' },
  { label: 'Locations & directions', href: '/contact#locations' },
  { label: 'Patient portal', href: '/portal' }, // ships in Phase 6
]
