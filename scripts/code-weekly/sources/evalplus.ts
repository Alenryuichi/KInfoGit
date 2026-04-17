// EvalPlus — HumanEval+ & MBPP+ benchmark data
// Source: https://evalplus.github.io/
//
// ⚠️ RETIRED 2026-04-17 — kept for historical reference only.
// Upstream `results.json` was last updated 2024-12-26 (478 days frozen
// as of retirement). We removed the import from `scripts/fetch-benchmarks.ts`
// so the live pipeline no longer calls this file; the data we already
// collected lives in `profile-data/benchmarks/latest.json` under
// `evalPlus` + `evalPlusRetiredAt` as a frozen archive.
//
// Do NOT delete this file — the scraping logic is non-trivial and may
// be useful if upstream ever resurrects, or if another project wants
// to reuse it. If EvalPlus starts updating again, re-add the import
// in fetch-benchmarks.ts and drop the `evalPlusRetiredAt` field.

const DATA_URL = 'https://evalplus.github.io/results.json'
const UA = 'KInfoGit-Code-Weekly'

export interface EvalPlusEntry {
  model: string
  humanEvalPlus: number // humaneval+ pass@1
  mbppPlus: number      // mbpp+ pass@1
  average: number       // average of both
  size?: number         // model size in billions
}

interface RawEntry {
  link?: string
  'pass@1'?: {
    humaneval: number | null
    'humaneval+': number | null
    mbpp: number | null
    'mbpp+': number | null
  }
  size?: number | null
  [key: string]: unknown
}

export async function fetchEvalPlus(): Promise<EvalPlusEntry[]> {
  try {
    const res = await fetch(DATA_URL, {
      headers: { 'User-Agent': UA },
    })

    if (!res.ok) {
      console.warn(`[evalplus] HTTP ${res.status}`)
      return []
    }

    const data = (await res.json()) as Record<string, RawEntry>
    const entries: EvalPlusEntry[] = []

    for (const [model, raw] of Object.entries(data)) {
      const heplus = raw['pass@1']?.['humaneval+']
      const mbppplus = raw['pass@1']?.['mbpp+']

      // Require at least humaneval+ score
      if (heplus == null) continue

      const mbpp = mbppplus ?? 0
      const average = mbppplus != null ? (heplus + mbpp) / 2 : heplus

      entries.push({
        model,
        humanEvalPlus: heplus,
        mbppPlus: mbpp,
        average,
        ...(raw.size != null ? { size: raw.size } : {}),
      })
    }

    return entries
      .sort((a, b) => b.humanEvalPlus - a.humanEvalPlus)
      .slice(0, 30)
  } catch (err) {
    console.warn('[evalplus] Fetch failed:', err)
    return []
  }
}
