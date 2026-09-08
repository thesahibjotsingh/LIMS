// lib/search-index.ts
//
// Everything the site search can find, built from the same data the pages render from.
//
// DERIVED, NOT HAND-WRITTEN. A search index maintained by hand is a second copy of the
// site that goes stale silently — a renamed department keeps its old title in search, a
// deleted one stays findable, and nobody notices because search results are the one
// place nobody checks. Every entry here comes from lib/services.ts or lib/doctors.ts, so
// a rename anywhere is a rename in search too.
//
// NOTHING UNROUTABLE IS INDEXED. Health packages, Health library, About and Contact are
// in the nav but have no pages yet. They are declared below and excluded by `available`,
// because a search result is a promise that there is something at the other end — and a
// patient who searches "health package", clicks the result and lands on a 404 has been
// told the hospital does not offer it. Flip the flag when the route ships.

import { DOCTORS, registrationDisplay } from '@/lib/doctors'
import { SERVICES, getCategory, serviceHref, serviceName } from '@/lib/services'

/** What kind of thing a result is. Rendered as a label beside each hit. */
export type SearchKind = 'Speciality' | 'Diagnostics' | 'Patient care' | 'Doctor' | 'Section'

export interface SearchEntry {
  id: string
  title: string
  /** One line of context — a department for a doctor, a category for a service. */
  subtitle?: string
  href: string
  kind: SearchKind
  /**
   * Extra terms that should match but are not shown: alternative service names, a
   * doctor's qualifications, a registration number. Someone holding a referral slip
   * types what is printed on it, not what we chose to call the page.
   */
  keywords: string[]
}

const KIND_BY_CATEGORY = {
  clinical: 'Speciality',
  diagnostics: 'Diagnostics',
  support: 'Patient care',
} as const

/** Landing pages worth finding in their own right. Only routes that exist. */
const SECTIONS: SearchEntry[] = [
  {
    id: 'section-doctors',
    title: 'Find a doctor',
    subtitle: 'All consultants',
    href: '/doctors',
    kind: 'Section',
    keywords: ['doctor', 'consultant', 'physician', 'surgeon', 'specialist'],
  },
  {
    id: 'section-centres',
    title: 'Centres of Excellence',
    subtitle: `All ${SERVICES.length} services`,
    href: '/centres',
    kind: 'Section',
    keywords: ['services', 'departments', 'centres', 'centers'],
  },
  {
    id: 'section-specialities',
    title: 'Specialities',
    subtitle: 'Clinical departments',
    href: '/specialities',
    kind: 'Section',
    keywords: ['specialities', 'specialties', 'departments'],
  },
  {
    id: 'section-services',
    title: 'Diagnostics & imaging',
    subtitle: 'Tests and scans',
    href: '/services',
    kind: 'Section',
    keywords: ['diagnostics', 'imaging', 'tests', 'scans', 'lab'],
  },
  {
    id: 'section-patient-care',
    title: 'Patient care',
    subtitle: 'Support services',
    href: '/patient-care',
    kind: 'Section',
    keywords: ['patient care', 'support'],
  },
]

/**
 * Declared but not yet indexed. Kept here rather than deleted so the gap is visible:
 * when the route ships, move the entry into SECTIONS and it becomes searchable.
 */
export const PENDING_SECTIONS: Array<{ title: string; href: string }> = [
  { title: 'Health packages', href: '/health-packages' },
  { title: 'Health library', href: '/health-library' },
  { title: 'About LIMS', href: '/about' },
  { title: 'Contact', href: '/contact' },
  { title: 'Book an appointment', href: '/appointments' },
]

const SERVICE_ENTRIES: SearchEntry[] = SERVICES.map((service) => ({
  id: `service-${service.slug}`,
  title: service.name,
  subtitle: getCategory(service.category).pageTitle,
  href: serviceHref(service),
  kind: KIND_BY_CATEGORY[service.category],
  keywords: service.alsoKnownAs ?? [],
}))

const DOCTOR_ENTRIES: SearchEntry[] = DOCTORS.map((doctor) => ({
  id: `doctor-${doctor.id}`,
  title: doctor.name,
  subtitle: [doctor.qualifications, serviceName(doctor.departmentSlug)]
    .filter(Boolean)
    .join(' · '),
  href: `/doctors/${doctor.id}`,
  kind: 'Doctor',
  keywords: [
    doctor.designation,
    doctor.qualifications,
    serviceName(doctor.departmentSlug),
    doctor.registrationNumber && registrationDisplay(doctor.registrationNumber),
  ].filter((value): value is string => Boolean(value)),
}))

export const SEARCH_INDEX: SearchEntry[] = [
  ...SERVICE_ENTRIES,
  ...DOCTOR_ENTRIES,
  ...SECTIONS,
]

const normalise = (value: string) => value.toLowerCase().trim()

/**
 * Rank a single entry against a query. Higher is better; 0 means no match.
 *
 * The tiers exist because substring matching alone puts results in data order, which
 * is arbitrary to the person typing: searching "ortho" would surface a doctor whose
 * department happens to contain the word above the department itself. A title that
 * STARTS with the query is almost always what was meant.
 */
function score(entry: SearchEntry, query: string): number {
  const title = normalise(entry.title)
  if (title === query) return 100
  if (title.startsWith(query)) return 80

  // A word inside the title, e.g. "joint" finding "Ortho & Joint Replacement".
  if (title.includes(query)) return 60

  if (entry.subtitle && normalise(entry.subtitle).includes(query)) return 40
  if (entry.keywords.some((keyword) => normalise(keyword).includes(query))) return 20

  return 0
}

/**
 * Search everything.
 *
 * Deliberately not fuzzy. On an index this size typo tolerance matches almost
 * everything, and on a hospital site the wrong result is worse than none: "no results"
 * is a state a patient can act on, a wrong department is a wasted journey.
 *
 * An empty query returns nothing rather than the whole index — an overlay that opens
 * showing 35 rows is a menu, not a search.
 */
export function searchSite(query: string, limit = 8): SearchEntry[] {
  const needle = normalise(query)
  if (!needle) return []

  return SEARCH_INDEX.map((entry) => ({ entry, rank: score(entry, needle) }))
    .filter((hit) => hit.rank > 0)
    .sort((a, b) => b.rank - a.rank || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((hit) => hit.entry)
}
