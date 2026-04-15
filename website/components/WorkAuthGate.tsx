import { useState, useEffect, useRef, useCallback } from 'react'
import type { EncryptedPayload } from '@/lib/crypto'
import {
  tryDecrypt,
  getStoredPassword,
  storePassword,
  clearStoredPassword,
} from '@/lib/crypto'

interface WorkAuthGateProps {
  /** Encrypted payload */
  encryptedPayload: EncryptedPayload
  /** Called with decrypted JSON string on success */
  onDecrypted: (data: string) => void
  /** Optional: message shown above input */
  hint?: string
}

export function WorkAuthGate({
  encryptedPayload,
  onDecrypted,
  hint,
}: WorkAuthGateProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [autoChecking, setAutoChecking] = useState(true)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Try stored password on mount
  useEffect(() => {
    const stored = getStoredPassword()
    if (stored) {
      tryDecrypt(encryptedPayload, stored).then((result) => {
        if (result) {
          onDecrypted(result)
        } else {
          clearStoredPassword()
          setAutoChecking(false)
        }
      })
    } else {
      setAutoChecking(false)
    }
  }, [encryptedPayload, onDecrypted])

  const attemptDecrypt = useCallback(
    async (code: string) => {
      setChecking(true)
      setError('')

      const result = await tryDecrypt(encryptedPayload, code)
      if (result) {
        storePassword(code)
        onDecrypted(result)
      } else {
        setError('ACCESS DENIED — invalid code')
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
      setChecking(false)
    },
    [encryptedPayload, onDecrypted],
  )

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError('')

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (digit && index === 5) {
      const code = next.join('')
      if (code.length === 6) {
        attemptDecrypt(code)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const code = digits.join('')
      if (code.length === 6) {
        attemptDecrypt(code)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const next = [...digits]
      for (let i = 0; i < 6; i++) {
        next[i] = pasted[i] || ''
      }
      setDigits(next)
      if (pasted.length === 6) {
        attemptDecrypt(pasted)
      } else {
        inputRefs.current[pasted.length]?.focus()
      }
    }
  }

  if (autoChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-mono text-sm text-white/40 animate-pulse">
          Authenticating...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Terminal window */}
        <div className="bg-[#050505] border border-white/10 rounded-lg overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
          {/* Title bar */}
          <div className="bg-[#0a0a0a] border-b border-white/10 px-4 py-2.5 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/60"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/60"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/60"></span>
            <span className="ml-3 font-mono text-[0.65rem] text-white/40">
              auth — access_control
            </span>
          </div>

          <div className="p-8">
            {/* ASCII lock */}
            <div className="text-center mb-6 font-mono text-white/20 text-xs leading-tight select-none">
              <pre>{`  ┌───┐
  │ ◉ │
  └─┬─┘
 ┌──┴──┐
 │     │
 └─────┘`}</pre>
            </div>

            {/* Prompt */}
            <div className="font-mono text-sm mb-6 text-center">
              <p className="text-white/60">
                {hint || 'This section requires authentication.'}
              </p>
              <p className="text-white/30 text-xs mt-2">
                Enter 6-digit access code
              </p>
            </div>

            {/* 6-digit input */}
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={checking}
                  className={`
                    w-11 h-14 text-center text-xl font-mono font-bold
                    bg-black/50 border rounded-md outline-none
                    transition-all duration-200
                    ${error
                      ? 'border-red-500/50 text-red-400'
                      : digit
                        ? 'border-emerald-500/50 text-emerald-400'
                        : 'border-white/15 text-white/90'
                    }
                    focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                    disabled:opacity-50
                  `}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Status */}
            <div className="font-mono text-xs text-center h-5">
              {checking && (
                <span className="text-blue-400 animate-pulse">
                  ▸ Verifying access code...
                </span>
              )}
              {error && (
                <span className="text-red-400">{error}</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-4 py-2 font-mono text-[0.6rem] text-white/20 flex justify-between">
            <span>AES-256-GCM</span>
            <span>PBKDF2</span>
          </div>
        </div>
      </div>
    </div>
  )
}
