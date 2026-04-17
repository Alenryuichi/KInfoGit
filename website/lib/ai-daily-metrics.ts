// AI Daily — metrics loader for the dashboard page
//
// Reads profile-data/ai-daily/_meta/*.json files (monthly arrays of run
// records) and flattens them into a single chronologically-ordered list
// for rendering. Never throws; missing or corrupt files are skipped.

import fs from 'fs'
import path from 'path'

// NOTE: schema kept loose (all fields optional) so a legacy record
// missing a newer field doesn't blow up rendering.
export interface RunRecord {
  date: string
  timestamp?: string
  durationMs?: number
  sources?: {
    rss?: number
    search?: number
    social?: number
    horizon?: number
  }
  dedup?: {
    urlDropped?: number
    titleDropped?: number
  }
  scoring?: {
    batches?: number
    failed?: number
    halveRetries?: number
    keywordFallback?: number
    hnWeighted?: number
  }
  anchors?: {
    loaded?: number
    bands?: string[]
  }
  output?: {
    itemCount?: number
    avgScore?: number
    maxScore?: number
    sectionCounts?: Record<string, number>
  }
}

function getMetaDir(): string {
  // Match the double-path fallback from lib/ai-daily.ts to handle both
  // dev (cwd=website/) and build contexts (cwd=repo root).
  const a = path.join(process.cwd(), '..', 'profile-data', 'ai-daily', '_meta')
  if (fs.existsSync(a)) return a
  const b = path.join(process.cwd(), 'profile-data', 'ai-daily', '_meta')
  if (fs.existsSync(b)) return b
  return a
}

/**
 * Load all run records across all monthly files, sorted by date ASC.
 * Returns [] if the _meta directory doesn't exist yet (cold repo).
 */
export function getAllRunRecords(): RunRecord[] {
  const dir = getMetaDir()
  if (!fs.existsSync(dir)) return []

  let files: string[] = []
  try {
    files = fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}\.json$/.test(f))
      .sort()
  } catch {
    return []
  }

  const records: RunRecord[] = []
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        for (const r of parsed) {
          if (r && typeof r === 'object' && typeof r.date === 'string') {
            records.push(r as RunRecord)
          }
        }
      }
    } catch {
      continue
    }
  }

  records.sort((a, b) => a.date.localeCompare(b.date))
  return records
}

export interface MetricsKpis {
  /** Number of runs in the last 7 days (including today). */
  recentRuns: number
  /** Average item count across recent runs. */
  avgItemCount: number
  /** Total failed batches across recent runs. */
  totalFailedBatches: number
  /** Total halve-retries across recent runs. */
  totalHalveRetries: number
  /** Average avgScore across recent runs. */
  avgScore: number
  /** Total keyword fallbacks (bad signal — LLM went down). */
  totalKeywordFallbacks: number
}

/** Compute headline KPIs from the last N records. */
export function computeKpis(records: RunRecord[], windowSize = 7): MetricsKpis {
  const recent = records.slice(-windowSize)
  if (recent.length === 0) {
    return {
      recentRuns: 0, avgItemCount: 0, totalFailedBatches: 0,
      totalHalveRetries: 0, avgScore: 0, totalKeywordFallbacks: 0,
    }
  }
  let sumItems = 0
  let sumScore = 0
  let failedSum = 0
  let halveSum = 0
  let fallbackSum = 0
  for (const r of recent) {
    sumItems += r.output?.itemCount ?? 0
    sumScore += r.output?.avgScore ?? 0
    failedSum += r.scoring?.failed ?? 0
    halveSum += r.scoring?.halveRetries ?? 0
    fallbackSum += r.scoring?.keywordFallback ?? 0
  }
  return {
    recentRuns: recent.length,
    avgItemCount: Math.round((sumItems / recent.length) * 10) / 10,
    totalFailedBatches: failedSum,
    totalHalveRetries: halveSum,
    avgScore: Math.round((sumScore / recent.length) * 10) / 10,
    totalKeywordFallbacks: fallbackSum,
  }
}

export interface AnomalyAlert {
  date: string
  reason: string
}

/** Flag runs with suspicious metrics for the alerts panel. */
export function findAnomalies(records: RunRecord[]): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = []
  for (const r of records) {
    const reasons: string[] = []
    if ((r.output?.itemCount ?? 0) < 10) reasons.push(`low item count (${r.output?.itemCount ?? 0})`)
    if ((r.scoring?.failed ?? 0) >= 3) reasons.push(`${r.scoring?.failed} failed batches`)
    if ((r.scoring?.keywordFallback ?? 0) >= 5) reasons.push(`${r.scoring?.keywordFallback} keyword fallbacks`)
    if ((r.sources?.rss ?? 0) === 0 && (r.sources?.search ?? 0) === 0) {
      reasons.push('no RSS or search items')
    }
    if (reasons.length > 0) {
      alerts.push({ date: r.date, reason: reasons.join(', ') })
    }
  }
  // Most recent first, cap at 10
  return alerts.reverse().slice(0, 10)
}
