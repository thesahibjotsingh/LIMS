// lib/send-notification-email.ts
//
// The one place that calls Resend. app/api/request-callback/route.ts and
// app/api/request-appointment/route.ts both relay a patient-submitted form to a staff
// inbox, and both need the identical mechanics to do it — the same auth header, the
// same JSON shape, the same "did it actually send" check. Two copies of that is exactly
// how lib/services.ts's own header note says a hospital site accumulates drift: it is
// the same warning that produced serviceHref() so a service's URL exists in one place
// instead of three. This is that fix applied to outbound email instead of inbound
// routing.
//
// edge RUNTIME ONLY. This calls fetch() and nothing else — no Node APIs — so it works
// unchanged inside either edge-runtime route that imports it.

interface SendNotificationEmailArgs {
  apiKey: string
  to: string
  subject: string
  text: string
  /** Set when the submitter left an address, so a reply goes straight to them instead
   *  of bouncing off the no-reply sender. */
  replyTo?: string
}

/**
 * Relays one plain-text notification through Resend. Returns false rather than
 * throwing on a non-2xx response — the caller decides what a failed send means for the
 * patient-facing message, and a thrown error here would otherwise surface as a generic
 * 500 with no chance to say "please call us instead."
 */
export async function sendNotificationEmail({
  apiKey,
  to,
  subject,
  text,
  replyTo,
}: SendNotificationEmailArgs): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // onboarding@resend.dev is Resend's shared sandbox sender — works with zero
      // setup, but Resend will only deliver mail sent from it to the email address on
      // the Resend account itself. Swap this for a limshisar.com address once that
      // domain is verified in the Resend dashboard — see .env.example.
      from: 'LIMS Website <onboarding@resend.dev>',
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
    }),
  })

  return response.ok
}

/** Escapes the characters that would otherwise let a pasted value distort the plain-text
 *  email layout. Not a security boundary — a mail client renders plain text literally —
 *  just keeps a name or message containing "<" or "&" showing as what was typed. */
export function escapeForEmail(value: string): string {
  return value.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[char] ?? char)
}

/** Loose on purpose — see the identical note in the callback route this was lifted
 *  from. Counts digits after stripping punctuation rather than matching one format. */
export function isPlausiblePhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
