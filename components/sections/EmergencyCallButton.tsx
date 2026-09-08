'use client'

// components/sections/EmergencyCallButton.tsx
//
// The emergency control. Everything here is shaped by one rule: it must place a call
// even when this component does nothing at all.
//
// So it is a REAL <a href="tel:..."> rendered by the server, and the interception is
// pure enhancement layered on top. If the JS bundle fails, is blocked, or has not
// hydrated when someone taps — the case that matters, because a person in distress taps
// the instant the header paints — the browser follows the href and dials. A <button>
// that opens a dialog would have been the obvious implementation and would have been
// silently dead in exactly that window.
//
// WHY THE MODAL IS DESKTOP-ONLY
// A tel: link on a desktop browser either does nothing or throws the user into a
// handoff prompt for an app they may not have. On a phone it dials, which is the whole
// point. So the modal exists to give a desktop user something actionable — the number,
// in text, large enough to read across a room — and never gets in the way on a phone.
//
// The check is `(hover: hover) and (pointer: fine)`: a mouse-driven device, which is
// the closest CSS gets to asking "can this thing place a call?". It is NOT a width
// query and NOT user-agent sniffing — a 1200px browser window on a phone still dials,
// and a 700px window on a desktop still cannot.
//
// It is evaluated at CLICK time, not at mount. That means no state, no effect, no
// hydration mismatch, and it stays correct when a window is resized or a laptop is
// folded into a tablet between load and click.

import { useCallback, useRef } from 'react'

export interface EmergencyCallButtonProps {
  /** E.164, e.g. "+919254984121". Goes straight into the href. */
  phone: string
  /** Human-formatted, e.g. "+91 92549 84121". Shown in the dialog. */
  phoneDisplay: string
  className?: string
  children: React.ReactNode
}

export function EmergencyCallButton({
  phone,
  phoneDisplay,
  className = '',
  children,
}: EmergencyCallButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const close = useCallback(() => dialogRef.current?.close(), [])

  const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const dialog = dialogRef.current

    // Every one of these bails to the native tel: link rather than swallowing the
    // click. On this control, doing nothing is never an acceptable failure mode.
    if (!dialog || typeof dialog.showModal !== 'function') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    // Let a modified click do what the user asked (new tab, copy link, and so on).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    dialog.showModal()
  }, [])

  // Clicking the backdrop targets the <dialog> itself; clicking the panel targets a
  // child. Comparing against currentTarget is what separates the two without a
  // stopPropagation on the panel.
  const handleDialogClick = useCallback((event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) dialogRef.current?.close()
  }, [])

  return (
    <>
      <a href={`tel:${phone}`} onClick={handleClick} className={className}>
        {children}
      </a>

      {/*
        Native <dialog> with showModal(), not a hand-rolled overlay. It gives the
        things this dialog cannot be wrong about, implemented by the browser rather
        than by me: the background goes inert, focus is moved inside and trapped,
        Escape closes, and focus returns to the link on close. A div with
        role="dialog" would need all four written by hand and would get one of them
        wrong eventually.
      */}
      {/*
        The two disabled rules assume a click handler here leaves keyboard users without
        an equivalent. They do not: showModal() binds Escape to close, natively, and the
        Close button below is in the tab order. This handler adds click-the-backdrop for
        mouse users on top of both. Adding a keydown listener to satisfy the linter would
        duplicate Escape and risk fighting the browser's own handling.
      */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        aria-labelledby="emergency-dialog-heading"
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border
                   border-ink-200 bg-white p-0 text-ink-950 shadow-raised
                   backdrop:bg-ink-950/60"
      >
        <div className="p-6">
          <p className="eyebrow">Emergency</p>
          <h2
            id="emergency-dialog-heading"
            className="mt-2 font-serif text-step-2 text-teal-800"
          >
            Emergency line &mdash; call now
          </h2>
          <span className="rule-accent mt-3" aria-hidden="true" />

          <p className="mt-4 text-step--1 text-ink-950">
            This line is answered 24&times;7 at Lifeline Institute of Medical Sciences,
            Jindal Chowk, Hisar.
          </p>

          {/*
            The number as text, tabular and large. On the desktop this dialog exists
            for, reading the digits off the screen and dialling a handset is the most
            likely outcome, so legibility of the number IS the feature — the
            click-to-dial below it is the secondary path, not the primary one.
          */}
          <p className="mt-5 select-all font-serif text-step-3 tabular-nums text-teal-800">
            {phoneDisplay}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/*
              autoFocus: showModal() focuses the first focusable child, and this is
              the action someone opened the dialog to reach.
            */}
            <a
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              href={`tel:${phone}`}
              className="btn-primary inline-flex min-h-[44px] items-center px-5
                         font-semibold"
            >
              Call {phoneDisplay}
            </a>
            <button
              type="button"
              onClick={close}
              className="btn-secondary inline-flex min-h-[44px] items-center px-5
                         font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
