// app/api/request-callback/route.ts
//
// Receives the "Request a call back" form and relays it to Resend as an email to the
// staff inbox that watches NOTIFY_EMAIL. Nothing here is stored — this route has no
// database to write to yet, so a submission that is not read as an email is gone.
// Phase 2 email/CRM ownership can add persistence without changing the form.
//
// edge RUNTIME, EXPLICITLY, LIKE app/doctors/page.tsx. Cloudflare Pages runs on
// Workers, not Node — an API route without this declaration builds locally and then
// fails in production the first time it touches something Workers does not have (a
// Node global, a Node-only fetch option). Declaring it here, in this file, keeps the
// requirement local to the one route that needs it rather than forcing every page in
// the app to become edge-runtime to keep a single form working.
//
// NO PERSONAL DATA IN THE URL OR IN LOGS. The payload is read from a POST body, never a
// query string (see the DPDP note in app/doctors/page.tsx for why that line matters on
// this codebase), and nothing here calls console.log on the parsed fields — a callback
// request carries a name and a phone number, which is exactly the patient data class
// this platform is careful not to leave lying around in a request log.
export const runtime = 'edge'

import { escapeForEmail, isPlausibleEmail, isPlausiblePhone, sendNotificationEmail } from '@/lib/send-notification-email'

interface CallbackPayload {
  name?: unknown
  phone?: unknown
  email?: unknown
  preferredTime?: unknown
  /** Honeypot. Real patients never see or fill this field — see the note below. */
  website?: unknown
}

const NAME_MAX = 120
const PHONE_MAX = 20
const EMAIL_MAX = 200
const PREFERRED_TIME_MAX = 60

export async function POST(request: Request): Promise<Response> {
  let body: CallbackPayload
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Malformed request.' }, { status: 400 })
  }

  // THE HONEYPOT. `website` is a field a real patient's form never shows — it is
  // visually hidden and marked aria-hidden in RequestCallbackButton, so nothing a
  // screen-reader or keyboard user does ever reaches it. A script filling in "every
  // field it finds" fills this one too. Reporting success without sending anything
  // costs the bot nothing to notice, which is the point: it stops retrying with a
  // slightly different payload the way a hard 4xx invites it to.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ ok: true })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const preferredTime = typeof body.preferredTime === 'string' ? body.preferredTime.trim() : ''

  if (!name || name.length > NAME_MAX) {
    return Response.json({ error: 'Enter your name.' }, { status: 422 })
  }
  if (!phone || phone.length > PHONE_MAX || !isPlausiblePhone(phone)) {
    return Response.json({ error: 'Enter a phone number we can call you back on.' }, { status: 422 })
  }
  if (email && (email.length > EMAIL_MAX || !isPlausibleEmail(email))) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 422 })
  }
  if (preferredTime.length > PREFERRED_TIME_MAX) {
    return Response.json({ error: 'Preferred time is too long.' }, { status: 422 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.NOTIFY_EMAIL
  if (!apiKey || !notifyEmail) {
    // A missing env var is a deployment mistake, not a patient's mistake — the message
    // stays generic and actionable (call instead) rather than exposing configuration
    // state to whoever is submitting the form.
    return Response.json(
      { error: 'This form is not accepting requests right now. Please call us instead.' },
      { status: 503 },
    )
  }

  const sent = await sendNotificationEmail({
    apiKey,
    to: notifyEmail,
    replyTo: email || undefined,
    subject: `Call back request — ${name}`,
    text: [
      `Name: ${escapeForEmail(name)}`,
      `Phone: ${escapeForEmail(phone)}`,
      `Email: ${email ? escapeForEmail(email) : 'Not provided'}`,
      `Preferred callback time: ${preferredTime ? escapeForEmail(preferredTime) : 'Not specified'}`,
      '',
      'Submitted from the "Request a call back" form on limshisar.com.',
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
