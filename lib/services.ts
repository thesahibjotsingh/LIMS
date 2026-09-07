// lib/services.ts
//
// The clinical services LIMS actively offers, as supplied by the hospital.
//
// This is the spine of the site's information architecture: the header nav, the home
// page grid, the footer, /centres, /centres/[slug] and the doctor roster all resolve
// against it. One list, one slug per service, so a rename is one edit.
//
// TWO THINGS HERE ARE MINE, NOT LIMS'S, AND NEED CONFIRMING:
//
//   1. `category`. LIMS supplied 26 items as a flat list. Presenting 26 undifferentiated
//      tiles asks a patient to tell "Neurosurgery" apart from "Color Doppler" on their
//      own, which they cannot — one is a department you are referred to, the other is a
//      test you are sent for. The three-way split below is an editorial judgement about
//      how patients navigate, not a statement about how LIMS is organised internally.
//
//   2. `name`. Names are verbatim as supplied, including the "Pediatrics" spelling,
//      which differs from the British spelling used elsewhere on the site. Parenthetical
//      alternatives were moved to `alsoKnownAs` so they can be searched in Phase 3
//      without cluttering a tile.
//
// What is NOT here, deliberately: no overview, no conditions treated, no procedures
// offered, no facilities. Those are clinical claims about what a hospital can do, and
// they come from LIMS or they do not exist. See app/centres/[slug]/page.tsx.

export type ServiceCategory = 'clinical' | 'diagnostics' | 'support'

export interface ClinicalService {
  slug: string
  name: string
  category: ServiceCategory
  /** Alternative names, for search in Phase 3. Never rendered as the title. */
  alsoKnownAs?: string[]
}

export const SERVICE_CATEGORIES: Array<{
  id: ServiceCategory
  name: string
  /** One line telling a patient what this group of services is for. */
  blurb: string
}> = [
  {
    id: 'clinical',
    name: 'Clinical departments',
    blurb: 'Specialist teams you consult, are referred to, or are admitted under.',
  },
  {
    id: 'diagnostics',
    name: 'Diagnostics & imaging',
    blurb: 'Tests and scans, usually on a referral from a doctor.',
  },
  {
    id: 'support',
    name: 'Patient support services',
    blurb: 'Services that run alongside your treatment.',
  },
]

export const SERVICES: ClinicalService[] = [
  // ---- Clinical departments -------------------------------------------------
  { slug: 'emergency-services', name: 'Emergency Services', category: 'clinical' },
  { slug: 'general-medicine', name: 'General Medicine', category: 'clinical' },
  {
    slug: 'ortho-joint-replacement',
    name: 'Ortho & Joint Replacement',
    category: 'clinical',
    alsoKnownAs: ['Orthopedics', 'Polytrauma'],
  },
  {
    slug: 'obstetrics-gynaecology',
    name: 'Obstetrics & Gynaecology',
    category: 'clinical',
    alsoKnownAs: ['Obs and Gynae'],
  },
  {
    slug: 'paediatrics-neonatology',
    name: 'Pediatrics & Neonatology',
    category: 'clinical',
  },
  { slug: 'neurosurgery', name: 'Neurosurgery', category: 'clinical' },
  { slug: 'gastroenterology', name: 'Gastroenterology', category: 'clinical' },
  { slug: 'urology', name: 'Urology', category: 'clinical' },
  { slug: 'spine-surgery', name: 'Spine Surgery', category: 'clinical' },
  { slug: 'ophthalmology', name: 'Ophthalmology', category: 'clinical' },
  {
    slug: 'ent',
    name: 'ENT',
    category: 'clinical',
    alsoKnownAs: ['Ear Nose Throat'],
  },
  {
    slug: 'dentistry',
    name: 'Dentistry',
    category: 'clinical',
    alsoKnownAs: ['Dental', 'Oromaxillary Surgery'],
  },
  {
    slug: 'anaesthesia-pain-management',
    name: 'Anaesthesia & Pain Management',
    category: 'clinical',
  },
  {
    slug: 'general-laparoscopic-surgery',
    name: 'General & Laparoscopic Surgery',
    category: 'clinical',
    alsoKnownAs: ['Gen. Surgery'],
  },
  { slug: 'trauma-management', name: 'Trauma Management', category: 'clinical' },

  // ---- Diagnostics & imaging ------------------------------------------------
  { slug: 'endoscopy', name: 'Endoscopy', category: 'diagnostics' },
  { slug: 'radiology-imaging', name: 'Radiology & Imaging', category: 'diagnostics' },
  { slug: 'ct-scan-x-ray', name: 'CT Scan / X-Ray', category: 'diagnostics' },
  {
    slug: 'ultrasound',
    name: 'Ultrasound',
    category: 'diagnostics',
    alsoKnownAs: ['USG'],
  },
  { slug: 'color-doppler', name: 'Color Doppler', category: 'diagnostics' },
  {
    slug: 'echocardiogram-tmt',
    name: 'Echocardiogram / TMT',
    category: 'diagnostics',
  },
  {
    slug: 'pathology-microbiology',
    name: 'Pathology & Microbiology',
    category: 'diagnostics',
  },

  // ---- Patient support ------------------------------------------------------
  {
    slug: 'physiotherapy-rehabilitation',
    name: 'Physiotherapy & Rehabilitation',
    category: 'support',
  },
  { slug: 'dietetics-nutrition', name: 'Dietetics & Nutrition', category: 'support' },
  { slug: 'pharmacy', name: 'Pharmacy', category: 'support' },
  { slug: 'ambulance', name: 'Ambulance', category: 'support' },
]

export function getService(slug: string): ClinicalService | undefined {
  return SERVICES.find((service) => service.slug === slug)
}

export function servicesByCategory(category: ServiceCategory): ClinicalService[] {
  return SERVICES.filter((service) => service.category === category)
}

/** Display name for a slug; falls back to the slug so nothing ever renders blank. */
export function serviceName(slug: string): string {
  return getService(slug)?.name ?? slug.replace(/-/g, ' ')
}
