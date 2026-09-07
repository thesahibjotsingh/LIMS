# LIMS Platform

Web platform for **Lifeline Institute of Medical Sciences, Hisar (LIMS)**.
Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS 3.4

---

## Requirements

- **Node.js 20 LTS or newer** (Next 15 requires ≥18.18; 20 LTS is what this is built against)
- npm 10+

## Getting started

```powershell
cd E:\Hospital
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload on port 3000 |
| `npm run build` | Production build — also the fastest full type + route check |
| `npm start` | Serve the production build (run `build` first) |
| `npm run typecheck` | `tsc --noEmit`, no build artifacts |
| `npm run lint` | ESLint including `jsx-a11y` rules |
| `npm run analyze` | Bundle analysis (needs `@next/bundle-analyzer`, added in Phase 8) |
| `npm run icons` | Regenerate the favicon set from the logo master |

## Routes

| Route | Status |
| --- | --- |
| `/` | Home — hero, quick actions, clinical department grid. |
| `/centres` | All 26 services, grouped into clinical / diagnostics / support. |
| `/centres/[slug]` | One service, plus its consultants. 26 prerendered. |
| `/doctors` | Directory, grouped by department. Filters + search in Phase 3. |
| `/doctors/[id]` | Doctor profile. 4 prerendered. Portraits + OPD timings pending. |
| `/dev/tokens` | **Live design-token reference.** Not linked in nav, `noindex`. |

## Data

`lib/services.ts` is the spine: the 26 services LIMS supplied, one slug each. Nav, home
grid, footer, `/centres`, `/centres/[slug]` and the doctor roster all resolve against it,
so a rename is one edit. `lib/doctors.ts` throws at module load if a doctor is filed
under a slug that does not exist there — otherwise a renamed slug silently drops that
doctor off their department page.

The three-way `category` split (clinical / diagnostics / support) is **editorial, not
LIMS's own structure** — 26 flat tiles ask a patient to tell "Neurosurgery" apart from
"Color Doppler" unaided. Confirm it.

`/dev/tokens` is the fastest way to confirm the theme compiled correctly — it renders
every colour ramp, type step and component recipe on one page.

## Project structure

```
app/
  layout.tsx            root layout — fonts, skip link, EmergencyBar, header, footer
  page.tsx              home
  globals.css           CSS token layer, focus ring, reduced-motion guard
  doctors/
    page.tsx            directory
    [id]/page.tsx       doctor profile (dynamic)
  dev/tokens/page.tsx   design-token reference
components/
  primitives/           Container, Section, Stack, Grid
  sections/             EmergencyBar, SiteHeader, SiteFooter
lib/
  fonts.ts              next/font — Inter + Source Serif 4
  site-config.ts        nav, contact, locations   ← real contact data; roles unconfirmed
  sample-data.ts        doctor fixtures           ← PLACEHOLDER DATA, delete in Phase 3
types/index.ts          Doctor, Department, Service, Location, HealthPackage
public/images/
  lims-logo.png         wordmark, 1870×841 RGBA — used by SiteHeader
  lims-favicon.png      emblem master, 1254×1254 — never served; source for npm run icons
  placeholder-doctor.jpg  ← replace with real portraits
public/icons/           generated favicon set — do not hand-edit
public/favicon.ico      generated
scripts/generate-icons.mjs
```

## Brand tokens

Taken from official LIMS stationery. Both ramps are generated at a fixed hue from the
anchor (teal H195.5, copper H12.6), so every step is a real relative of the brand colour.

| Name | Token | Hex | On white |
| --- | --- | --- | --- |
| Primary Deep Teal | `teal-800` | `#133E4D` | 11.51:1 — AAA, safe for all text |
| Secondary Teal | `teal-600` | `#236C85` | 5.91:1 — icons, borders, focus ring, secondary text |
| Accent Copper | `copper-500` | `#E07A5F` | 2.95:1 — **decorative only** |
| Text-safe copper | `copper-700` | `#AE4529` | 5.70:1 — use when copper must be text |

Use theme tokens (`bg-teal-800`), never arbitrary values (`bg-[#133E4D]`). If a token is
missing, add it to `tailwind.config.ts` first.

### The copper accent system

Copper is the brand's only warm hue, so it is what makes the site read as LIMS rather than
as one more teal hospital template. It carries **structure** — where a section starts, what
is interactive, what is worth noticing — and never carries meaning on its own; clinical
meaning belongs to the status colours. The recipes live in `app/globals.css` and are all
rendered on `/dev/tokens`.

| Class | Where it appears |
| --- | --- |
| `.eyebrow` | Section kicker above every `h1`/`h2` |
| `.rule-accent` / `.rule-accent-lg` | Hairline under `h2`, 3px under `h1` |
| `.divider-accent` | Full-bleed band transition (top of the footer) |
| `.badge-accent` / `.badge-accent-soft` | Department and experience badging |
| `.sweep` | Outline buttons on a light ground |
| `.menu-row` | Dropdown panel rows — teal-100 lift + 6px teal strip |
| `.card-edge` | Department and service cards — copper strip at rest; teal strip + teal-100 tint on hover / `:focus-within` |
| `.sweep-solid` | Filled primary buttons |
| `.link-accent` | Copper text links |

**The one rule that gets broken:** copper's contrast depends on the band it sits on, and
this site alternates white / `teal-50` / `copper-50`.

| | white | teal-50 | copper-50 |
| --- | --- | --- | --- |
| `copper-500` | 2.95:1 ❌ | — | — |
| `copper-600` | 4.33:1 ⚠️ | 4.03:1 ⚠️ | 3.90:1 ⚠️ |
| `copper-700` | 5.70:1 ✅ | 5.31:1 ✅ | 5.14:1 ✅ |
| `copper-800` | 7.59:1 ✅ | 7.06:1 ✅ | 6.84:1 ✅ |

So: **copper-500 is decorative only** (rules, fills, edges — never text) and **copper-700
is the copper that carries text** on every surface this site uses. copper-600 clears the
3:1 a state indicator needs (WCAG 1.4.11) but not the 4.5:1 text needs, so it is used
for the nav hover underline and nothing verbal.

## Brand assets

Two masters, both in `public/images/`. Keep the alpha channel on both — the artwork is
teal-on-transparent and reads only against a light ground. It is close to invisible on
`teal-800`, which is why the header stays white.

### `lims-logo.png` — the header wordmark

Overwrite the file in place; no code change is needed **provided the new file keeps the
2.224:1 ratio** (currently 1870×841). A different ratio means updating `LOGO_WIDTH` /
`LOGO_HEIGHT` in `components/sections/SiteHeader.tsx` — those constants reserve the box
on first paint, so a stale ratio shows up directly as CLS.

The institution name below the mark is **typeset, not part of the artwork**
(`SiteHeader.tsx`). That is deliberate: as text it stays legible at 48px, reflows at
360px, survives a 400% browser zoom, and is selectable and translatable. If a future
logo file bakes the name back in, delete the text — never ship both.

### `lims-favicon.png` — the emblem master

~1 MB at 1254×1254, and **never served to a browser**. `npm run icons` trims its uneven
transparent padding and writes the served set:

```
public/icons/favicon-16.png   favicon-32.png   favicon-48.png
public/icons/icon-192.png     icon-512.png     apple-touch-icon.png  (flattened on white)
public/favicon.ico            32×32 PNG-in-ICO for the bare root request
```

The links are declared in `metadata.icons` in `app/layout.tsx`. Replace the master, run
`npm run icons`, commit the output — nothing else changes.

## Standards this codebase holds to

- **WCAG 2.1 AA minimum.** Semantic landmarks, one `<h1>`, visible focus ring, 44px touch
  targets, never colour alone, `prefers-reduced-motion` respected.
- **Performance budgets (public routes, Lighthouse mobile / 4G):** LCP ≤ 2.0s, INP ≤ 200ms,
  CLS ≤ 0.05, JS ≤ 170 KB gzip per route. Phase 0 baseline: **106 KB First Load JS**.
- **Server Components by default.** `"use client"` only on interactive leaves — never on a
  page or layout.
- **DPDP Act 2023:** no personal data in URLs, nothing identifying in browser storage, zero
  third-party bytes before consent, purpose limitation on every form field.
- **No raw YouTube iframes.** Poster + play button facade, `youtube-nocookie`, injected on
  click behind media consent.

## Contact data

Transcribed from the official LIMS card and live in `lib/site-config.ts`:

| | |
| --- | --- |
| Address | Jindal Chowk, Hisar, Haryana |
| Phone | +91 92549 84121 · +91 92549 84122 |
| Website | www.limshisar.com |
| Tagline | Compassion · Excellence · Care |

No PIN code is published on the card, so `primaryLocation.pincode` is omitted rather than
guessed — a wrong postal code in `MedicalOrganization` structured data is asserted as fact
to search engines. The field is optional in `types/index.ts` and both the footer and the
JSON-LD skip it when absent.

## Before any deploy

**1. Confirm what the two phone numbers actually are.** The card prints both without
roles. The top bar currently labels the first *Emergency* and the second *Appointments*
because someone in distress needs a number above the fold — but that split is an
assumption. If either line is a reception desk that closes at night, the site is telling a
patient to call a phone nobody answers, which is a safety problem rather than a copy
problem. Also confirm whether either line is genuinely 24×7 (no such claim appears in the
UI until it is) and whether there is a separate ambulance number — `EmergencyBar` has a
slot for one and renders without it rather than pointing at a guess.

**2. Replace the remaining `TODO`s in `lib/site-config.ts`** — the Centre list is still
placeholder.

**3. Delete `lib/sample-data.ts`.** Not left as a fallback: fabricated doctor credentials
on a live hospital site are a real harm.
