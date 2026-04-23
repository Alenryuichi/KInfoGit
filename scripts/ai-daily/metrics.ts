// AI Daily — pipeline run metrics collector
//
// Captures per-stage counters as the pipeline runs, then appends a single
// record to profile-data/ai-daily/_meta/YYYY-MM.json. The frontend reads
// these aggregated files to render the observability dashboard at
// /ai-daily/metrics.
//
// Design principles:
// - Zero throw: every writer is try/catched so a metrics failure never
//   fails the pipeline itself.
// - Append-only per month: records within a month are accumulated in a
//   single JSON array to keep file count small and month-level queries
//   O(1) file read.
// - Idempotent: a second run on the same date replaces that date's entry
//   so re-runs don't duplicate records.

import fs from 'fs'
import path from 'path'
import { AI_DAILY_DIR } from './config'

export interface SourceBreakdown {
  rss: number
  search: number
  social: number
  horizon: number
  github: number
  reddit: number
  coStarred: number
}

export interface DedupStats {
  urlDropped: number
  titleDropped: number
}

export interface ScoringStats {
  batches: number
  failed: number
  halveRetries: number
  keywordFallback: number
  hnWeighted: number
}

export interface OutputStats {
  itemCount: number
  avgScore: number
  maxScore: number
  sectionCounts: Record<string, number>
}

export interface AnchorStats {
  loaded: number
  bands: string[]
}

export interface RunRecord {
  /** Date (YYYY-MM-DD in Asia/Shanghai) the digest is for */
  date: string
  /** ISO timestamp of when the run finished */
  timestamp: string
  /** Total wall-clock duration in milliseconds */
  durationMs: number
  sources: SourceBreakdown
  dedup: DedupStats
  scoring: ScoringStats
  anchors: AnchorStats
  output: OutputStats
}

export class MetricsCollector {
  private startedAt: number
  private sources: SourceBreakdown = { rss: 0, search: 0, social: 0, horizon: 0, github: 0, reddit: 0, coStarred: 0 }
  private dedup: DedupStats = { urlDropped: 0, titleDropped: 0 }
  private scoring: ScoringStats = { batches: 0, failed: 0, halveRetries: 0, keywordFallback: 0, hnWeighted: 0 }
  private anchors: AnchorStats = { loaded: 0, bands: [] }

  constructor() {
    this.startedAt = Date.now()
  }

  recordSources(s: SourceBreakdown) { this.sources = s }
  recordDedup(d: DedupStats) { this.dedup = d }
  recordScoring(s: ScoringStats) { this.scoring = s }
  recordAnchors(a: AnchorStats) { this.anchors = a }

  /** Build the final record and append/replace it in the month file. */
  finalize(date: string, output: OutputStats, projectRoot: string): void {
    const record: RunRecord = {
      date,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - this.startedAt,
      sources: this.sources,
      dedup: this.dedup,
      scoring: this.scoring,
      anchors: this.anchors,
      output,
    }
    try {
      appendRunRecord(record, projectRoot)
    } catch (err) {
      // Never let metrics bubble up and kill the pipeline
      console.warn('[metrics] failed to persist run record:', err)
    }
  }
}

/**
 * Append or replace the record for a given date in the appropriate
 * YYYY-MM.json file under profile-data/ai-daily/_meta/.
 * Same-date entries are replaced (idempotent re-run), not appended.
 */
function appendRunRecord(record: RunRecord, projectRoot: string): void {
  const dir = path.join(projectRoot, AI_DAILY_DIR, '_meta')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const month = record.date.slice(0, 7)                    // YYYY-MM
  const file = path.join(dir, `${month}.json`)

  let records: RunRecord[] = []
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) records = parsed
    } catch {
      // Corrupted file: fall through and overwrite with a fresh array
    }
  }

  // Replace any existing entry for the same date (idempotent re-run)
  records = records.filter(r => r.date !== record.date)
  records.push(record)
  records.sort((a, b) => a.date.localeCompare(b.date))

  fs.writeFileSync(file, JSON.stringify(records, null, 2) + '\n', 'utf-8')
  console.log(`[metrics] persisted run record to ${path.relative(projectRoot, file)}`)
}

/** Compute avg/max score + per-section counts from final scored items. */
export function computeOutputStats(
  sectionItems: Record<string, Array<{ score: number }>>,
): OutputStats {
  const all: number[] = []
  const sectionCounts: Record<string, number> = {}
  for (const [id, items] of Object.entries(sectionItems)) {
    sectionCounts[id] = items.length
    for (const it of items) all.push(it.score)
  }
  const itemCount = all.length
  const avgScore = itemCount > 0 ? all.reduce((a, b) => a + b, 0) / itemCount : 0
  const maxScore = itemCount > 0 ? Math.max(...all) : 0
  return {
    itemCount,
    avgScore: Math.round(avgScore * 10) / 10,
    maxScore: Math.round(maxScore * 10) / 10,
    sectionCounts,
  }
}
