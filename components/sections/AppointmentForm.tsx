'use client'

// components/sections/AppointmentForm.tsx
//
// The form behind every "Book appointment" / "Book an appointment" / "Request an
// appointment" button on the site. Same submission mechanics as
// RequestCallbackButton — a real form, POSTed with fetch so the response can update
// this component's own state instead of navigating the page — but inline on its own
// page rather than a dialog, because /appointments is itself the destination those
// buttons point at, not a panel raised over some other page.
//
// DEPARTMENT AND DOCTOR ARE BOTH OPTIONAL AND INDEPENDENT, NOT A CASCADING PAIR. A
// patient who knows they want "Orthopaedics" but has no doctor preference, and one who
// already knows they want Dr. Harshal Godara specifically, are both real cases — and
// with four consultants on the roster today, narrowing the doctor list by department
// with client JS would be machinery built for a roster ten times this size. Two plain
// selects cover both cases now; nothing here needs to change when the roster grows,
// only the options each select renders.

import { useCallback, useId, useRef, useState } from 'react'
import Link from 'next/link'
import type { Doctor } from '@/types'
import type { ClinicalService, ServiceCategoryDefinition } from '@/lib/services'

export interface AppointmentFormProps {
  categories: ServiceCategoryDefinition[]
  servicesByCategory: Record<string, ClinicalService[]>
  doctors: Doctor[]
  /** ISO date, e.g. "2026-09-08" — today, computed server-side so the date field's
   *  `min` reflects the visitor's actual request time rather than build time. */
  todayIso: string
}

type Status = 'idle' | 'pending' | 'success' | 'error'

/**
 * Field-level validation, run on submit.
 *
 * `noValidate` on the <form> below turns off the browser's own tooltips, which is why
 * this exists at all — without it, a malformed phone number was silently rejected only
 * after a round trip to the server, with no indication of which field was wrong. Kept
 * deliberately loose: this checks shape (digit count, an @ and a dot), never content a
 * patient might legitimately type differently than expected.
 */
interface FieldErrors {
  name?: string
  phone?: string
  email?: string
  preferredDate?: string
}

const FIELD_ORDER = ['name', 'phone', 'email', 'preferredDate'] as const

function validate(formData: FormData, todayIso: string): FieldErrors {
  const errors: FieldErrors = {}

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  if (!name) errors.name = 'Enter your name.'

  const phone = (formData.get('phone') as string | null)?.trim() ?? ''
  const phoneDigits = phone.replace(/\D/g, '')
  if (!phone) {
    errors.phone = 'Enter a phone number we can reach you on.'
  } else if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    errors.phone = 'Enter a valid phone number, e.g. 98765 43210.'
  }

  const email = (formData.get('email') as string | null)?.trim() ?? ''
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address, or leave it blank.'
  }

  const preferredDate = (formData.get('preferredDate') as string | null)?.trim() ?? ''
  if (preferredDate && preferredDate < todayIso) {
    errors.preferredDate = 'Choose a date from today onward.'
  }

  return errors
}

export function AppointmentForm({
  categories,
  servicesByCategory,
  doctors,
  todayIso,
}: AppointmentFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const errorId = useId()

  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  /** Clears one field's error the moment its value changes, rather than making a
   *  patient re-submit to find out the fix worked. */
  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const validationErrors = validate(formData, todayIso)
    setFieldErrors(validationErrors)

    const firstInvalidField = FIELD_ORDER.find((field) => validationErrors[field])
    if (firstInvalidField === 'name') nameRef.current?.focus()
    else if (firstInvalidField === 'phone') phoneRef.current?.focus()
    else if (firstInvalidField === 'email') emailRef.current?.focus()
    else if (firstInvalidField === 'preferredDate') dateRef.current?.focus()
    if (firstInvalidField) return

    setStatus('pending')
    setErrorMessage('')

    try {
      const response = await fetch('/api/request-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          department: formData.get('department'),
          doctorId: formData.get('doctorId'),
          preferredDate: formData.get('preferredDate'),
          preferredTime: formData.get('preferredTime'),
          message: formData.get('message'),
          website: formData.get('website'),
        }),
      })

      const result = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setStatus('error')
        setErrorMessage(result.error || 'Something went wrong. Please call us instead.')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Could not reach the server. Check your connection and try again.')
    }
  }, [todayIso])

  if (status === 'success') {
    return (
      <div className="card-geo max-w-prose p-6">
        <p className="eyebrow">Request sent</p>
        <h2 className="mt-2 font-serif text-step-2 text-teal-800">
          We&rsquo;ll be in touch
        </h2>
        <span className="rule-accent mt-3" aria-hidden="true" />
        <p className="mt-4 text-step--1 text-ink-950">
          Thank you. Our appointments team will call you to confirm a time.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setFieldErrors({})
            formRef.current?.reset()
          }}
          className="btn-secondary mt-6 inline-flex min-h-[48px] items-center px-5
                     font-semibold"
        >
          Request another appointment
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="max-w-2xl space-y-5">
      {/* Honeypot — see the matching note in RequestCallbackButton and the route
          handler. Never visible, never reachable by keyboard, never announced. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="appointment-website">Leave this field blank</label>
        <input id="appointment-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="appointment-name" className="block text-step--1 font-semibold text-ink-950">
            Name
          </label>
          <input
            ref={nameRef}
            id="appointment-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'appointment-name-error' : undefined}
            onChange={() => clearFieldError('name')}
            className={`mt-1.5 h-12 w-full rounded-full border-2 bg-white px-4 text-step--1
                        text-ink-950 focus:outline-none focus:ring-0 ${
                          fieldErrors.name
                            ? 'border-emergency focus:border-emergency'
                            : 'border-ink-200 focus:border-teal-600'
                        }`}
          />
          {fieldErrors.name ? (
            <p id="appointment-name-error" role="alert" className="mt-1.5 text-[0.8rem] text-emergency">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="appointment-phone" className="block text-step--1 font-semibold text-ink-950">
            Phone number
          </label>
          <input
            ref={phoneRef}
            id="appointment-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'appointment-phone-error' : undefined}
            onChange={() => clearFieldError('phone')}
            className={`mt-1.5 h-12 w-full rounded-full border-2 bg-white px-4 text-step--1
                        text-ink-950 focus:outline-none focus:ring-0 ${
                          fieldErrors.phone
                            ? 'border-emergency focus:border-emergency'
                            : 'border-ink-200 focus:border-teal-600'
                        }`}
          />
          {fieldErrors.phone ? (
            <p id="appointment-phone-error" role="alert" className="mt-1.5 text-[0.8rem] text-emergency">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="appointment-email" className="block text-step--1 font-semibold text-ink-950">
          Email <span className="font-normal text-ink-600">(optional)</span>
        </label>
        <input
          ref={emailRef}
          id="appointment-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'appointment-email-error' : undefined}
          onChange={() => clearFieldError('email')}
          className={`mt-1.5 h-12 w-full rounded-full border-2 bg-white px-4 text-step--1
                      text-ink-950 focus:outline-none focus:ring-0 ${
                        fieldErrors.email
                          ? 'border-emergency focus:border-emergency'
                          : 'border-ink-200 focus:border-teal-600'
                      }`}
        />
        {fieldErrors.email ? (
          <p id="appointment-email-error" role="alert" className="mt-1.5 text-[0.8rem] text-emergency">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="appointment-department" className="block text-step--1 font-semibold text-ink-950">
            Department <span className="font-normal text-ink-600">(optional)</span>
          </label>
          <select
            id="appointment-department"
            name="department"
            defaultValue=""
            className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                       px-4 text-step--1 text-ink-950 focus:border-teal-600
                       focus:outline-none focus:ring-0"
          >
            <option value="">No preference</option>
            {categories.map((category) => (
              <optgroup key={category.id} label={category.name}>
                {servicesByCategory[category.id]?.map((service) => (
                  <option key={service.slug} value={service.slug}>
                    {service.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="appointment-doctor" className="block text-step--1 font-semibold text-ink-950">
            Doctor <span className="font-normal text-ink-600">(optional)</span>
          </label>
          <select
            id="appointment-doctor"
            name="doctorId"
            defaultValue=""
            className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                       px-4 text-step--1 text-ink-950 focus:border-teal-600
                       focus:outline-none focus:ring-0"
          >
            <option value="">No preference</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="appointment-date" className="block text-step--1 font-semibold text-ink-950">
            Preferred date <span className="font-normal text-ink-600">(optional)</span>
          </label>
          <input
            ref={dateRef}
            id="appointment-date"
            name="preferredDate"
            type="date"
            min={todayIso}
            aria-invalid={Boolean(fieldErrors.preferredDate)}
            aria-describedby={fieldErrors.preferredDate ? 'appointment-date-error' : undefined}
            onChange={() => clearFieldError('preferredDate')}
            className={`mt-1.5 h-12 w-full rounded-full border-2 bg-white px-4 text-step--1
                        text-ink-950 focus:outline-none focus:ring-0 ${
                          fieldErrors.preferredDate
                            ? 'border-emergency focus:border-emergency'
                            : 'border-ink-200 focus:border-teal-600'
                        }`}
          />
          {fieldErrors.preferredDate ? (
            <p id="appointment-date-error" role="alert" className="mt-1.5 text-[0.8rem] text-emergency">
              {fieldErrors.preferredDate}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="appointment-time" className="block text-step--1 font-semibold text-ink-950">
            Preferred time <span className="font-normal text-ink-600">(optional)</span>
          </label>
          <input
            id="appointment-time"
            name="preferredTime"
            type="text"
            placeholder="e.g. weekday mornings"
            className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                       px-4 text-step--1 text-ink-950 placeholder:text-ink-400
                       focus:border-teal-600 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="appointment-message" className="block text-step--1 font-semibold text-ink-950">
          Reason for visit <span className="font-normal text-ink-600">(optional)</span>
        </label>
        <textarea
          id="appointment-message"
          name="message"
          rows={4}
          maxLength={1000}
          className="mt-1.5 w-full rounded-lg border-2 border-ink-200 bg-white p-4
                     text-step--1 text-ink-950 focus:border-teal-600 focus:outline-none
                     focus:ring-0"
        />
      </div>

      {status === 'error' ? (
        <p
          id={errorId}
          role="alert"
          className="rounded border border-emergency/30 bg-emergency/5 p-3 text-step--1
                     text-emergency"
        >
          {errorMessage}
        </p>
      ) : null}

      <p className="text-[0.75rem] text-ink-600">
        We&rsquo;ll only use these details to confirm your appointment. See our{' '}
        <Link href="/privacy" className="link-accent">
          privacy notice
        </Link>
        .
      </p>

      <button
        type="submit"
        disabled={status === 'pending'}
        aria-describedby={status === 'error' ? errorId : undefined}
        className="btn-primary inline-flex min-h-[48px] items-center gap-2 px-5 font-semibold
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'pending' ? (
          <>
            {/* animate-spin is a standard CSS animation, so the sitewide
                prefers-reduced-motion guard in globals.css already collapses it to a
                static ring for anyone who asks — no separate guard needed here. */}
            <SpinnerIcon className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Request appointment'
        )}
      </button>
    </form>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
