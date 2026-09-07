// lib/is-active.ts
//
// Which nav entry corresponds to the page you are on.
//
// Pure and framework-free on purpose: both the flat links and the dropdown triggers
// need this answer, they are separate client components, and a helper neither of them
// owns is the only way the two can agree. A nav where the underline logic is written
// twice is a nav where the two copies drift.

/**
 * True when `href` names the current page or an ancestor section of it.
 *
 * Prefix matching is what makes a section stay lit while you are inside it —
 * /doctors keeps its underline on /doctors/udit-choudhary, which is the behaviour a
 * patient expects from a nav. The trailing slash in the comparison matters: without
 * it, /doctors would also claim /doctors-something-else.
 *
 * Fragments and query strings are stripped before comparing, so /contact#locations
 * lights up /contact rather than never matching anything.
 */
export function isActiveHref(pathname: string, href: string): boolean {
  const path = normalise(pathname)
  const target = normalise(href.split('#')[0]?.split('?')[0] ?? href)

  // "/" is an ancestor of literally everything, so it only ever matches exactly.
  if (target === '/') return path === '/'

  return path === target || path.startsWith(`${target}/`)
}

/** Drop a trailing slash so "/doctors" and "/doctors/" are the same page. */
function normalise(value: string): string {
  if (value.length > 1 && value.endsWith('/')) return value.slice(0, -1)
  return value
}
