// app/dev/tokens/page.tsx
//
// Living reference for the LIMS design system. The point is that palette and typography
// drift is visible immediately rather than discovered six departments later — over a
// multi-year hospital build, that drift is the main way a design system dies.
//
// Not linked from navigation, and excluded from indexing. Remove or gate behind an env
// check before production if you'd rather it not exist publicly.

import type { Metadata } from 'next'
import { Section } from '@/components/primitives/Section'

export const metadata: Metadata = {
  title: 'Design tokens',
  robots: { index: false, follow: false },
}

const tealRamp = [
  ['50', '#F1F8FB'], ['100', '#DDEFF5'], ['200', '#BEDEE9'], ['300', '#8FC4D6'],
  ['400', '#55A7C3'], ['500', '#3187A5'], ['600', '#236C85'], ['700', '#1A5468'],
  ['800', '#133E4D'], ['900', '#0D2D38'], ['950', '#081C24'],
] as const

const copperRamp = [
  ['50', '#FBF1EF'], ['100', '#F7E2DC'], ['200', '#F0C7BC'], ['300', '#EAA997'],
  ['400', '#E5917B'], ['500', '#E07A5F'], ['600', '#CC5333'], ['700', '#AE4529'],
  ['800', '#92361E'], ['900', '#5B2415'],
] as const

const inkRamp = [
  ['50', '#F7FAFA'], ['100', '#EBF0F0'], ['200', '#D7E0E1'], ['300', '#B4C2C5'],
  ['400', '#7E9094'], ['600', '#4A5B5E'], ['800', '#1E2A2D'], ['950', '#0B1416'],
] as const

const typeSteps = [
  ['step-5', 'text-step-5', 'Page title'],
  ['step-4', 'text-step-4', 'Section heading'],
  ['step-3', 'text-step-3', 'Subsection'],
  ['step-2', 'text-step-2', 'Large heading'],
  ['step-1', 'text-step-1', 'Card title'],
  ['step-0', 'text-step-0', 'Body copy'],
  ['step--1', 'text-step--1', 'Caption / meta'],
] as const

export default function TokensPage() {
  return (
    <Section labelledBy="tokens-heading">
      <h1 id="tokens-heading" className="text-step-5">
        LIMS design tokens
      </h1>
      <span className="rule-accent mt-3" aria-hidden="true" />

      <h2 className="mt-12 text-step-3">Brand anchors</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Anchor name="Primary Deep Teal" token="teal-800" hex="#133E4D" ratio="11.51:1 · AAA"
          note="Official LIMS primary. Body text, headings, buttons. Safe everywhere." fg="text-white" bg="bg-teal-800" />
        <Anchor name="Secondary Teal" token="teal-600" hex="#236C85" ratio="5.91:1 · AA"
          note="Icons, borders, focus ring, secondary text." fg="text-white" bg="bg-teal-600" />
        <Anchor name="Accent Copper" token="copper-500" hex="#E07A5F" ratio="2.95:1 · fails"
          note="Official LIMS accent. Decorative only. As a fill with ink-950 text it reaches 6.32:1. When copper must be text, use copper-700." fg="text-ink-950" bg="bg-copper-500" />
      </div>

      <h2 className="mt-12 text-step-3">Teal ramp</h2>
      <Ramp entries={tealRamp} />

      <h2 className="mt-12 text-step-3">Copper ramp</h2>
      <Ramp entries={copperRamp} />

      <h2 className="mt-12 text-step-3">Ink (warm neutrals)</h2>
      <Ramp entries={inkRamp} />

      <h2 className="mt-12 text-step-3">Clinical status</h2>
      <p className="mt-2 max-w-prose text-step--1 text-ink-600">
        Each of these must always be paired with text or an icon. Never colour alone.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <span className="rounded bg-emergency px-4 py-2 text-step--1 font-semibold text-white">
          Emergency #B3261E
        </span>
        <span className="rounded bg-caution px-4 py-2 text-step--1 font-semibold text-white">
          Caution #8A5A00
        </span>
        <span className="rounded bg-success px-4 py-2 text-step--1 font-semibold text-white">
          Success #1F6B3F
        </span>
      </div>

      <h2 className="mt-12 text-step-3">Fluid type scale</h2>
      <p className="mt-2 max-w-prose text-step--1 text-ink-600">
        Resize the window: every step scales continuously between 360px and 1440px, so no
        viewport is an afterthought.
      </p>
      <dl className="mt-4 space-y-4">
        {typeSteps.map(([token, className, role]) => (
          <div key={token} className="border-b border-ink-200 pb-4">
            <dt className="text-step--1 font-semibold text-teal-600">
              {token} — {role}
            </dt>
            <dd className={`${className} mt-1 font-sans text-ink-950`}>
              Cardiac Sciences at LIMS Hisar
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-step-3">Copper accent system</h2>
      <span className="rule-accent mt-3" aria-hidden="true" />
      <p className="mt-4 max-w-prose text-step--1 text-ink-600">
        Copper is the brand&rsquo;s only warm hue and carries structure — where a section
        starts, what is interactive, what is worth noticing. It never carries meaning on
        its own; clinical meaning belongs to the status colours above. The recipes live in
        <code className="mx-1 rounded bg-ink-100 px-1">app/globals.css</code>
        so the contrast rule is enforced in one place rather than re-derived per component.
      </p>

      <dl className="mt-6 space-y-6">
        <Recipe name=".eyebrow" note="copper-700 — 5.70:1 on white, 5.31:1 on teal-50, 5.14:1 on copper-50">
          <span className="eyebrow">Centres of Excellence</span>
        </Recipe>

        <Recipe name=".rule-accent / .rule-accent-lg" note="hairline under h2, 3px under h1">
          <span className="rule-accent" aria-hidden="true" />
          <span className="rule-accent-lg mt-3" aria-hidden="true" />
        </Recipe>

        <Recipe name=".divider-accent" note="full-bleed band transition; fades at both ends">
          <span className="divider-accent" aria-hidden="true" />
        </Recipe>

        <Recipe name=".badge-accent / .badge-accent-soft" note="ink-950 on copper-500 = 6.32:1; copper-700 on copper-50 = 5.14:1">
          <span className="badge-accent">24&times;7</span>
          <span className="badge-accent-soft ml-2">Cardiac sciences</span>
        </Recipe>

        <Recipe
          name=".menu-row"
          note="a row inside a dropdown panel. teal-100 lift plus a 6px teal-800 strip, no fill — the card language at menu scale. Labels keep their resting colour: teal-800 is 6.60:1 on the tint"
        >
          <a
            href="#tokens-heading"
            className="menu-row flex min-h-[44px] w-64 items-center pl-5 pr-3 text-step--1
                       text-teal-800"
          >
            Ortho &amp; Joint Replacement
          </a>
        </Recipe>

        <Recipe
          name=".sweep"
          note="light ground, one label — nav items, menu rows, outline buttons. teal-800 -> teal-950 as the copper lands (2.63:1 vs 5.28:1 on copper-500)"
        >
          <a
            href="#tokens-heading"
            className="sweep inline-flex min-h-[44px] items-center rounded-full border-2
                       border-teal-800 px-4 font-semibold"
          >
            Find a doctor
          </a>
        </Recipe>

        <Recipe
          name=".card-edge"
          note="department and service cards. 4px copper strip at rest; on hover and focus-within it goes 6px teal-800 and the body tints teal-100, both in 120ms. No fill, so labels never repaint — teal-800 holds 6.60:1 on the tint"
        >
          <a
            href="#tokens-heading"
            className="card-edge block border border-ink-200 bg-white p-5 shadow-card
                       transition-shadow ease-standard hover:shadow-raised"
          >
            <span className="block text-step-1 font-semibold text-teal-800">
              Cardiac Sciences
            </span>
            <span className="mt-1 block text-step--1 text-ink-600">2 consultants</span>
            <span className="card-cta mt-4 inline-flex min-h-[44px] items-center px-4">
              View profile
            </span>
          </a>
        </Recipe>

        <Recipe
          name=".sweep-solid"
          note="filled primary buttons. Fills to copper-700, not copper-500: white is 2.95:1 on the accent and 4.67:1 on copper-700, and no dark colour clears both halves of a teal-800 -> copper sweep"
        >
          <a
            href="#tokens-heading"
            className="sweep-solid inline-flex min-h-[44px] items-center px-5 font-semibold"
          >
            Book an appointment
          </a>
        </Recipe>

        <Recipe name=".link-accent" note="underline is always present; colour never marks a link alone">
          <a href="#tokens-heading" className="link-accent">
            Read the patient information leaflet
          </a>
        </Recipe>
      </dl>

      <h2 className="mt-12 text-step-3">Component recipes</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="min-h-[44px] rounded bg-teal-800 px-5 font-semibold text-white hover:bg-teal-700">
          Primary
        </button>
        <button type="button" className="min-h-[44px] rounded border-2 border-teal-800 px-5 font-semibold text-teal-800 hover:bg-teal-50">
          Secondary
        </button>
        <button type="button" className="min-h-[44px] rounded bg-copper-500 px-5 font-semibold text-ink-950 hover:bg-copper-600">
          Accent CTA
        </button>
        <a href="#tokens-heading" className="text-teal-800 underline decoration-teal-600/40 underline-offset-2 hover:decoration-teal-600">
          Text link
        </a>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-step--1 text-teal-800">
          Chip
        </span>
      </div>
    </Section>
  )
}

interface RecipeProps {
  name: string
  note: string
  children: React.ReactNode
}

/** One row of the copper reference: the class name, why it is safe, and it rendered. */
function Recipe({ name, note, children }: RecipeProps) {
  return (
    <div className="border-b border-ink-200 pb-6">
      <dt>
        <code className="text-step--1 font-semibold text-copper-800">{name}</code>
        <span className="ml-3 text-step--1 text-ink-600">{note}</span>
      </dt>
      <dd className="mt-3">{children}</dd>
    </div>
  )
}

interface AnchorProps {
  name: string
  token: string
  hex: string
  ratio: string
  note: string
  fg: string
  bg: string
}

function Anchor({ name, token, hex, ratio, note, fg, bg }: AnchorProps) {
  return (
    <div className="rounded border border-ink-200 shadow-card">
      <div className={`${bg} ${fg} rounded-t p-6`}>
        <p className="font-semibold">{name}</p>
        <p className="text-step--1 tabular-nums">{hex}</p>
      </div>
      <div className="p-4">
        <p className="text-step--1 font-semibold text-teal-800">{token}</p>
        <p className="text-step--1 tabular-nums text-ink-600">{ratio} on white</p>
        <p className="mt-2 text-step--1 text-ink-950">{note}</p>
      </div>
    </div>
  )
}

function Ramp({ entries }: { entries: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2">
      {entries.map(([step, hex]) => (
        <div key={step} className="rounded border border-ink-200 text-step--1">
          <div className="h-14 rounded-t" style={{ backgroundColor: hex }} />
          <div className="p-2">
            <p className="font-semibold text-teal-800">{step}</p>
            <p className="tabular-nums text-ink-600">{hex}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
