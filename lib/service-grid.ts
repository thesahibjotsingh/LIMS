// lib/service-grid.ts
//
// One shared definition for the icon-tile card grid used in four places: the home
// page's Centres of Excellence section, /centres, and /specialities, /services,
// /patient-care (ServiceIndex.tsx). Those four used to carry their own copies of the
// grid and card classes, tuned independently — which is exactly how they drifted:
// /centres was given a min-height copied from the home page's shorter card without
// accounting for the consultant-count line its own cards also show, so its tallest
// row quietly grew past that floor while shorter rows in the same list did not.
// Importing one constant from here instead of retyping the className makes that
// drift impossible — change a value once, every grid moves together.
//
// FLAT 6-COLUMN GRID, not sized per list: a deliberately chosen density (2 on mobile,
// 3 on tablet, 6 on desktop) everywhere this card appears, so every one of these
// pages reads as the same grid rather than each settling on whatever count happened
// to fit its own item count. A short list (patient-care's 4 services) sits in the
// first four tracks of the same 6-column row other pages use, rather than widening
// its own cards to fill the row.
export const SERVICE_GRID_CLASSNAME = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'

// aspect-square, not a fixed min-height: a square tile is the shape asked for, and
// unlike min-height it holds regardless of column count — six columns on a wide
// desktop and two on a phone both get a square, not a fixed pixel height that reads
// as tall-and-narrow at six columns and short-and-wide at two.
//
// Everything inside is sized DOWN to fit the worst real case — a three-line title
// plus a consultant-count line ("General & Laparoscopic Surgery" / "1 consultant") —
// at the width six columns produces on a typical desktop (~190px). A smaller icon,
// tighter padding and the smaller title size below all exist for that one reason:
// there's no free vertical room in a square the way there was in the old
// 236px-tall rectangle. line-clamp-3 on the title (below) is the backstop if a name
// longer than any current one ever doesn't fit.
export const SERVICE_CARD_CLASSNAME =
  'card-geo flex aspect-square flex-col items-center gap-1.5 p-3 pt-5 text-center'

// h-16 (64px) — the square's real slack turned out to be in the title, not the
// icon: at the smaller text-step--1 size below, even the longest names wrap to 2
// lines rather than the 3 the layout was budgeted for, freeing up room a bigger,
// easier-to-read icon can use instead of sitting unused as blank card space.
//
// loading="eager": every one of these grids starts high enough on its page that its
// first row can sit inside the initial viewport. The browser's native loading="lazy"
// only reliably fires for images that cross INTO view during a scroll — one already
// there at load can simply never load. These icons are a few KB each, so
// eager-loading the row costs nothing worth trading for icons that silently never
// appear on first paint.
export const SERVICE_ICON_CLASSNAME = 'h-[4.5rem] w-[4.5rem] object-contain'
export const SERVICE_ICON_SIZE = 144

// text-step--1, down from text-step-0 — smaller text fits more characters per line
// at the same card width, which is what actually buys back the lines a square gives
// up versus the old rectangle (more chars/line means fewer lines needed, not just
// smaller ones). line-clamp-3 is the hard backstop: if a title ever still overflows
// three lines at this width, it truncates with an ellipsis instead of spilling past
// the card's own overflow-hidden edge.
export const SERVICE_TITLE_CLASSNAME =
  'line-clamp-3 text-step--1 font-semibold leading-tight text-teal-800'
