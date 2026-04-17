// BigCodeBench — hard practical coding benchmark data
// Source: https://bigcode-bench.github.io/
//
// ⚠️ RETIRED 2026-04-17 — kept for historical reference only.
// Upstream `results.json` was last updated 2025-04-16 (366 days frozen
// as of retirement). We removed the import from `scripts/fetch-benchmarks.ts`
// so the live pipeline no longer calls this file; the data we already
// collected lives in `profile-data/benchmarks/latest.json` under
// `bigCodeBench` + `bigCodeBenchRetiredAt` as a frozen archive.
//
// Do NOT delete this file — the scraping logic is non-trivial and may
// be useful if upstream ever resurrects, or if another project wants
// to reuse it. If BigCodeBench starts updating again, re-add the import
// in fetch-benchmarks.ts and drop the `bigCodeBenchRetiredAt` field.

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
