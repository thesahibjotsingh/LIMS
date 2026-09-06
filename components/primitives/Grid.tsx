// components/primitives/Grid.tsx
// Intrinsic responsive grid: `repeat(auto-fit, minmax(<min>, 1fr))`.
//
// The point is that the grid responds to the space it is *given*, not to the viewport.
// A DoctorCard grid inside a department sidebar and the same grid on a full-width
// directory page both behave correctly with no breakpoint rules — which is what makes
// the component library actually reusable across 30+ department pages.

import type { ReactNode } from 'react'

export interface GridProps {
  children: ReactNode
  /** Minimum comfortable width of one item before the grid drops a column. */
  min?: 'sm' | 'md' | 'lg'
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Tailwind needs literal class strings, so these are enumerated rather than computed. */
const mins = {
  sm: 'grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]',
  md: 'grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]',
  lg: 'grid-cols-[repeat(auto-fit,minmax(24rem,1fr))]',
} as const

const gaps = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
} as const

export function Grid({ children, min = 'md', gap = 'md', className = '' }: GridProps) {
  return <div className={`grid ${mins[min]} ${gaps[gap]} ${className}`}>{children}</div>
}
