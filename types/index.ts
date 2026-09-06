// types/index.ts
// The data contract for the LIMS platform. Every component takes data through props
// shaped by these types — presentational components never fetch, which is what keeps
// them previewable in isolation and reusable across 30+ department pages.
//
// PRIVACY BOUNDARY: nothing in this file is personal data about a *patient*. Doctor
// records are professional/public information. Patient types arrive in Phase 6 and
// live in a separate module under an explicit PHI boundary — never mixed in here.

/** ISO-8601 date string, e.g. "2026-09-06". */
export type IsoDate = string

/** 24-hour clock, e.g. "09:30". */
export type ClockTime = string

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/* -------------------------------------------------------------------------- */
/* Locations                                                                   */
/* -------------------------------------------------------------------------- */

export interface Location {
  id: string
  name: string
  addressLines: string[]
  city: string
  state: string
  /** Optional: LIMS's published contact details do not include a PIN code, and a
   *  guessed postal code on a hospital's structured data is worse than none. */
  pincode?: string
  /** E.164 where possible, e.g. "+911662000000" — used for tel: links. */
  phone: string
  mapsUrl?: string
}

/* -------------------------------------------------------------------------- */
/* Departments / Centres of Excellence                                         */
/* -------------------------------------------------------------------------- */

export interface Department {
  /** URL segment for app/centres/[slug] */
  slug: string
  name: string
  /** One-line summary used on tiles and in meta descriptions. */
  summary: string
  /** Long-form overview, markdown or rich text depending on the CMS decision. */
  overview: string
  conditionsTreated: string[]
  proceduresOffered: string[]
  /** Doctor ids — resolved server-side, not embedded, so a doctor edit is one write. */
  doctorIds: string[]
  faqs: Faq[]
  heroImage?: ImageAsset
}

export interface Faq {
  question: string
  answer: string
}

/* -------------------------------------------------------------------------- */
/* Doctors                                                                     */
/* -------------------------------------------------------------------------- */

export interface Doctor {
  /** URL segment for app/doctors/[id] */
  id: string
  /** Full display name including salutation, e.g. "Dr. Harpreet Kaur Sandhu". */
  name: string
  /** Post-nominals as one string — these run long in India and must not be truncated. */
  qualifications: string
  designation: string
  departmentSlug: string
  /** Years in practice. Rendered as "18 years experience". */
  experienceYears: number
  /** State medical council registration. Public information, and a trust signal. */
  registrationNumber?: string
  languages: string[]
  specialisations: string[]
  about: string
  education: CredentialEntry[]
  positionsHeld: CredentialEntry[]
  publications?: string[]
  memberships?: string[]
  portrait: ImageAsset
  opdSchedule: OpdSession[]
  videos: DoctorVideo[]
  availability: Availability
}

export interface CredentialEntry {
  title: string
  institution: string
  /** e.g. "2011" or "2014 - 2019". Free text: real credentials are irregular. */
  period?: string
}

export interface OpdSession {
  day: Weekday
  startTime: ClockTime
  endTime: ClockTime
  locationId: string
  /** e.g. "By appointment only". */
  note?: string
}

/**
 * Availability is rendered as a coloured dot AND the label text.
 * Colour alone would be invisible to colour-blind users (WCAG 1.4.1), so the
 * label is required, not optional.
 */
export interface Availability {
  status: 'available-today' | 'available-this-week' | 'on-leave' | 'by-appointment'
  label: string
}

/**
 * A raw <iframe> from youtube.com loads 500KB-1.5MB and sets third-party cookies on
 * page load, before the patient clicks anything or consents. On a profile with three
 * videos that alone breaks the LCP budget and creates a DPDP problem.
 * The platform renders a poster + play button and only injects the youtube-nocookie
 * iframe on click, behind media consent. See components/patterns/YouTubeFacade (Phase 3).
 */
export interface DoctorVideo {
  /** YouTube video id only — never a full embed URL. */
  youtubeId: string
  title: string
  /** Required: clinical information must not exist only inside a video (WCAG 1.2.2). */
  summary: string
  durationSeconds?: number
}

/* -------------------------------------------------------------------------- */
/* Services and health packages                                                */
/* -------------------------------------------------------------------------- */

export interface Service {
  slug: string
  name: string
  summary: string
  departmentSlug?: string
}

export interface HealthPackage {
  slug: string
  name: string
  summary: string
  /** Integer paise or rupees — decided with finance before Phase 4. Never a float. */
  priceInRupees: number
  includedTests: string[]
  recommendedFor: string
  fastingRequired: boolean
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

export interface ImageAsset {
  src: string
  /** Meaningful alt text. Empty string is valid ONLY for decorative images. */
  alt: string
  width: number
  height: number
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
