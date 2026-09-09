// tailwind.config.ts
// Lifeline Institute of Medical Sciences, Hisar (LIMS) — design tokens.
//
// Brand anchors (fixed — do not change these three values):
//   Primary Teal    #0F5B66  -> teal-800    7.75:1 on white  (AAA, safe for all text)
//   Secondary Cyan  #168B99  -> teal-600    4.05:1 on white  (large text / non-text ONLY)
//   Accent Copper   #D68060  -> copper-500  2.95:1 on white  (decorative ONLY)
//
// Both brand hues sit at ~187deg / ~74% saturation, so a single teal ramp carries both
// anchors rather than splitting them into unrelated scales.
//
// Contrast law, so it is never re-derived per component:
//   teal-800 on white .......... 7.75:1  OK  body text, headings, links, primary buttons
//   teal-600 on white .......... 4.05:1  !!  >=24px regular / >=18.7px bold, icons,
//                                            borders, focus rings, fills. NOT body copy.
//   white on teal-600 .......... 4.05:1  !!  same limit inverted — small white labels on a
//                                            cyan fill fail AA. Use teal-800 fills instead.
//   copper-500 on white ........ 2.95:1  NO  fails AA and AA-large. Decorative only.
//   ink-950 on copper-500 ...... 6.32:1  OK  this is how copper carries text: as a fill
//   copper-700 on white ........ 4.67:1  OK  but ON WHITE ONLY — 4.39:1 on teal-50 and
//                                            4.24:1 on copper-50, so it fails AA on both
//                                            tinted bands. Prefer copper-800.
//   copper-800 on white ........ 6.13:1  OK  5.76:1 on teal-50, 5.56:1 on copper-50 —
//                                            the copper that is safe on every surface
//
// ON THE COPPER NAV RIBBON (a solid copper-500 band), the law inverts. Measured:
//   white on copper-500 ........ 2.95:1  NO  the obvious choice, and it fails outright
//   teal-800 on copper-500 ..... 2.63:1  NO  the brand primary is WORSE than white here
//   teal-900 on copper-500 ..... 3.87:1  !!  large text / non-text only
//   teal-950 on copper-500 ..... 5.28:1  OK  <- the only brand tone that carries nav text
//   ink-950 on copper-500 ...... 6.32:1  OK  neutral alternative

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#EFFAFB', // tinted section backgrounds
          100: '#D6F2F5', // hover on tinted surfaces, chips
          200: '#ABE5ED', // borders on tinted surfaces
          300: '#6FD4E2', // disabled fills, decorative
          400: '#25BCD0', // illustration, data-viz, on-dark accent
          500: '#1BA0B1', // hover state for teal-600 fills
          600: '#168B99', // * SECONDARY CYAN — icons, borders, focus ring, large headings
          700: '#13707C', // hover/pressed for teal-800; 5.77:1, safe for text
          800: '#0F5B66', // * PRIMARY TEAL — body text, headings, primary buttons, nav
          900: '#0B4047', // footer background, dark bands
          950: '#07282C', // deepest surface; 5.28:1 on copper-500 — the nav ribbon text
        },
        copper: {
          50: '#FBF2EF', // warm tinted surface (patient stories)
          100: '#F6E1DA',
          200: '#EEC4B5',
          300: '#E3A791', // on-dark accent
          400: '#DD9378',
          500: '#D68060', // * ACCENT COPPER — nav ribbon, filled blocks, rules
          600: '#C86541', // 3.89:1 — state indicators on white; hover for copper fills
          700: '#B35C34', // 4.67:1 on white ONLY — fails on teal-50 / copper-50
          800: '#9C4A28', // 6.13:1 — the text-safe copper on every surface. Default.
          900: '#592918',
        },
        ink: {
          50: '#F7FAFA',
          100: '#EBF0F0',
          200: '#D7E0E1', // dividers, borders on white
          300: '#B4C2C5', // input borders
          400: '#7E9094', // 3.3:1 — placeholder / disabled ONLY, never body text
          600: '#4A5B5E', // 7.12:1 — secondary text, captions
          800: '#1E2A2D',
          950: '#0B1416', // 18.65:1 — long-form body copy
        },

        // Semantic aliases so intent reads clearly in JSX.
        brand: {
          DEFAULT: '#0F5B66', // Primary Teal
          secondary: '#168B99',
          accent: '#D68060', // Accent Copper
        },

        // Clinical status colours. Each must ALWAYS be paired with text or an icon —
        // never colour alone (WCAG 1.4.1). ~8% of Indian men are colour-blind, and on a
        // doctor directory that is a real failure rate, not a rounding error.
        emergency: '#B3261E', // white text on it = 6.5:1

        // The emergency beacon pill. #EB1C26 is the red of the circle inside
        // public/images/beacon.png, sampled from the file; this is 1% darker so a
        // white label reaches 4.51:1 instead of the asset's own 4.44:1, which falls
        // just short of AA. The two reds differ by 1.015:1 — imperceptible — so the
        // asset's circle still disappears into the fill and only its white glyph
        // shows, which is the whole point of matching it.
        beacon: {
          DEFAULT: '#E91C26', // white label 4.51:1
          dark: '#C8161F', //    hover; darker, so white only improves
        },
        caution: '#8A5A00', //   5.9:1 on white (bright amber cannot pass AA on white)
        success: '#1F6B3F', //   6.5:1 on white
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },

      // Fluid type scale: minimum at a 360px viewport, maximum at 1440px.
      // clamp() keeps every intermediate width intentional instead of stepping at
      // breakpoints — LIMS traffic skews to 360-412px mid-range Android.
      fontSize: {
        'step--1': ['clamp(0.833rem, 0.80rem + 0.15vw, 0.9rem)', { lineHeight: '1.5' }],
        'step-0': ['clamp(1rem, 0.96rem + 0.20vw, 1.125rem)', { lineHeight: '1.65' }],
        'step-1': ['clamp(1.2rem, 1.13rem + 0.32vw, 1.4rem)', { lineHeight: '1.45' }],
        'step-2': ['clamp(1.44rem, 1.33rem + 0.50vw, 1.75rem)', { lineHeight: '1.35' }],
        'step-3': ['clamp(1.728rem, 1.55rem + 0.79vw, 2.2rem)', { lineHeight: '1.25' }],
        'step-4': ['clamp(2.074rem, 1.80rem + 1.22vw, 2.75rem)', { lineHeight: '1.18' }],
        'step-5': ['clamp(2.488rem, 2.08rem + 1.82vw, 3.44rem)', { lineHeight: '1.1' }],
      },

      spacing: {
        gutter: 'clamp(1rem, 0.6rem + 1.8vw, 2rem)', //  16 -> 32px
        section: 'clamp(3rem, 2rem + 5vw, 6.5rem)', //   48 -> 104px
      },

      maxWidth: {
        prose: '68ch', // clinical text is read carefully; long lines hurt comprehension
        container: '80rem',
      },

      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },

      boxShadow: {
        // Elevation means "this does something". Static content never gets a shadow.
        card: '0 1px 2px rgba(11,64,71,0.04), 0 4px 12px rgba(11,64,71,0.06)',
        raised: '0 2px 4px rgba(11,64,71,0.06), 0 12px 28px rgba(11,64,71,0.10)',
      },

      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
      },

      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}

export default config
