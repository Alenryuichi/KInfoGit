#!/usr/bin/env npx tsx
/**
 * Generate a TOTP secret and QR code for 2FAS.
 *
 * Usage:
 *   npx tsx scripts/generate-totp-qr.ts          # generate new secret
 *   npx tsx scripts/generate-totp-qr.ts <SECRET>  # show QR for existing secret
 *   npx tsx scripts/generate-totp-qr.ts --code <SECRET>  # show today's code
 */

import { randomBytes, createHmac } from 'crypto'

// ─── Base32 ──────────────────────────────────────────────────────

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(buf: Buffer): string {
  let bits = ''
  for (const b of buf) bits += b.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i < bits.length; i += 5) {
    out += B32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)]
  }
  return out
}

function base32Decode(input: string): Buffer {
  const cleaned = input.replace(/[= ]/g, '').toUpperCase()
  let bits = ''
  for (const c of cleaned) {
    const v = B32.indexOf(c)
    if (v === -1) throw new Error(`Invalid base32: ${c}`)
    bits += v.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

// ─── TOTP ────────────────────────────────────────────────────────

function generateTOTP(secretBase32: string, unixTime: number, period: number): string {
  const secret = base32Decode(secretBase32)
  const counter = Math.floor(unixTime / period)
  const buf = Buffer.alloc(8)
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  buf.writeUInt32BE(counter >>> 0, 4)
  const hmac = createHmac('sha1', secret)
  hmac.update(buf)
  const h = hmac.digest()
  const off = h[h.length - 1] & 0x0f
  const code =
    ((h[off] & 0x7f) << 24) |
    ((h[off + 1] & 0xff) << 16) |
    ((h[off + 2] & 0xff) << 8) |
    (h[off + 3] & 0xff)
  return String(code % 1000000).padStart(6, '0')
}

// ─── QR Code (simple ASCII) ─────────────────────────────────────

/**
 * Minimal QR code generator using qrcode npm package.
 * Falls back to plain URL if package is not available.
 */
async function printQR(text: string) {
  try {
    // Try loading from website/node_modules first, then global
    let qrModule: any
    try {
      qrModule = await import(require.resolve('qrcode', { paths: [process.cwd(), process.cwd() + '/website'] }))
    } catch {
      qrModule = await import('qrcode')
    }
    const toString = qrModule.toString || qrModule.default?.toString
    const qr = await toString(text, { type: 'terminal', small: true })
    console.log(qr)
  } catch (e) {
    console.log('\n⚠️  Install qrcode for terminal QR: cd website && npm i -D qrcode')
    console.log('   Or paste this URI into any QR generator:\n')
    console.log(`   ${text}\n`)
  }
}

// ─── Main ────────────────────────────────────────────────────────

const PERIOD = 86400
const ISSUER = 'KInfoGit'
const ACCOUNT = 'Work'

async function main() {
  const args = process.argv.slice(2)

  // Mode: show today's code
  if (args[0] === '--code') {
    const secret = args[1]
    if (!secret) {
      console.error('Usage: --code <SECRET>')
      process.exit(1)
    }
    const now = Math.floor(Date.now() / 1000)
    const code = generateTOTP(secret, now, PERIOD)
    const windowEnd = (Math.floor(now / PERIOD) + 1) * PERIOD
    const hoursLeft = ((windowEnd - now) / 3600).toFixed(1)
    console.log(`\n🔑 Today's code: ${code}`)
    console.log(`⏰ Valid for: ${hoursLeft} more hours (expires at UTC midnight)\n`)
    return
  }

  // Get or generate secret
  let secret: string
  if (args[0] && args[0] !== '--code') {
    secret = args[0].toUpperCase()
    console.log('\n📋 Using existing secret')
  } else {
    const buf = randomBytes(20)
    secret = base32Encode(buf)
    console.log('\n🔐 Generated new TOTP secret')
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  SECRET: ${secret}`)
  console.log(`${'═'.repeat(60)}\n`)

  // Build otpauth URI (period=86400 for daily rotation)
  const uri = `otpauth://totp/${ISSUER}:${ACCOUNT}?secret=${secret}&issuer=${ISSUER}&period=${PERIOD}&digits=6&algorithm=SHA1`

  console.log('📱 Scan this QR code with 2FAS:\n')
  await printQR(uri)

  console.log(`\n📋 otpauth URI (for manual entry):\n   ${uri}\n`)

  // Show today's code
  const now = Math.floor(Date.now() / 1000)
  const code = generateTOTP(secret, now, PERIOD)
  console.log(`🔑 Today's code: ${code}`)

  const windowEnd = (Math.floor(now / PERIOD) + 1) * PERIOD
  const hoursLeft = ((windowEnd - now) / 3600).toFixed(1)
  console.log(`⏰ Valid for: ${hoursLeft} more hours\n`)

  console.log('─'.repeat(60))
  console.log('Next steps:')
  console.log('  1. Scan the QR code above with 2FAS app')
  console.log('  2. Add the secret to GitHub Actions:')
  console.log('     Settings → Secrets → New → TOTP_SECRET')
  console.log(`     Value: ${secret}`)
  console.log('  3. For local testing, add to website/.env.local:')
  console.log(`     TOTP_SECRET=${secret}`)
  console.log('  4. Build: npm run build (or just build)')
  console.log('─'.repeat(60))
  console.log('')
}

main().catch(console.error)
