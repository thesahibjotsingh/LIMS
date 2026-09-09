// app/page.tsx
//
// PHASE 0 SCOPE: the home page's structural skeleton — correct landmarks, heading
// hierarchy, section rhythm and surface tones, built from the layout primitives.
//
// PHASE 1 fills each section with real components (hero, Centre tiles, featured
// doctors, stats, patient stories). The sections are stubbed rather than filled
// because the content and the Centre list still need to come from LIMS, and inventing
// hospital statistics or outcome claims to fill a layout is not acceptable on a
// medical site.
//
// A patient's job on this page is to reach the right department, the right doctor, or
// the emergency number within one screen. Everything below is ordered for that.

import Image from 'next/image'
import Link from 'next/link'
import { DoctorCarousel } from '@/components/sections/DoctorCarousel'
import { HeroDoctorSearch } from '@/components/sections/HeroDoctorSearch'
import { Grid } from '@/components/primitives/Grid'
import { Section } from '@/components/primitives/Section'
import { Stack } from '@/components/primitives/Stack'
import { centreIconSrc } from '@/lib/centre-icons'
import { DOCTORS } from '@/lib/doctors'
import {
  SERVICE_CARD_CLASSNAME,
  SERVICE_GRID_CLASSNAME,
  SERVICE_ICON_CLASSNAME,
  SERVICE_ICON_SIZE,
  SERVICE_TITLE_CLASSNAME,
} from '@/lib/service-grid'
import { SERVICES, serviceHref, servicesByCategory } from '@/lib/services'
import { contact, siteConfig } from '@/lib/site-config'

// Content changes weekly at most — static with hourly revalidation keeps TTFB low.
export const revalidate = 3600

// The hero's own sentence, separate from siteConfig.description on purpose:
// siteConfig.description is written dense and keyword-loaded for the <meta
// description> tag (see app/layout.tsx), and reusing it verbatim as the hero's visible
// paragraph made the hero read like a search snippet rather than something a person
// would say. Same facts, same address, same services — said the way LIMS actually
// wants a visitor greeted.
const HERO_INTRO =
  "Hisar's multi-speciality hospital at Jindal Chowk. Round-the-clock emergency care, " +
  'on-site surgery, orthopaedics, and obstetrics & gynaecology, plus diagnostics, ' +
  'imaging, and pathology under the same roof.'

/**
 * The four quick actions, shared between the mobile icon-tile grid and the desktop
 * card list below so the two never drift into different destinations or labels.
 */
const QUICK_ACTIONS = [
  { label: 'Book an appointment', href: '/appointments', icon: 'book-an-appointment' },
  { label: 'Find a doctor', href: '/doctors', icon: 'find-a-doctor' },
  { label: 'Health check packages', href: '/health-packages', icon: 'health-check-packages' },
  { label: 'Locations & directions', href: '/contact#locations', icon: 'locations-and-directions' },
] as const

export default function HomePage() {
  const clinicalServices = servicesByCategory('clinical')

  return (
    <>
      {/* -- Hero ---------------------------------------------------------- */}
      {/* max-md:pt-0/pb-8 trims the tint band's own top-and-bottom rhythm on a
          phone — the mobile hero is a photo flush under the sticky header, not
          a padded band of text, so the section's usual breathing room would
          just be a gap between the header and the image. */}
      <Section tone="tint" labelledBy="hero-heading" className="max-md:pb-8 max-md:pt-0">
        {/* MOBILE H1 — sr-only, not visible. The desktop Stack below carries the
            real, visible h1#hero-heading; this one exists purely so a phone still
            has exactly one real page heading once that Stack is hidden below md
            (Google indexes mobile-first, and a screen reader's heading list should
            not go empty just because the visual hero became a photo). md:hidden
            drops it once the desktop heading takes over, so there is never a
            duplicate. */}
        <h1 className="sr-only md:hidden">{siteConfig.name}</h1>

        {/* MOBILE HERO — photo + floating search, no visible text. The photo
            breaks out to the full viewport width regardless of the container's
            fluid gutter (left-1/2 + -translate-x-1/2 is what does that, not a
            fixed negative margin, since px-gutter is a clamp() and has no single
            pixel value to cancel). The search bar stays inside the container's
            normal padding and rides up over the photo's bottom edge on a
            negative margin, which is the "floating" read. */}
        <div className="md:hidden">
          <div className="relative left-1/2 w-screen -translate-x-1/2">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src="/images/hero-doctor.jpg"
                alt="A LIMS doctor reviewing a patient's chart on a tablet"
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 -mt-7">
            <HeroDoctorSearch />
          </div>
        </div>

        {/* DESKTOP/TABLET HERO — unchanged text hero, eyebrow through CTAs.
            max-md:hidden rather than the reverse (hidden md:flex) because Stack
            already emits a bare `flex` unconditionally; adding an unprefixed
            `hidden` alongside it would leave two same-specificity display
            utilities fighting over source order instead of a variant cleanly
            overriding the base. */}
        <Stack gap="lg" className="max-w-prose max-md:hidden">
          {/* Eyebrow is copper-700, not copper-500: at this size the accent tone is
              2.95:1 and fails AA outright. The text-safe copper is the only one that
              may carry words. */}
          <p className="eyebrow">{siteConfig.city}, Haryana</p>
          <h1 id="hero-heading" className="text-step-5">
            {siteConfig.name}
          </h1>
          <span className="rule-accent-lg" aria-hidden="true" />
          <p className="text-step-1 text-ink-950">{HERO_INTRO}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/appointments"
              className="btn-primary inline-flex min-h-[48px] items-center px-5
                         font-semibold"
            >
              Book an appointment
            </Link>
            {/*
              Both hero CTAs are solid fills with no stroke: copper for the primary
              action, rich teal for the secondary. The label is white on both.

              The rich fill also closes something the pale version left open. As a
              teal-200 tint this button's EDGE against the teal-50 hero band was
              1.30:1, under the 3:1 WCAG 1.4.11 asks of a control's boundary — no
              light tint clears that on this band. teal-800 puts it at 7.29:1.
            */}
            <Link
              href="/doctors"
              className="btn-secondary inline-flex min-h-[48px] items-center px-5
                         font-semibold"
            >
              Find a doctor
            </Link>
          </div>
        </Stack>
      </Section>

      {/* -- Quick actions ------------------------------------------------- */}
      <Section labelledBy="quick-actions-heading">
        <p className="eyebrow">Quick actions</p>
        <h2 id="quick-actions-heading" className="mt-2 text-step-4">
          How can we help today?
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />

        {/* MOBILE — a 4-column icon-tile grid: icon centred over a short label,
            .card-geo's own copper accent bar carried over unchanged. A grid
            reads as a scannable app-style menu at this width; the wide
            icon-beside-text row below needs more horizontal room than a phone
            has to spare, which is why it is the md+ layout instead. */}
        <div className="mt-8 grid grid-cols-4 gap-3 md:hidden">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-geo flex min-h-[44px] flex-col items-center gap-2
                         px-2 py-4 text-center text-[0.6875rem] font-semibold
                         leading-tight text-teal-800"
            >
              <Image
                src={`/images/quick-actions/${action.icon}.png`}
                alt=""
                width={56}
                height={56}
                className="h-9 w-9 shrink-0"
              />
              {action.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP/TABLET — the original wide icon-beside-text row. .card-geo
            turns its left edge teal and its shadow deeper on hover AND on
            focus-within, so the affordance exists for someone tabbing through as
            well as for a mouse. Each tile carries LIMS's own icon (public/images/
            quick-actions) — supplied pre-built with its own light-teal circular
            backdrop, which is why there's no wrapping box here the way the old
            hand-drawn placeholders needed one: adding a second background behind an
            icon that already carries its own would double up. */}
        <Grid min="sm" className="mt-8 max-md:hidden">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-geo flex min-h-[48px] items-center gap-4 p-5 text-step-1
                         font-semibold text-teal-800"
            >
              <Image
                src={`/images/quick-actions/${action.icon}.png`}
                alt=""
                width={56}
                height={56}
                className="h-11 w-11 shrink-0"
              />
              {action.label}
            </Link>
          ))}
        </Grid>
      </Section>

      {/* -- Centres of Excellence ----------------------------------------- */}
      <Section tone="tint" labelledBy="centres-heading">
        <p className="eyebrow">Specialist care</p>
        <h2 id="centres-heading" className="mt-2 text-step-4">
          Centres of Excellence
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4 max-w-prose text-ink-950">
          Specialist teams across our clinical departments, with diagnostics, imaging and
          patient support services on the same campus.
        </p>
        {/* A vertical icon-over-label card reads as a scannable specialty index —
            closer to how a patient actually uses this grid (find the department at a
            glance) than the wider, horizontal icon-beside-text cards used elsewhere
            on the site, where the content is prose rather than a one-or-two-word
            label. .card-geo's own accent bar and cut corners carry over unchanged;
            only the content orientation and grid density are new.

            SERVICE_GRID_CLASSNAME / SERVICE_CARD_CLASSNAME (lib/service-grid.ts):
            shared with ServiceIndex and /centres, so all three render the identical
            grid and the identical card size — see that file for why a shared
            constant replaced each page's own copy. */}
        <div className={`mt-8 ${SERVICE_GRID_CLASSNAME}`}>
          {clinicalServices.map((service) => {
            const iconSrc = centreIconSrc(service.slug)
            return (
              <Link key={service.slug} href={serviceHref(service)} className={SERVICE_CARD_CLASSNAME}>
                {/* Icon-only where LIMS has supplied one (public/images/centres) —
                    conditional, not a generic fallback glyph, so a department without
                    an asset yet reads as "no icon" rather than a guess. */}
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt=""
                    width={SERVICE_ICON_SIZE}
                    height={SERVICE_ICON_SIZE}
                    loading="eager"
                    className={SERVICE_ICON_CLASSNAME}
                  />
                ) : null}
                <h3 className={SERVICE_TITLE_CLASSNAME}>{service.name}</h3>
              </Link>
            )
          })}
        </div>

        <p className="mt-8">
          <Link href="/centres" className="link-accent">
            All {SERVICES.length} services, including diagnostics and imaging
          </Link>
        </p>
      </Section>

      {/* -- Meet our consultants -------------------------------------------- */}
      {/* tone="warm" (copper-50) was reserved from the start for "human-centred
          content (patient stories)" and sat unused until now — see Section.tsx. A
          named consultant is exactly that kind of content, so this is its first use
          rather than a new tone invented for the job.

          DoctorCarousel renders the real roster from lib/doctors.ts, arrows-only (no
          autoplay — see the component's own header for why), and marks its bio/quote
          copy as an explicit sample until LIMS supplies the doctor's real words. */}
      <Section tone="warm" labelledBy="doctors-heading">
        <p className="eyebrow">Our consultants</p>
        <h2 id="doctors-heading" className="mt-2 text-step-4">
          Meet our consultants
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <div className="mt-8">
          <DoctorCarousel doctors={DOCTORS} />
        </div>
      </Section>

      {/*
        PHASE 1 — remaining sections, still deliberately not stubbed with invented
        content:
          • "Why LIMS" statistics   → needs verified figures from LIMS
          • Patient stories         → needs recorded patient consent before publication
          • Health packages teaser  → needs pricing sign-off

        The closing CTA band below needed none of that — it restates two actions
        already real on this page — so the homepage no longer trails off after the
        centres grid with no ending.
      */}

      {/* -- Closing CTA ----------------------------------------------------- */}
      <Section tone="dark" labelledBy="cta-heading">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-prose">
            <p className="eyebrow-on-dark">{siteConfig.shortName}, {siteConfig.city}</p>
            <h2 id="cta-heading" className="mt-2 text-step-3">
              Need to see a doctor, or reach us right now?
            </h2>
            <span className="rule-accent-lg mt-3" aria-hidden="true" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/appointments"
              className="btn-primary inline-flex min-h-[48px] items-center px-5 font-semibold"
            >
              Book an appointment
            </Link>
            <a
              href={`tel:${contact.primary}`}
              className="inline-flex min-h-[48px] items-center rounded-full border-2
                         border-white/40 px-5 font-semibold text-white transition-colors
                         ease-standard hover:border-white hover:bg-white/10"
            >
              Call {contact.primaryDisplay}
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}

