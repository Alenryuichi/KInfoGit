// AI Daily — cross-day scoring anchors
//
// To reduce score drift between days (the LLM's "8.5" on one day shouldn't
// mean something different from "8.5" on the next), we prepend a handful
// of historical items with known scores to each scoring prompt as
// reference scale markers. The model is told these are for calibration
// only and must not appear in the output.
//
// Selection strategy: scan the last ANCHOR_LOOKBACK_DAYS of persisted
// DailyDigest JSON files and sample items that fall into fixed score
// bands, so the anchor bag represents the full 5–10 range.

import fs from 'fs'
import path from 'path'
import { AI_DAILY_DIR } from './config'

/** How many days back to scan for anchor candidates. */
const ANCHOR_LOOKBACK_DAYS = 14

/** Target score bands: [min, max, desiredCount, label]. */
const ANCHOR_BANDS: Array<[number, number, number, string]> = [
  [9.0, 10.0, 1, 'top'],       // industry-defining events
  [7.0, 7.5,  2, 'median'],    // solid, worth-reading
  [5.0, 5.5,  1, 'low'],       // marginal AI relevance
]

export interface ScoringAnchor {
  title: string
  summary: string
  score: number
  band: string
}

// Minimal shape we actually read from the JSON; keep decoupled from types.ts
interface StoredItem {
  title?: string
  summary?: string
  score?: number
}
interface StoredDigest {
  date?: string
  sections?: Array<{ items?: StoredItem[] }>
}

/**
 * Load anchors from historical digests. Returns up to sum(desiredCount)
 * = 4 items by default, or fewer if history is short. Never throws —
 * on any filesystem/parse error returns whatever it managed to collect.
 */
export function loadScoringAnchors(projectRoot: string): ScoringAnchor[] {
  const dir = path.join(projectRoot, AI_DAILY_DIR)
  if (!fs.existsSync(dir)) return []

  let files: string[] = []
  try {
    files = fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .reverse()
      .slice(0, ANCHOR_LOOKBACK_DAYS)
  } catch {
    return []
  }

  // Collect candidates per band
  const buckets: Record<string, StoredItem[]> = {}
  for (const [, , , label] of ANCHOR_BANDS) buckets[label] = []

  for (const file of files) {
    let digest: StoredDigest
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      digest = JSON.parse(raw)
    } catch {
      continue
    }
    for (const section of digest.sections ?? []) {
      for (const item of section.items ?? []) {
        if (typeof item.score !== 'number') continue
        if (typeof item.title !== 'string' || !item.title) continue
        for (const [min, max, desired, label] of ANCHOR_BANDS) {
          if (item.score >= min && item.score <= max && buckets[label].length < desired * 3) {
            buckets[label].push(item)
            break
          }
        }
      }
    }
  }

  // Sample one per band (deterministic: highest-scoring in the band first,
  // but stable across runs by taking index 0 after sort).
  const anchors: ScoringAnchor[] = []
  for (const [, , desired, label] of ANCHOR_BANDS) {
    const pool = buckets[label]
    if (pool.length === 0) continue
    // Sort descending so "top" band anchor is the most recent top item,
    // "median" band prefers the higher end of the window, etc.
    pool.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    for (let i = 0; i < Math.min(desired, pool.length); i += 1) {
      const item = pool[i]
      anchors.push({
        title: item.title!,
        summary: (item.summary ?? '').slice(0, 120),
        score: item.score!,
        band: label,
      })
    }
  }

  return anchors
}

/**
 * Format anchors as a prompt block. Returns an empty string if no anchors
 * are available (so the prompt degrades gracefully on a cold repo).
 */
export function formatAnchorBlock(anchors: ScoringAnchor[]): string {
  if (anchors.length === 0) return ''
  const lines = anchors.map((a, i) =>
    `A${i + 1}. [${a.band} 参考·已评 ${a.score.toFixed(1)}] ${a.title}\n   ${a.summary}`
  )
  return [
    '',
    '参考尺度（历史锚点）:',
    '以下条目来自过去数日的已评分档案，其分数已确定。请将它们作为你本次打分的参照尺度，保证跨日的分数一致性。**不要将这些参考条目包含在 results 输出中。**',
    ...lines,
    '',
  ].join('\n')
}
