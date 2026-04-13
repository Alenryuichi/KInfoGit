// BigCodeBench — hard practical coding benchmark data
// Source: https://bigcode-bench.github.io/

const DATA_URL = 'https://bigcode-bench.github.io/results.json'
const UA = 'KInfoGit-Code-Weekly'

export interface BigCodeBenchEntry {
  model: string
  passRate: number     // instruct pass@1 (primary)
  completeRate: number // complete pass@1
  size?: number        // model size in billions
}

interface RawEntry {
  link?: string
  'pass@1'?: { instruct: number | null; complete: number | null }
  size?: number | null
  [key: string]: unknown
}

export async function fetchBigCodeBench(): Promise<BigCodeBenchEntry[]> {
  try {
    const res = await fetch(DATA_URL, {
      headers: { 'User-Agent': UA },
    })

    if (!res.ok) {
      console.warn(`[bigcodebench] HTTP ${res.status}`)
      return []
    }

    const data = (await res.json()) as Record<string, RawEntry>
    const entries: BigCodeBenchEntry[] = []

    for (const [model, raw] of Object.entries(data)) {
      const instruct = raw['pass@1']?.instruct
      const complete = raw['pass@1']?.complete

      // Skip models with no instruct score (primary metric)
      if (instruct == null) continue

      entries.push({
        model,
        passRate: instruct,
        completeRate: complete ?? 0,
        ...(raw.size != null ? { size: raw.size } : {}),
      })
    }

    return entries
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, 30)
  } catch (err) {
    console.warn('[bigcodebench] Fetch failed:', err)
    return []
  }
}
