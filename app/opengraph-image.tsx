// app/opengraph-image.tsx
// The site-wide social preview card — Next's special-file convention renders this once
// at build time and wires it into every page's metadata automatically, so it needs
// setting in exactly one place. Generated from real siteConfig strings rather than a
// designed asset, so it can never drift out of sync with the name or tagline.
//
// next/og renders through Satori, which only understands flexbox layout — no CSS grid,
// no arbitrary selectors. Colours are the same brand hex values as tailwind.config.ts
// (duplicated, not imported: this file runs in a separate build step that doesn't share
// Tailwind's resolved theme object).

import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site-config'

export const alt = `${siteConfig.name}, ${siteConfig.city}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          backgroundColor: '#0F5B66', // Primary Teal
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 72,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#D68060', // Accent Copper — the site's own rule-accent motif
            marginBottom: 40,
          }}
        />
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 4, opacity: 0.85 }}>
          {siteConfig.city.toUpperCase()}, HARYANA
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.15,
            marginTop: 20,
            maxWidth: 900,
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 36, fontSize: 26 }}>
          {siteConfig.tagline.map((word, i) => (
            <div key={word} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {i > 0 ? <span style={{ opacity: 0.6 }}>&middot;</span> : null}
              <span style={{ textTransform: 'uppercase', letterSpacing: 2 }}>{word}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
