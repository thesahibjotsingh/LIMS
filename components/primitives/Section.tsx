// components/primitives/Section.tsx
// Vertical rhythm + surface tone. Alternating 'default' and 'tint' down a long page is
// the main structural device of the design — in calm clinical minimalism, spacing does
// the work that gradients and borders do elsewhere.
//
// Resist tightening `py-section` to fit more above the fold. The whitespace IS the design.

import type { ReactNode } from 'react'
import { Container, type ContainerProps } from './Container'

export interface SectionProps {
  children: ReactNode
  /**
   * default → white
   * tint    → teal-50, the standard alternating band (teal-800 on it = 7.29:1)
   * warm    → copper-50, used sparingly for human-centred content (patient stories)
   * dark    → teal-900 with white text (11.42:1), for the footer and one CTA band
   */
  tone?: 'default' | 'tint' | 'warm' | 'dark'
  width?: ContainerProps['width']
  /** Anchor target for in-page navigation. */
  id?: string
  /** Wire to the section's own heading id so screen readers name the region. */
  labelledBy?: string
  className?: string
}

const tones = {
  default: 'bg-white text-ink-950',
  tint: 'bg-teal-50 text-ink-950',
  warm: 'bg-copper-50 text-ink-950',
  // `on-dark` swaps the focus ring to white — cyan on deep teal is too low-contrast.
  dark: 'on-dark bg-teal-900 text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white',
} as const

export function Section({
  children,
  tone = 'default',
  width = 'default',
  id,
  labelledBy,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-section ${tones[tone]} ${className}`}
    >
      <Container width={width}>{children}</Container>
    </section>
  )
}
