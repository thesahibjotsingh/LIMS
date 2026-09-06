// components/primitives/Stack.tsx
// Vertical rhythm between siblings, expressed once instead of as ad-hoc margins
// scattered through every component. Removes most of the "why is this 14px here"
// drift that design systems accumulate over a multi-year build.

import type { ElementType, ReactNode } from 'react'

export interface StackProps {
  children: ReactNode
  /** Steps map to the 4px base grid. */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  as?: ElementType
  className?: string
}

const gaps = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-10',
} as const

const alignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const

export function Stack({
  children,
  gap = 'md',
  align = 'stretch',
  as: Tag = 'div',
  className = '',
}: StackProps) {
  return (
    <Tag className={`flex flex-col ${gaps[gap]} ${alignments[align]} ${className}`}>
      {children}
    </Tag>
  )
}
