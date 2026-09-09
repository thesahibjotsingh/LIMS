// lib/centre-icons.ts
//
// Maps a clinical service slug to its icon under public/images/centres — real
// department icons, not the hand-drawn line pictograms in app/centres/page.tsx
// (those are category-level: one each for Clinical / Diagnostics / Support; these are
// per-department, and only exist where a real asset was supplied).
//
// Filenames match slugs exactly except one: the supplied asset uses the American
// spelling "pediatrics" where lib/services.ts's slug uses "paediatrics" (matching the
// British spelling the rest of the site uses). Mapped explicitly rather than
// renaming either — the slug drives real URLs and the filename is what's on disk.
const FILENAME_OVERRIDES: Record<string, string> = {
  'paediatrics-neonatology': 'pediatrics-neonatology',
}

const AVAILABLE_SLUGS = new Set([
  'anaesthesia-pain-management',
  'dentistry',
  'emergency-services',
  'ent',
  'gastroenterology',
  'general-laparoscopic-surgery',
  'general-medicine',
  'neurosurgery',
  'obstetrics-gynaecology',
  'ophthalmology',
  'ortho-joint-replacement',
  'paediatrics-neonatology',
  'spine-surgery',
  'trauma-management',
  'urology',
])

/** Icon path for a clinical service slug, or undefined where no asset exists yet —
 *  rendered conditionally at every call site rather than falling back to a generic
 *  icon, so a missing asset reads as absent, not as a guess. */
export function centreIconSrc(slug: string): string | undefined {
  if (!AVAILABLE_SLUGS.has(slug)) return undefined
  return `/images/centres/${FILENAME_OVERRIDES[slug] ?? slug}.png`
}
