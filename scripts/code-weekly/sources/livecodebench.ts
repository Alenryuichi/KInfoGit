// LiveCodeBench — contamination-free code generation benchmark
// Source: https://livecodebench.github.io/

const DATA_URL =
  'https://livecodebench.github.io/performances_generation.json'
const UA = 'KInfoGit-Code-Weekly'

export interface LiveCodeBenchEntry {
  model: string
  passRate: number // overall pass@1
  easy?: number
  medium?: number
  hard?: number
}

interface RawPerformance {
  model: string
  difficulty: 'easy' | 'medium' | 'hard'
  'pass@1': number
  [key: string]: unknown
}

interface RawData {
  performances: RawPerformance[]
  models: Array<{ model_repr: string; [key: string]: unknown }>
  [key: string]: unknown
}

export async function fetchLiveCodeBench(): Promise<LiveCodeBenchEntry[]> {
  try {
    const res = await fetch(DATA_URL, {
      headers: { 'User-Agent': UA },
    })

    if (!res.ok) {
      console.warn(`[livecodebench] HTTP ${res.status}`)
      return []
    }

    const data = (await res.json()) as RawData
    const performances = data.performances
    if (!Array.isArray(performances) || performances.length === 0) {
      console.warn('[livecodebench] No performance data found')
      return []
    }

    // Aggregate per-problem results by model and difficulty
    const agg = new Map<
      string,
      { sum: number; count: number; easy: number; easyN: number; medium: number; mediumN: number; hard: number; hardN: number }
    >()

    for (const p of performances) {
      const model = p.model
      const score = p['pass@1']
      if (model == null || score == null) continue

      let bucket = agg.get(model)
      if (!bucket) {
        bucket = { sum: 0, count: 0, easy: 0, easyN: 0, medium: 0, mediumN: 0, hard: 0, hardN: 0 }
        agg.set(model, bucket)
      }

      bucket.sum += score
      bucket.count += 1

      if (p.difficulty === 'easy') {
        bucket.easy += score
        bucket.easyN += 1
      } else if (p.difficulty === 'medium') {
        bucket.medium += score
        bucket.mediumN += 1
      } else if (p.difficulty === 'hard') {
        bucket.hard += score
        bucket.hardN += 1
      }
    }

    const entries: LiveCodeBenchEntry[] = []
    for (const [model, b] of agg) {
      if (b.count === 0) continue

      entries.push({
        model,
        passRate: round(b.sum / b.count),
        ...(b.easyN > 0 ? { easy: round(b.easy / b.easyN) } : {}),
        ...(b.mediumN > 0 ? { medium: round(b.medium / b.mediumN) } : {}),
        ...(b.hardN > 0 ? { hard: round(b.hard / b.hardN) } : {}),
      })
    }

    return entries
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, 30)
  } catch (err) {
    console.warn('[livecodebench] Fetch failed:', err)
    return []
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}
