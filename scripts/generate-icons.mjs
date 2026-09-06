// scripts/generate-icons.mjs
//
// Regenerates public/icons/* and public/favicon.ico from the logo master.
// Run after replacing public/images/lims-favicon.png:
//
//   npm run icons
//
// The master is ~1 MB at 1254x1254 and is never served to a browser — shipping it as
// the favicon would mean a megabyte on every cold page load for 32 rendered pixels.
// It also carries uneven transparent padding, so it is trimmed before resizing;
// without that, roughly a third of the pixel budget at 32px is empty margin.

import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const MASTER = 'public/images/lims-favicon.png'
const OUT_DIR = 'public/icons'

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }

/** Trim, fit into a square with an even 6% margin, flatten onto `background`. */
async function square(size, background) {
  const pad = Math.round(size * 0.06)
  const art = await sharp(MASTER)
    .trim({ threshold: 1 })
    .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()

  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: 'center' }])
    .png({ compressionLevel: 9, palette: size <= 64 })
    .toBuffer()
}

/**
 * Minimal ICO container wrapping a single PNG. sharp cannot write .ico, and the
 * PNG-in-ICO form is understood by every browser and by Windows Vista onward.
 */
function ico(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // image count

  const entry = Buffer.alloc(16)
  entry[0] = size // width  (0 would mean 256)
  entry[1] = size // height
  entry[2] = 0 // palette entries; 0 = truecolour
  entry[3] = 0 // reserved
  entry.writeUInt16LE(1, 4) // colour planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12) // byte offset of the image data

  return Buffer.concat([header, entry, png])
}

const TARGETS = [
  ['favicon-16.png', 16, TRANSPARENT],
  ['favicon-32.png', 32, TRANSPARENT],
  ['favicon-48.png', 48, TRANSPARENT],
  ['icon-192.png', 192, TRANSPARENT],
  ['icon-512.png', 512, TRANSPARENT],
  // iOS composites transparency onto black, which kills the teal. Ship it opaque.
  ['apple-touch-icon.png', 180, WHITE],
]

if (!fs.existsSync(MASTER)) {
  console.error(`Master not found: ${MASTER}`)
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const built = new Map()
for (const [name, size, background] of TARGETS) {
  const buf = await square(size, background)
  fs.writeFileSync(path.join(OUT_DIR, name), buf)
  built.set(name, buf)
  console.log(`${name.padEnd(24)} ${size}x${size}  ${(buf.length / 1024).toFixed(1)} KB`)
}

const icoBuf = ico(built.get('favicon-32.png'), 32)
fs.writeFileSync('public/favicon.ico', icoBuf)
console.log(`${'favicon.ico'.padEnd(24)} 32x32  ${(icoBuf.length / 1024).toFixed(1)} KB`)

console.log('\nIcon links are declared in app/layout.tsx (metadata.icons).')
