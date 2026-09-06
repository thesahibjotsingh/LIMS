// components/primitives/Container.tsx
// Horizontal boundary + fluid gutter. Every page uses this; nothing sets its own
// max-width or horizontal padding. Server component — no interactivity, no JS shipped.

import type { ElementType, ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
  /** 'default' = 80rem page width. 'prose' = 68ch, for long-form clinical reading. */
  width?: 'default' | 'prose' | 'wide'
  /** Render as a different element when the semantics call for it. */
  as?: ElementType
  className?: string
}

const widths = {
  default: 'max-w-container',
  prose: 'max-w-prose',
  wide: 'max-w-[96rem]',
} as const

export function Container({
  children,
  width = 'default',
  as: Tag = 'div',
  className = '',
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full px-gutter ${widths[width]} ${className}`}>{children}</Tag>
  )
}
