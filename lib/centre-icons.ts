// lib/centre-icons.ts
//
// Maps a service slug to its icon, real per-department icons rather than the
// hand-drawn category-level pictograms in app/centres/page.tsx (those are one each
// for Clinical / Diagnostics / Support; these are one per service, and only exist
// where LIMS supplied a real asset for it).
//
// One folder per category under public/images, matching the category's own basePath
// naming so the mapping is easy to audit against lib/services.ts:
//   clinical  -> public/images/centres        (all 15 services have an icon)
//   diagnostics -> public/images/diagnostics  (6 of 7 — no ct-scan-x-ray icon yet)
//   support   -> public/images/patient-care   (all 4 services have an icon)
const ICON_DIRS: Record<string, string> = {
  'anaesthesia-pain-management': 'centres',
  dentistry: 'centres',
  'emergency-services': 'centres',
  ent: 'centres',
  gastroenterology: 'centres',
  'general-laparoscopic-surgery': 'centres',
  'general-medicine': 'centres',
  neurosurgery: 'centres',
  'obstetrics-gynaecology': 'centres',
  ophthalmology: 'centres',
  'ortho-joint-replacement': 'centres',
  'paediatrics-neonatology': 'centres',
  'spine-surgery': 'centres',
  'trauma-management': 'centres',
  urology: 'centres',

  'color-doppler': 'diagnostics',
  'echocardiogram-tmt': 'diagnostics',
  endoscopy: 'diagnostics',
  'pathology-microbiology': 'diagnostics',
  'radiology-imaging': 'diagnostics',
  ultrasound: 'diagnostics',
  // 'ct-scan-x-ray': no asset supplied yet — omitted rather than guessed.

  'physiotherapy-rehabilitation': 'patient-care',
  'dietetics-nutrition': 'patient-care',
  pharmacy: 'patient-care',
  ambulance: 'patient-care',
}

// Filenames match slugs exactly except one: the supplied asset uses the American
// spelling "pediatrics" where lib/services.ts's slug uses "paediatrics" (matching the
// British spelling the rest of the site uses). Mapped explicitly rather than renaming
// either — the slug drives real URLs and the filename is what's on disk.
const FILENAME_OVERRIDES: Record<string, string> = {
  'paediatrics-neonatology': 'pediatrics-neonatology',
}

/** Icon path for a service slug, or undefined where no asset exists yet — rendered
 *  conditionally at every call site rather than falling back to a generic icon, so a
 *  missing asset reads as absent, not as a guess. */
export function centreIconSrc(slug: string): string | undefined {
  const dir = ICON_DIRS[slug]
  if (!dir) return undefined
  return `/images/${dir}/${FILENAME_OVERRIDES[slug] ?? slug}.png`
}
