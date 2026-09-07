// lib/doctors.ts
//
// The LIMS consultant roster. REAL PEOPLE, REAL REGISTRATION NUMBERS.
//
// Rules for this file, in order of importance:
//
//  1. Never add a field LIMS has not supplied. No invented years of experience, no
//     invented OPD timings, no invented biography, no invented languages. A missing
//     field renders as a missing section — the UI is built for that. A guessed field
//     renders as a fact about a named doctor's credentials, which is a real harm and,
//     for a registration number or a qualification, arguably a legal one.
//
//  2. Registration numbers are stored verbatim as issued, including the council
//     prefix. They are the field a patient uses to verify a doctor against the
//     council register, so a "tidied" number is a broken number.
//
//  3. `departmentSlug` must resolve against lib/services.ts. A doctor filed under a
//     slug that does not exist there disappears from the department page silently,
//     which is why assertDoctorDepartments() below runs at module load.
//
// Phase 3 moves this behind the CMS or HIS loader. The shape stays the same.

import { getService } from '@/lib/services'
import type { Doctor } from '@/types'

export const DOCTORS: Doctor[] = [
  {
    id: 'udit-choudhary',
    name: 'Dr. Udit Choudhary',
    // Supplied as "Consultant, Dept. of Emergency Medicine & Critical Care". LIMS's
    // service list names the department "Emergency Services"; the fuller wording is
    // kept here as the designation rather than discarded.
    designation: 'Consultant — Emergency Medicine & Critical Care',
    departmentSlug: 'emergency-services',
    registrationNumber: 'RMC: 48421',
  },
  {
    id: 'shweta-godara',
    name: 'Dr. Shweta Godara',
    // TODO: supplied as "MS (Obs & Gyane)"; expanded to the standard form. Confirm.
    qualifications: 'MS (Obstetrics & Gynaecology)',
    departmentSlug: 'obstetrics-gynaecology',
    registrationNumber: 'HN-31657',
  },
  {
    id: 'vikash-raj',
    name: 'Dr. Vikash Raj',
    qualifications: 'MS, General Surgery',
    departmentSlug: 'general-laparoscopic-surgery',
    registrationNumber: 'UPMC Reg. No. 123298',
  },
  {
    id: 'harshal-godara',
    name: 'Dr. Harshal Godara',
    qualifications: 'M.S. (Orthopedic)',
    departmentSlug: 'ortho-joint-replacement',
    registrationNumber: 'HN-31573',
  },
]

/**
 * Fails the build if a doctor is filed under a service slug that does not exist.
 *
 * Without this, renaming a slug in lib/services.ts drops that doctor off the department
 * page and out of the directory grouping with no error anywhere — the page just renders
 * one card short. On a roster this small that is easy to miss and hard to notice later.
 */
function assertDoctorDepartments(): void {
  const orphans = DOCTORS.filter((doctor) => !getService(doctor.departmentSlug))
  if (orphans.length > 0) {
    throw new Error(
      'lib/doctors.ts: unknown departmentSlug for ' +
        orphans.map((doctor) => `${doctor.name} (${doctor.departmentSlug})`).join(', ') +
        '. Every departmentSlug must exist in lib/services.ts.',
    )
  }
}

assertDoctorDepartments()

export function getDoctor(id: string): Doctor | undefined {
  return DOCTORS.find((doctor) => doctor.id === id)
}

export function getDoctorsByDepartment(slug: string): Doctor[] {
  return DOCTORS.filter((doctor) => doctor.departmentSlug === slug)
}

/** Service slugs that currently have at least one named consultant. */
export function departmentsWithDoctors(): string[] {
  return Array.from(new Set(DOCTORS.map((doctor) => doctor.departmentSlug)))
}

/**
 * Display form of a registration number.
 *
 * The stored value is verbatim as issued, because that is what a patient matches
 * against the council register. But LIMS supplies them inconsistently — "RMC: 48421"
 * carries a colon, "UPMC Reg. No. 123298" carries its own label — and rendering a
 * "Reg. no." label in front of that produces "Reg. no. UPMC Reg. No. 123298".
 *
 * This strips only the redundant label and separating punctuation. It never touches the
 * council prefix or the digits, so the rendered string still matches the register.
 */
export function registrationDisplay(value: string): string {
  return value
    .replace(/\s*Reg(?:istration)?\.?\s*No\.?\s*/i, ' ')
    .replace(/\s*:\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
