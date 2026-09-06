// lib/fonts.ts
// Two families, four weights total — the performance budget for the platform.
// `display: 'swap'` prevents FOIT: on a slow 4G connection a patient sees fallback
// text immediately rather than a blank page while the webfont downloads.
//
// NOTE: adding the `devanagari` subset roughly doubles font payload. Only add it
// when Hindi content actually ships, and re-measure the budget when you do.

import { Inter, Source_Serif_4 } from 'next/font/google'

export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
  variable: '--font-sans',
})

export const serif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
  variable: '--font-serif',
})

export const fontVariables = `${sans.variable} ${serif.variable}`
