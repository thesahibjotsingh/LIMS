// lib/grid-cols.ts
//
// A fixed column count reads as a chosen density; CSS Grid's auto-fit reads as
// "whatever happened to fit the min-width" (see the Grid primitive). But a single
// fixed count doesn't fit every list on this site — /specialities (15 services) wants
// 6 across, /patient-care (4) wants exactly 4 so the row fills rather than sitting
// three-quarters empty, and /services (7) at a flat 6 would strand one card alone on
// its own row.
//
// pickCols finds the largest column count up to `max` that divides the list without
// leaving a remainder of 1 — a lone last card reads as a mistake in a way a row of 2
// or 3 does not. Below `max` items, it just returns the count itself so the row fills
// exactly rather than sitting in a wider, mostly-empty track.
function pickCols(count: number, max: number): number {
  if (count <= max) return count
  for (let n = max; n >= 2; n--) {
    if (count % n !== 1) return n
  }
  return max
}

// Tailwind's JIT scanner needs literal class strings in the source, not a computed
// `grid-cols-${n}` — so every count this site actually uses is enumerated here rather
// than built by interpolation. Extend the range if a future list needs more columns.
const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
} as const

const SM_COLS = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
} as const

const LG_COLS = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
} as const

/**
 * A responsive `grid-cols-*` class string sized to `count` items: 2 columns on
 * mobile, up to 3 on tablet, up to 6 on desktop — each capped and, above the cap,
 * chosen to avoid stranding a single card on the last row.
 */
export function gridColsClassName(count: number): string {
  const mobile = pickCols(count, 2)
  const tablet = pickCols(count, 3)
  const desktop = pickCols(count, 6)
  return `${COLS[mobile as keyof typeof COLS]} ${SM_COLS[tablet as keyof typeof SM_COLS]} ${LG_COLS[desktop as keyof typeof LG_COLS]}`
}
