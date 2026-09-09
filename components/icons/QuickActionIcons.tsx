// components/icons/QuickActionIcons.tsx
//
// The four home-page Quick actions tiles. Same 32x32/1.75-stroke/copper-accent grammar
// as components/icons/DepartmentIcons.tsx — see icon-base.ts for the shared constants
// and DepartmentIcons.tsx for the full rationale (simple pictograms, not illustration).

import type { SVGProps } from 'react'
import { iconAccentFill as accentFill, iconBase as base, iconStroke as stroke } from './icon-base'

type IconProps = SVGProps<SVGSVGElement>

export function BookAppointmentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="7" width="20" height="18" rx="2.5" {...stroke} className="text-teal-800" />
      <path d="M6 12h20" {...stroke} className="text-teal-800" />
      <path d="M11 5v4M21 5v4" {...stroke} className="text-teal-800" />
      <path d="M11.5 17.5l2.5 2.5 5-5.5" stroke={accentFill} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FindDoctorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="13" cy="12" r="5.5" {...stroke} className="text-teal-800" />
      <path d="M22 22l-4.8-4.8" {...stroke} className="text-teal-800" />
      <path d="M13 9v6M10 12h6" stroke={accentFill} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

export function HealthPackagesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M16 6c-2.5 0-3.6 1.6-5.4 1.6-1.7 0-2.6-1-2.6 2 0 3.2 1.6 12.4 3.6 12.4 1.7 0 1.8-5.2 4.4-5.2s2.7 5.2 4.4 5.2c2 0 3.6-9.2 3.6-12.4 0-3-.9-2-2.6-2C19.6 7.6 18.5 6 16 6z"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M16 12v5M13.5 14.5h5" stroke={accentFill} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

export function LocationsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M16 26s8-8.6 8-14.4A8 8 0 0 0 8 11.6C8 17.4 16 26 16 26z"
        {...stroke}
        className="text-teal-800"
      />
      <circle cx="16" cy="11.5" r="3" fill={accentFill} />
    </svg>
  )
}
