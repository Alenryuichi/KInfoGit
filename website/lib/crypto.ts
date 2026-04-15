/**
 * AES-GCM encryption utilities for work page protection.
 *
 * Build-time (Node.js):  encryptDataNode / getEncryptedPayload
 * Client-side (Browser): decryptData
 */

// ─── Build-time encryption (Node.js crypto) ─────────────────────

export interface EncryptedPayload {
  /** base64(salt(16) + iv(12) + ciphertext + authTag(16)) */
  data: string
}

/**
 * Encrypt plaintext with a password using AES-256-GCM.
 * Returns base64 string containing: salt(16) + iv(12) + ciphertext + tag(16)
 */
export function encryptDataNode(plaintext: string, password: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto') as typeof import('crypto')

  const salt = crypto.randomBytes(16)
  const key = crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256')
  const iv = crypto.randomBytes(12)

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return Buffer.concat([salt, iv, encrypted, tag]).toString('base64')
}

/**
 * Encrypt data with the WORK_PASSWORD env var.
 */
export function getEncryptedPayload(
  jsonData: unknown,
  password: string,
): EncryptedPayload {
  const plaintext = JSON.stringify(jsonData)
  return {
    data: encryptDataNode(plaintext, password),
  }
}

// ─── Client-side decryption (Web Crypto API) ────────────────────

/**
 * Decrypt an encrypted payload string using a password.
 * Works in browser via Web Crypto API.
 */
export async function decryptData(
  encryptedBase64: string,
  password: string,
): Promise<string> {
  const raw = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))

  const salt = raw.slice(0, 16)
  const iv = raw.slice(16, 28)
  const ciphertextWithTag = raw.slice(28)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertextWithTag,
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Try to decrypt the payload with the given password.
 * Returns the decrypted JSON string on success, null on failure.
 */
export async function tryDecrypt(
  payload: EncryptedPayload,
  password: string,
): Promise<string | null> {
  try {
    return await decryptData(payload.data, password)
  } catch {
    return null
  }
}

// ─── Session storage helpers ────────────────────────────────────

const SESSION_KEY = 'work-auth-token'

export function getStoredPassword(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function storePassword(password: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, password)
  } catch {
    // sessionStorage unavailable
  }
}

export function clearStoredPassword(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
