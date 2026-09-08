// components/sections/ServiceDetail.tsx
//
// The body shared by /specialities/[slug], /services/[slug] and /patient-care/[slug].
//
// One page shape, three route prefixes. The prefix is the only difference between them,
// and it comes from the service's own category — so a service moving between categories
// moves its URL and keeps this page unchanged.
//
// It deliberately does NOT carry an overview, conditions treated, procedures offered,
// equipment or facilities. Those are the Department record and they arrive in Phase 2
// from LIMS. Generating them would mean writing clinical claims about what a hospital
// treats and what it can perform, which is the single worst thing to invent on a site
// like this — and it would read as authoritative precisely because it sits under the
// hospital's own name.
//
// Server component.

import Link from 'next/link'
import { Section } from '@/components/primitives/Section'
import { getDoctorsByDepartment, registrationDisplay } from '@/lib/doctors'
import { getCategory, type ClinicalService } from '@/lib/services'
import { contact, siteConfig } from '@/lib/site-config'

const CATEGORY_EYEBROW = {
  clinical: 'Clinical department',
  diagnostics: 'Diagnostics & imaging',
  support: 'Patient support service',
} as const

export function ServiceDetail({ service }: { service: ClinicalService }) {
  const doctors = getDoctorsByDepartment(service.slug)
  const category = getCategory(service.category)

  return (
    <>
      <Section tone="tint" labelledBy="service-heading">
        <p className="eyebrow">{CATEGORY_EYEBROW[service.category]}</p>
        <h1 id="service-heading" className="mt-2 text-step-4">
          {service.name}
        </h1>
        {/* Alternative names are shown because a patient arrives holding a referral
            slip that may use either wording. */}
        {service.alsoKnownAs?.length ? (
          <p className="mt-2 text-step-0 text-ink-600">
            Also known as {service.alsoKnownAs.join(', ')}
          </p>
        ) : null}
        <span className="rule-accent-lg mt-3" aria-hidden="true" />
      </Section>

      <Section labelledBy="consultants-heading">
        {/*
          DEMO TREATMENT — applied to this file only, to evaluate against the site's
          existing card/spacing language before extending it further.

          7/5 SPLIT. The consultant list is the primary content (7 of 12 columns); the
          enquiry card beside it is a standing "scanning tool" — the one thing a patient
          who has NOT found their consultant yet still needs on the same screen, not
          buried after the grid. Stacks to one column below lg, where a side-by-side
          split has no room to mean anything.
        */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="consultants-heading" className="text-step-3">
              {doctors.length > 0 ? 'Consultants' : 'Enquiries'}
            </h2>
            <span className="rule-accent mt-3" aria-hidden="true" />

            {doctors.length === 0 ? (
              <p className="mt-4 max-w-prose">
                {/* No claim either way about staffing: LIMS has supplied the service
                    list and four consultants, and the two do not yet line up one to
                    one. */}
                Consultant details for this service are being added. To ask about{' '}
                {service.name.toLowerCase()} at {siteConfig.shortName}, call{' '}
                <a href={`tel:${contact.secondary}`} className="link-accent">
                  {contact.secondaryDisplay}
                </a>
                .
              </p>
            ) : (
              <ul className="mt-6 flex flex-col gap-5">
                {doctors.map((doctor) => (
                  <li key={doctor.id}>
                    <article
                      className="card-geo flex flex-col gap-4 p-6 sm:flex-row
                                 sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="text-step-1">
                          <Link
                            href={`/doctors/${doctor.id}`}
                            className="text-teal-800 underline-offset-4 hover:underline"
                          >
                            {doctor.name}
                          </Link>
                        </h3>

                        {doctor.designation ? (
                          <p className="mt-1 text-step-0">{doctor.designation}</p>
                        ) : null}

                        {/*
                          EXPLICIT SEMANTIC MARKUP: a definition list for the doctor's
                          structured facts rather than a stack of unrelated <p> tags —
                          qualifications and a registration number are name/value pairs,
                          and <dl> says so to assistive tech instead of leaving it to be
                          inferred from visual order.
                        */}
                        {doctor.qualifications || doctor.registrationNumber ? (
                          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-step--1">
                            {doctor.qualifications ? (
                              <div>
                                <dt className="sr-only">Qualifications</dt>
                                <dd className="text-ink-600">{doctor.qualifications}</dd>
                              </div>
                            ) : null}
                            {doctor.registrationNumber ? (
                              <div>
                                <dt className="inline font-semibold text-ink-600">
                                  Reg. no.{' '}
                                </dt>
                                <dd className="inline tabular-nums text-ink-600">
                                  {registrationDisplay(doctor.registrationNumber)}
                                </dd>
                              </div>
                            ) : null}
                          </dl>
                        ) : null}
                      </div>

                      <Link
                        href={`/doctors/${doctor.id}`}
                        className="card-cta inline-flex min-h-[48px] shrink-0 items-center self-start px-4"
                      >
                        View profile
                        <span className="sr-only"> of {doctor.name}</span>
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            {/* Back to the section this page belongs to, not to a generic index. */}
            <p className="mt-10">
              <Link href={category.basePath} className="link-accent">
                All {category.pageTitle.toLowerCase()}
              </Link>
            </p>
          </div>

          {/*
            THE SCANNING TOOL. copper-50 marks it as the same "warm, human" tone the
            token system reserves for patient-facing contact moments (see
            Section.tsx's `warm` tone), so it reads as a distinct instrument beside the
            consultant list rather than one more white card in the row.
          */}
          <aside
            aria-labelledby="enquire-heading"
            className="h-fit rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md
                       border border-copper-200 bg-copper-50 p-6
                       shadow-[0_2px_4px_rgba(156,74,40,0.05),0_12px_28px_rgba(156,74,40,0.10)]
                       lg:sticky lg:top-24 lg:col-span-5"
          >
            <p className="eyebrow">Direct enquiry</p>
            <h2 id="enquire-heading" className="mt-2 text-step-1">
              Ask about {service.name}
            </h2>
            <span className="rule-accent mt-3" aria-hidden="true" />
            <p className="mt-4 text-step--1 text-ink-950">
              Speak to the {service.name.toLowerCase()} desk directly — the fastest way
              to confirm availability before you travel.
            </p>

            <dl className="mt-5 space-y-3 text-step--1">
              <div className="flex justify-between gap-4 border-t border-copper-200 pt-3">
                <dt className="font-semibold text-ink-950">Department</dt>
                <dd className="text-right text-ink-600">{category.name}</dd>
              </div>
              {service.alsoKnownAs?.length ? (
                <div className="flex justify-between gap-4 border-t border-copper-200 pt-3">
                  <dt className="font-semibold text-ink-950">Also known as</dt>
                  <dd className="text-right text-ink-600">
                    {service.alsoKnownAs.join(', ')}
                  </dd>
                </div>
              ) : null}
            </dl>

            <a
              href={`tel:${contact.secondary}`}
              className="btn-primary mt-6 inline-flex min-h-[48px] w-full items-center
                         justify-center px-5 font-semibold"
            >
              Call {contact.secondaryDisplay}
            </a>
          </aside>
        </div>
      </Section>
    </>
  )
}
