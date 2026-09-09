// components/icons/DepartmentIcons.tsx
//
// One icon per clinical department, plus the four home-page "Quick actions". Same
// visual grammar throughout: a teal-800 line-art outline with ONE copper-500 accent
// shape marking the part of the pictogram that actually identifies the department —
// inspired by the two-tone outline-plus-highlight language on hospital sites like
// Medanta's, built from scratch for LIMS's own palette rather than traced from theirs.
//
// SIMPLE SYMBOLS, NOT ANATOMICAL ILLUSTRATION. A detailed, medically accurate organ
// illustration is hard to hand-author well in raw SVG path data and easy to get subtly
// wrong in a way that reads as sloppy rather than confident. Every icon here is a
// familiar, recognisable pictogram instead — a stethoscope, a tooth, an eye — the same
// choice most hospital icon sets actually make once you look closely at them.
//
// 32x32 VIEWBOX, 1.75 STROKE, THROUGHOUT. One canvas size and one stroke weight for
// every icon in the set is what makes 15 unrelated pictograms read as one family
// instead of fifteen icons from fifteen different sources.
//
// aria-hidden ON EVERY ICON. Each one sits directly beside its own text label (the
// department name), so the icon is decoration confirming what the label already says,
// never the only carrier of the information — the same WCAG 1.1.1 reasoning already
// applied to every other icon on this site.

import type { SVGProps } from 'react'
import { iconAccentFill as accentFill, iconBase as base, iconStroke as stroke } from './icon-base'

type IconProps = SVGProps<SVGSVGElement>

export function EmergencyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="16" cy="16" r="12.5" {...stroke} className="text-teal-800" />
      <path
        d="M16 10v5h5v2h-5v5h-2v-5h-5v-2h5v-5z"
        fill={accentFill}
      />
    </svg>
  )
}

export function GeneralMedicineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M10 5v9a5 5 0 0 0 10 0V5"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M10 5H8M20 5h-2" {...stroke} className="text-teal-800" />
      <path d="M20 14v3a6 6 0 0 1-12 0" {...stroke} className="text-teal-800" />
      <circle cx="24" cy="14" r="3" {...stroke} className="text-teal-800" />
      <circle cx="24" cy="14" r="1.3" fill={accentFill} />
    </svg>
  )
}

export function OrthoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M9 20 20 9"
        {...stroke}
        className="text-teal-800"
      />
      <circle cx="9" cy="20" r="3.4" {...stroke} className="text-teal-800" />
      <circle cx="20" cy="9" r="3.4" {...stroke} className="text-teal-800" />
      <path d="M13 16.5a2.2 2.2 0 0 1 3 0l0 0a2.2 2.2 0 0 1 0 3" fill={accentFill} stroke="none" />
    </svg>
  )
}

export function ObstetricsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M16 25s-8-5.2-8-11.4A5.1 5.1 0 0 1 16 10a5.1 5.1 0 0 1 8 3.6C24 19.8 16 25 16 25z"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M13.2 15h2l0.9-1.8 1 3.6 0.9-1.8h1.8" {...stroke} stroke={accentFill} />
    </svg>
  )
}

export function PaediatricsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="16" cy="10" r="4.5" {...stroke} className="text-teal-800" />
      <path
        d="M9 25c0-4.5 3-8 7-8s7 3.5 7 8"
        {...stroke}
        className="text-teal-800"
      />
      <circle cx="16" cy="10" r="1.4" fill={accentFill} />
    </svg>
  )
}

export function NeurosurgeryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 8c-2.5 0-4.5 2-4.5 4.5 0 1 .3 1.9.9 2.6-.6.7-.9 1.6-.9 2.6C7.5 20.2 9.5 22 12 22h8c2.5 0 4.5-1.8 4.5-4.3 0-1-.3-1.9-.9-2.6.6-.7.9-1.6.9-2.6C24.5 10 22.5 8 20 8c-1 0-1.9.3-2.6.9C16.7 8.3 15.8 8 14.8 8"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M14 12v3M17 12v6M11 15v3" {...stroke} className="text-teal-800" />
      <path d="M17 18a3 3 0 0 0 3 3" {...stroke} stroke={accentFill} />
    </svg>
  )
}

export function GastroenterologyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M11 7c0 3-1.5 4-1.5 7.5C9.5 19.5 12.5 23 17 23c3.9 0 6.5-2.5 6.5-6 0-2.8-2-4-4.3-4.3"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M11 7c2 0 3 1 3 2.5S13 12 15 12" {...stroke} className="text-teal-800" />
      <path d="M14 16a4 4 0 0 0 4 4" fill={accentFill} stroke="none" />
    </svg>
  )
}

export function UrologyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 6c-2.8 0-4.5 2.3-4.5 5.4 0 3.6 2.2 4.9 2.2 8 0 2 1.3 3.6 3.1 3.6s3-1.5 2.9-3.4c-.1-2 1.5-2.6 1.5-2.6"
        {...stroke}
        className="text-teal-800"
      />
      <path
        d="M20 6c2.8 0 4.5 2.3 4.5 5.4 0 3.6-2.2 4.9-2.2 8 0 2-1.3 3.6-3.1 3.6"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M14.5 16.5h3v3h-3z" fill={accentFill} />
    </svg>
  )
}

export function SpineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {[6, 10, 14, 18, 22].map((y, i) => (
        <ellipse
          key={y}
          cx={16 + (i % 2 === 0 ? -0.6 : 0.6)}
          cy={y}
          rx="3.2"
          ry="1.8"
          {...stroke}
          className={i === 2 ? undefined : 'text-teal-800'}
          stroke={i === 2 ? accentFill : undefined}
        />
      ))}
      <path d="M16 7.5v17" {...stroke} className="text-teal-800" strokeWidth={1.2} />
    </svg>
  )
}

export function OphthalmologyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M5 16s4.5-7 11-7 11 7 11 7-4.5 7-11 7-11-7-11-7z"
        {...stroke}
        className="text-teal-800"
      />
      <circle cx="16" cy="16" r="3.6" {...stroke} className="text-teal-800" />
      <circle cx="16" cy="16" r="1.6" fill={accentFill} />
    </svg>
  )
}

export function EntIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M19 8a6 6 0 0 0-6 6c0 2 1 2.8 1 4.5a3 3 0 0 1-3 3 3 3 0 0 1-3-3"
        {...stroke}
        className="text-teal-800"
      />
      <path
        d="M19 8a6 6 0 0 1 6 6c0 3.5-2.5 4.7-2.5 8a3.5 3.5 0 0 1-3.5 3.5"
        {...stroke}
        className="text-teal-800"
      />
      <circle cx="19" cy="14" r="1.4" fill={accentFill} />
    </svg>
  )
}

export function DentistryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M16 8c-2.5 0-3.6 1.6-5.4 1.6-1.7 0-2.6-1-2.6 2 0 3.2 1.6 12.4 3.6 12.4 1.7 0 1.8-5.2 4.4-5.2s2.7 5.2 4.4 5.2c2 0 3.6-9.2 3.6-12.4 0-3-.9-2-2.6-2C19.6 9.6 18.5 8 16 8z"
        {...stroke}
        className="text-teal-800"
      />
      <path d="M14 13.5c.5 1 1 1.5 2 1.5s1.5-.5 2-1.5" stroke={accentFill} strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  )
}

export function AnaesthesiaIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 24 19 13" {...stroke} className="text-teal-800" />
      <path d="M17 11l4 4-2 2-4-4z" {...stroke} className="text-teal-800" />
      <path d="M21 9l2 2M23 7l2 2M19 11l2 2" {...stroke} className="text-teal-800" />
      <circle cx="8" cy="24" r="1.7" fill={accentFill} />
    </svg>
  )
}

export function GeneralSurgeryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 8l16 16" {...stroke} className="text-teal-800" />
      <circle cx="8" cy="8" r="2.6" {...stroke} className="text-teal-800" />
      <circle cx="24" cy="24" r="1.6" fill={accentFill} />
      <path d="M8 24l6-6M24 8l-6 6" {...stroke} className="text-teal-800" />
      <circle cx="8" cy="24" r="2.6" {...stroke} className="text-teal-800" />
    </svg>
  )
}

export function TraumaIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="20" height="20" rx="4" {...stroke} className="text-teal-800" />
      <path d="M16 11v10M11 16h10" stroke={accentFill} strokeWidth={2.25} strokeLinecap="round" />
    </svg>
  )
}

/** Slug -> icon, for the 15 clinical departments only. Diagnostics and support
 *  services do not have icons yet — see the note on this file for why that is a
 *  deliberate next step, not an oversight. */
export const DEPARTMENT_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  'emergency-services': EmergencyIcon,
  'general-medicine': GeneralMedicineIcon,
  'ortho-joint-replacement': OrthoIcon,
  'obstetrics-gynaecology': ObstetricsIcon,
  'paediatrics-neonatology': PaediatricsIcon,
  neurosurgery: NeurosurgeryIcon,
  gastroenterology: GastroenterologyIcon,
  urology: UrologyIcon,
  'spine-surgery': SpineIcon,
  ophthalmology: OphthalmologyIcon,
  ent: EntIcon,
  dentistry: DentistryIcon,
  'anaesthesia-pain-management': AnaesthesiaIcon,
  'general-laparoscopic-surgery': GeneralSurgeryIcon,
  'trauma-management': TraumaIcon,
}
