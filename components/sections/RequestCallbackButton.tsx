'use client'

// components/sections/RequestCallbackButton.tsx
//
// A lower-commitment third path alongside "call us" and the full appointment flow — for
// someone who cannot talk right now but still wants to be reached. Submits to
// app/api/request-callback/route.ts, which relays it to a staff inbox by email; nothing
// is stored anywhere else, so this is the only record of the request until Phase 2 gives
// it somewhere durable to live.
//
// SAME DIALOG MECHANISM AS EmergencyCallButton: a native <dialog> with showModal(). The
// background goes inert, focus is trapped inside, Escape closes it, and focus returns to
// the trigger on close — implemented by the browser, not by hand. This one holds a form
// instead of a phone number, but the open/close plumbing is deliberately identical rather
// than reinvented.
//
// A REAL <form>, POSTed with fetch rather than a native submit. A native POST to a Route
// Handler would navigate the browser to the handler's JSON response, which is wrong for a
// dialog that should report success in place. fetch keeps the request itself simple —
// still a real submit event, still working through normal form validation — while letting
// the response update this component's own state instead of replacing the page.
//
// THE HONEYPOT FIELD IS INVISIBLE TWICE OVER: aria-hidden so assistive tech never
// announces it, and tabIndex={-1} so keyboard users never tab into it. A real patient can
// never fill it in either way. See the matching note in the route handler for what
// happens if it arrives non-empty.

import Link from 'next/link'
import { useCallback, useId, useRef, useState } from 'react'

export interface RequestCallbackButtonProps {
  className?: string
  children: React.ReactNode
}

type Status = 'idle' | 'pending' | 'success' | 'error'

export function RequestCallbackButton({ className = '', children }: RequestCallbackButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const headingId = useId()
  const errorId = useId()

  const openDialog = useCallback(() => {
    dialogRef.current?.showModal()
  }, [])

  const closeDialog = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // Resets to a blank, idle form the next time it opens — a patient who successfully
  // sent one request and comes back later should not see yesterday's confirmation.
  const onDialogClose = useCallback(() => {
    setStatus('idle')
    setErrorMessage('')
    formRef.current?.reset()
  }, [])

  const onDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) closeDialog()
    },
    [closeDialog],
  )

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setStatus('pending')
    setErrorMessage('')

    try {
      const response = await fetch('/api/request-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          preferredTime: formData.get('preferredTime'),
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

  return (
    <>
      <button type="button" onClick={openDialog} className={className}>
        {children}
      </button>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        onClose={onDialogClose}
        aria-labelledby={headingId}
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-ink-200
                   bg-white p-0 text-ink-950 shadow-raised backdrop:bg-ink-950/60"
      >
        <div className="p-6">
          {status === 'success' ? (
            <>
              <p className="eyebrow">Request sent</p>
              <h2 id={headingId} className="mt-2 font-serif text-step-2 text-teal-800">
                We&rsquo;ll call you back
              </h2>
              <span className="rule-accent mt-3" aria-hidden="true" />
              <p className="mt-4 text-step--1 text-ink-950">
                Thank you. A member of our team will call you back as soon as they can.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="btn-secondary inline-flex min-h-[48px] items-center px-5
                             font-semibold"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Request a call back</p>
              <h2 id={headingId} className="mt-2 font-serif text-step-2 text-teal-800">
                Leave your number
              </h2>
              <span className="rule-accent mt-3" aria-hidden="true" />
              <p className="mt-4 text-step--1 text-ink-950">
                Tell us who you are and how to reach you, and someone from our team will
                call you back.
              </p>

              <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
                {/* Honeypot — see the file header note. Never visible, never reachable
                    by keyboard, never announced by a screen reader. */}
                <div aria-hidden="true" className="hidden">
                  <label htmlFor="callback-website">Leave this field blank</label>
                  <input
                    id="callback-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="callback-name"
                    className="block text-step--1 font-semibold text-ink-950"
                  >
                    Name
                  </label>
                  <input
                    id="callback-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    // showModal() focuses the first focusable child regardless; this
                    // just names which one, the same way EmergencyCallButton's own
                    // primary action does.
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200
                               bg-white px-4 text-step--1 text-ink-950
                               focus:border-teal-600 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="callback-phone"
                    className="block text-step--1 font-semibold text-ink-950"
                  >
                    Phone number
                  </label>
                  <input
                    id="callback-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200
                               bg-white px-4 text-step--1 text-ink-950
                               focus:border-teal-600 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="callback-email"
                    className="block text-step--1 font-semibold text-ink-950"
                  >
                    Email <span className="font-normal text-ink-600">(optional)</span>
                  </label>
                  <input
                    id="callback-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200
                               bg-white px-4 text-step--1 text-ink-950
                               focus:border-teal-600 focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="callback-preferred-time"
                    className="block text-step--1 font-semibold text-ink-950"
                  >
                    Preferred time to call{' '}
                    <span className="font-normal text-ink-600">(optional)</span>
                  </label>
                  <input
                    id="callback-preferred-time"
                    name="preferredTime"
                    type="text"
                    placeholder="e.g. weekday mornings"
                    className="mt-1.5 h-12 w-full rounded-full border-2 border-ink-200
                               bg-white px-4 text-step--1 text-ink-950
                               placeholder:text-ink-400 focus:border-teal-600
                               focus:outline-none focus:ring-0"
                  />
                </div>

                {status === 'error' ? (
                  <p
                    id={errorId}
                    role="alert"
                    className="rounded border border-emergency/30 bg-emergency/5 p-3
                               text-step--1 text-emergency"
                  >
                    {errorMessage}
                  </p>
                ) : null}

                <p className="text-[0.75rem] text-ink-600">
                  We&rsquo;ll only use these details to call you back about this enquiry.
                  See our{' '}
                  <Link href="/privacy" className="link-accent">
                    privacy notice
                  </Link>
                  .
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={status === 'pending'}
                    aria-describedby={status === 'error' ? errorId : undefined}
                    className="btn-primary inline-flex min-h-[48px] items-center px-5
                               font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'pending' ? 'Sending…' : 'Request a call back'}
                  </button>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="btn-secondary inline-flex min-h-[48px] items-center px-5
                               font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </dialog>
    </>
  )
}
