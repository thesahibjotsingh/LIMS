// app/api/request-appointment/route.ts
//
// Receives the /appointments form and relays it to Resend, the same way
// app/api/request-callback/route.ts does — see lib/send-notification-email.ts for the
// shared mechanics both routes call through.
//
// THIS IS THE ROUTE EVERY "Book appointment" BUTTON ON THE SITE ULTIMATELY FEEDS. The
// header CTA on every page, the hero, every doctor profile's "Request an appointment" —
// all of them link to /appointments, and until this route existed that page, and every
// one of those buttons, was a dead end. Treat changes here with the weight that implies.
//
// edge RUNTIME, EXPLICITLY, LIKE app/doctors/page.tsx and request-callback's route —
// see that file's note for why it has to be declared per-route on Cloudflare Pages.
export const runtime = 'edge'

import { getService } from '@/lib/services'
import { getDoctor } from '@/lib/doctors'
import {
  escapeForEmail,
  isPlausibleEmail,
  isPlausiblePhone,
  sendNotificationEmail,
} from '@/lib/send-notification-email'

interface AppointmentPayload {
  name?: unknown
  phone?: unknown
  email?: unknown
  department?: unknown
  doctorId?: unknown
  preferredDate?: unknown
  preferredTime?: unknown
  message?: unknown
  /** Honeypot — see the identical note in request-callback/route.ts. */
  website?: unknown
}

const NAME_MAX = 120
const PHONE_MAX = 20
const EMAIL_MAX = 200
const PREFERRED_TIME_MAX = 60
const MESSAGE_MAX = 1000

export async function POST(request: Request): Promise<Response> {
  let body: AppointmentPayload
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Malformed request.' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ ok: true })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const departmentSlug = typeof body.department === 'string' ? body.department.trim() : ''
  const doctorId = typeof body.doctorId === 'string' ? body.doctorId.trim() : ''
  const preferredDate = typeof body.preferredDate === 'string' ? body.preferredDate.trim() : ''
  const preferredTime = typeof body.preferredTime === 'string' ? body.preferredTime.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || name.length > NAME_MAX) {
    return Response.json({ error: 'Enter your name.' }, { status: 422 })
  }
  if (!phone || phone.length > PHONE_MAX || !isPlausiblePhone(phone)) {
    return Response.json({ error: 'Enter a phone number we can reach you on.' }, { status: 422 })
  }
  if (email && (email.length > EMAIL_MAX || !isPlausibleEmail(email))) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 422 })
  }
  if (preferredTime.length > PREFERRED_TIME_MAX) {
    return Response.json({ error: 'Preferred time is too long.' }, { status: 422 })
  }
  if (message.length > MESSAGE_MAX) {
    return Response.json({ error: 'That message is too long.' }, { status: 422 })
  }

  // department and doctorId both resolve against the live catalogue rather than being
  // trusted as free text — the same discipline serviceHref() enforces elsewhere. A
  // request naming a department or doctor that does not exist (a stale value from a
  // cached page, a hand-crafted request) is treated as "not specified" rather than
  // forwarded as fact to whoever reads the inbox.
  const department = departmentSlug ? getService(departmentSlug) : undefined
  const doctor = doctorId ? getDoctor(doctorId) : undefined

  // preferredDate, if present, must be a real calendar date and not in the past — a
  // browser's <input type="date"> already constrains this client-side, but the server
  // is the one place that request is guaranteed to have actually gone through it.
  let preferredDateDisplay = 'Not specified'
  if (preferredDate) {
    const parsed = new Date(`${preferredDate}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (Number.isNaN(parsed.getTime())) {
      return Response.json({ error: 'That preferred date does not look right.' }, { status: 422 })
    }
    if (parsed < today) {
      return Response.json({ error: 'Preferred date cannot be in the past.' }, { status: 422 })
    }
    preferredDateDisplay = parsed.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const apiKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.NOTIFY_EMAIL
  if (!apiKey || !notifyEmail) {
    return Response.json(
      { error: 'This form is not accepting requests right now. Please call us instead.' },
      { status: 503 },
    )
  }

  const sent = await sendNotificationEmail({
    apiKey,
    to: notifyEmail,
    replyTo: email || undefined,
    subject: `Appointment request — ${name}${department ? ` (${department.name})` : ''}`,
    text: [
      `Name: ${escapeForEmail(name)}`,
      `Phone: ${escapeForEmail(phone)}`,
      `Email: ${email ? escapeForEmail(email) : 'Not provided'}`,
      `Department: ${department ? escapeForEmail(department.name) : 'Not specified'}`,
      `Doctor: ${doctor ? escapeForEmail(doctor.name) : 'No preference'}`,
      `Preferred date: ${preferredDateDisplay}`,
      `Preferred time: ${preferredTime ? escapeForEmail(preferredTime) : 'Not specified'}`,
      `Message: ${message ? escapeForEmail(message) : 'None'}`,
      '',
      'Submitted from the "Book an appointment" form on limshisar.com.',
    ].join('\n'),
  })

  if (!sent) {
    return Response.json(
      { error: 'Could not send your request right now. Please call us instead.' },
      { status: 502 },
    )
  }

  return Response.json({ ok: true })
}
