// EvalPlus — HumanEval+ & MBPP+ benchmark data
// Source: https://evalplus.github.io/

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
