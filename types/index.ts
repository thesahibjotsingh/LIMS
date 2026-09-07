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
  /**
   * E.164 ONLY, e.g. "+919254984121". This value goes straight into a tel: href, and
   * spaces are not valid in a tel: URI — a display-formatted number here produces
   * "tel:+91 92549 84121", which some dialers refuse.
   */
  phone: string
  /** Human-formatted for display, e.g. "+91 92549 84121". Falls back to phone. */
  phoneDisplay?: string
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

/**
 * A consultant on the LIMS roster.
 *
 * Only `id`, `name` and `departmentSlug` are required. Everything else is optional
 * because LIMS supplies the roster in stages: names, qualifications and registration
 * numbers first, then portraits, OPD timings and biographies.
 *
 * The alternative — required fields filled with plausible defaults — is how invented
 * years of experience and invented OPD timings end up on a live hospital site. An
 * absent field renders as an absent section; it never renders as a guess.
 */
export interface Doctor {
  /** URL segment for app/doctors/[id] */
  id: string
  /** Full display name including salutation, e.g. "Dr. Harpreet Kaur Sandhu". */
  name: string
  departmentSlug: string
  /** Post-nominals as one string — these run long in India and must not be truncated. */
  qualifications?: string
  designation?: string
  /** Years in practice. Rendered as "18 years experience". */
  experienceYears?: number
  /** Medical council registration, verbatim as issued. Public information, and a trust signal. */
  registrationNumber?: string
  languages?: string[]
  specialisations?: string[]
  about?: string
  education?: CredentialEntry[]
  positionsHeld?: CredentialEntry[]
  publications?: string[]
  memberships?: string[]
  portrait?: ImageAsset
  opdSchedule?: OpdSession[]
  videos?: DoctorVideo[]
  availability?: Availability
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
  /**
   * Label for the "see everything" row at the foot of a dropdown, e.g.
   * "All specialities". Omit it and no such row renders — which is the right call when
   * `href` points at a page that has not shipped yet, since an overview row pointing at
   * a 404 is just one more dead link inside a menu.
   */
  overviewLabel?: string
}
