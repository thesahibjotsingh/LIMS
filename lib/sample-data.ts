// lib/sample-data.ts
//
// >>> PLACEHOLDER FIXTURE — NOT REAL PEOPLE, NOT REAL CREDENTIALS <<<
//
// These records exist so Phase 0 renders against realistically-shaped content. Indian
// doctor names and post-nominals run long ("Dr. Harpreet Kaur Sandhu, MBBS, MS (Ortho),
// MCh (Arthroplasty)") and designing against short placeholder names hides layout bugs
// that surface on day one of real content.
//
// Nothing here is a real doctor, a real registration number, or a real credential.
// Fabricated clinical credentials on a live hospital site are a genuine harm, so this
// module must be deleted the moment real data arrives — it is not a fallback.
//
// Replace in Phase 3 with the CMS or HIS-backed loader.

import type { Doctor } from '@/types'

export const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: 'placeholder-cardiology-1',
    name: 'Dr. [Placeholder Name]',
    qualifications: 'MBBS, MD (General Medicine), DM (Cardiology)',
    designation: 'Senior Consultant — Interventional Cardiology',
    departmentSlug: 'cardiac-sciences',
    experienceYears: 18,
    registrationNumber: 'TODO/HMC/0000',
    languages: ['Hindi', 'English', 'Punjabi', 'Haryanvi'],
    specialisations: [
      'Coronary angioplasty',
      'Structural heart disease',
      'Heart failure management',
    ],
    about:
      'Placeholder biography. Replace with copy supplied and approved by LIMS. Do not ' +
      'generate clinical claims, outcomes or credentials to fill this field.',
    education: [{ title: 'DM (Cardiology)', institution: '[Institution]', period: '[Year]' }],
    positionsHeld: [{ title: '[Position]', institution: '[Institution]', period: '[Years]' }],
    portrait: {
      // TODO: real portrait, <=200KB, AVIF/WebP, 4:5 crop.
      src: '/images/placeholder-doctor.jpg',
      alt: 'Portrait placeholder — replace with the doctor’s photograph',
      width: 400,
      height: 500,
    },
    opdSchedule: [
      {
        day: 'monday',
        startTime: '09:30',
        endTime: '13:00',
        locationId: 'hisar-main',
        note: 'By appointment only',
      },
      { day: 'wednesday', startTime: '09:30', endTime: '13:00', locationId: 'hisar-main' },
      { day: 'friday', startTime: '15:00', endTime: '18:00', locationId: 'hisar-main' },
    ],
    // Videos deliberately empty: the YouTubeFacade component lands in Phase 3, and a raw
    // iframe must never be used as an interim measure.
    videos: [],
    availability: { status: 'available-this-week', label: 'Available this week' },
  },
  {
    id: 'placeholder-orthopaedics-1',
    name: 'Dr. [Placeholder Name With A Deliberately Long Form]',
    qualifications: 'MBBS, MS (Orthopaedics), MCh (Arthroplasty), Fellowship in Joint Replacement',
    designation: 'Director — Orthopaedics & Joint Replacement',
    departmentSlug: 'orthopaedics',
    experienceYears: 24,
    registrationNumber: 'TODO/HMC/0000',
    languages: ['Hindi', 'English', 'Haryanvi'],
    specialisations: ['Total knee replacement', 'Hip arthroplasty', 'Sports injuries'],
    about: 'Placeholder biography. Replace with LIMS-approved copy.',
    education: [{ title: 'MS (Orthopaedics)', institution: '[Institution]', period: '[Year]' }],
    positionsHeld: [],
    portrait: {
      src: '/images/placeholder-doctor.jpg',
      alt: 'Portrait placeholder — replace with the doctor’s photograph',
      width: 400,
      height: 500,
    },
    opdSchedule: [
      { day: 'tuesday', startTime: '10:00', endTime: '14:00', locationId: 'hisar-main' },
      { day: 'thursday', startTime: '10:00', endTime: '14:00', locationId: 'hisar-main' },
    ],
    videos: [],
    availability: { status: 'available-today', label: 'Available today' },
  },
]

export function getSampleDoctor(id: string): Doctor | undefined {
  return SAMPLE_DOCTORS.find((doctor) => doctor.id === id)
}
