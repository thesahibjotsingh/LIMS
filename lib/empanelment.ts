// lib/empanelment.ts
//
// The government schemes, institutional panels and third-party administrators (TPAs)
// LIMS is empanelled with, transcribed from the hospital's own physical signage
// ("Scope of Services" / "List of Empanelment" board, Jindal Chowk campus). Same
// discipline as lib/doctors.ts and lib/services.ts: this is supplied data, verbatim,
// not a claim this codebase is in a position to invent or improve on.
//
// EMPANELMENT IS NOT A COVERAGE GUARANTEE. Being listed here means LIMS has a panel
// agreement with that scheme or TPA — it does not mean every treatment is cashless
// under every policy issued through it. The page this file feeds says so explicitly
// rather than letting the list itself imply a blanket promise.
//
// NAMES ARE VERBATIM FROM THE SIGNAGE, WITH ONE CLASS OF EXCEPTION: obvious printing
// typos of an otherwise unambiguous, real company name are corrected (a stray letter —
// "Conpany" for "Company", "Insurane" for "Insurance", "Genral" for "General" — is a
// sign-painter's error, not an alternate legal name, and repeating it here would be a
// transcription bug dressed up as fidelity). Below is the specific set of corrections
// made, so anyone checking this against the physical board can see exactly what changed
// and why:
//   "Cholomandlam MS General Insurance Co Ltd"      -> "Cholamandalam MS General
//                                                        Insurance Co Ltd"
//   "Parmount Health Services Pvt Ltd"               -> "Paramount Health Services
//                                                        Pvt Ltd"
//   "Reliance Genral Insurance Pvt Ltd"              -> "Reliance General Insurance
//                                                        Pvt Ltd"
//   "Universal Sompo General Insurance Conpany Ltd"  -> "...Company Ltd"
//   "Vipul Medcorp Insurane Pvt Ltd"                 -> "...Insurance Pvt Ltd"
//
// ONE ENTRY IS KEPT AS PRINTED DESPITE LOOKING WRONG: "Tata Motors Finance" is not a
// health insurance TPA — it is a vehicle-financing company — and its presence in a
// numbered list of 47 TPAs on the board is almost certainly a sign-making error, not a
// real empanelment. It is kept here anyway rather than silently dropped, because unlike
// the spelling fixes above there is no way to know what name was actually intended
// (Tata AIG? A different Tata entity entirely?), and guessing would be inventing a TPA
// name LIMS never supplied. Flagged for LIMS to confirm before this goes live.

export const GOVERNMENT_PANELS: string[] = [
  'Ayushman Bharat',
  'ECHS',
  'BSNL',
  'ESI',
  'HAU, GJU, LLRU',
  'Haryana Government',
  'DHVBNL, HPGCL, HVPNL',
]

/**
 * Third-party administrators LIMS is empanelled with, in the order printed on the
 * board. See the file header for the small set of spelling corrections applied and
 * the one entry ("Tata Motors Finance") kept despite looking like a signage error.
 */
export const TPA_PARTNERS: string[] = [
  'Aditya Birla Health Insurance Co. Ltd',
  'Alankit Insurance TPA Ltd',
  'Apollo Munich Health Insurance Co',
  'Bajaj Allianz TPA Pvt. Ltd',
  'Bharti AXA General Insurance Co Ltd',
  'Bridges Health Care',
  'Care Health Insurance',
  'Cholamandalam MS General Insurance Co Ltd',
  'Cigna TTK Health Insurance TPA Ltd',
  'Dedicated Health Insurance TPA Ltd',
  'DHFL General Insurance Ltd',
  'E Meditek TPA India Ltd',
  'East West Assist TPA Ltd',
  'Ericson Insurance TPA Ltd',
  'Expedise Healthcare Pvt Ltd',
  'Family Health Plan Insurance TPA Limited',
  'Future Generali India Insurance Company Limited',
  'Genins India Insurance TPA Ltd',
  'Go Digit General Insurance Co Ltd',
  'GHPL TPA Services Pvt Ltd',
  'Grand Insurance TPA Ltd',
  'HDFC ERGO Gen Insurance Co Ltd',
  'Health India TPA Ltd',
  'Health Insurance TPA Pvt Ltd',
  'Heritage Health Insurance TPA Pvt. Ltd.',
  'IFFCO Tokio General Insurance',
  'L&T General Insurance Co Ltd',
  'Liberty Videocon General Insurance',
  'Max Bupa Health Insurance TPA Pvt Ltd',
  'MD India Health Insurance TPA Private Limited',
  'Medi Assist India TPA Pvt. Ltd.',
  'Medsave Health Insurance TPA Limited',
  'Medicare TPA Service Pvt Ltd',
  'Park Mediclaim TPA Pvt Ltd',
  'Paramount Health Services Pvt Ltd',
  'Raksha Health Insurance TPA Pvt. Ltd.',
  'Reliance General Insurance Pvt Ltd',
  'Rothshield Healthcare TPA',
  'Safeway Insurance TPA Pvt Ltd',
  'SBI General Insurance Pvt Ltd',
  'Star Health and Allied Insurance Co.',
  // Kept as printed — almost certainly a signage error. See the file header note.
  'Tata Motors Finance',
  'United Healthcare Insurance',
  'Universal Sompo General Insurance Company Ltd',
  'Vidal Health TPA Pvt Ltd',
  'Vipul Medcorp Insurance TPA Private Limited',
  'Vision E-Medi Solutions Insurance TPA Pvt. Ltd.',
]
