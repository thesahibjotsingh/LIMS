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

export function AppointmentForm({
  categories,
  servicesByCategory,
  doctors,
  todayIso,
}: AppointmentFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const errorId = useId()

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

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
  }, [])

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
            id="appointment-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                       px-4 text-step--1 text-ink-950 focus:border-teal-600
                       focus:outline-none focus:ring-0"
          />
        </div>

        <div>
          <label htmlFor="appointment-phone" className="block text-step--1 font-semibold text-ink-950">
            Phone number
          </label>
          <input
            id="appointment-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                       px-4 text-step--1 text-ink-950 focus:border-teal-600
                       focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="appointment-email" className="block text-step--1 font-semibold text-ink-950">
          Email <span className="font-normal text-ink-600">(optional)</span>
        </label>
        <input
          id="appointment-email"
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                     px-4 text-step--1 text-ink-950 focus:border-teal-600
                     focus:outline-none focus:ring-0"
        />
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
            id="appointment-date"
            name="preferredDate"
            type="date"
            min={todayIso}
            className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200 bg-white
                       px-4 text-step--1 text-ink-950 focus:border-teal-600
                       focus:outline-none focus:ring-0"
          />
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
        className="btn-primary inline-flex min-h-[48px] items-center px-5 font-semibold
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'pending' ? 'Sending…' : 'Request appointment'}
      </button>
    </form>
  )
}
