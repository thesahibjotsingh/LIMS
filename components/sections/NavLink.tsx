'use client'

// components/sections/NavLink.tsx
//
// A flat nav item that knows whether you are on its page.
//
// It is a client component for one reason: the current pathname. A server component
// cannot read it — there is no request-scoped "current URL" available to a component
// that may have been rendered at build time, and every one of these pages is
// prerendered. usePathname is the only honest source.
//
// The cost is small and bounded: this ships the link markup and a pathname read, not
// the nav data, which stays in the server component that renders these.
//
// aria-current="page" is the part that actually matters, and it is load-bearing twice
// over. It tells a screen-reader user where they are, so the state is not conveyed by
// colour alone (WCAG 1.4.1) — and it is the selector the underline itself hangs off, so
// the visual indicator and the accessible one cannot drift apart.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isActiveHref } from '@/lib/is-active'

export interface NavLinkProps {
  href: string
  label: string
  className?: string
}

export function NavLink({ href, label, className = '' }: NavLinkProps) {
  const pathname = usePathname()
  const active = isActiveHref(pathname, href)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`nav-underline ${className}`}
    >
      {label}
    </Link>
  )
}
