// Benchmarks health-check module.
//
// Why this exists: `fetch-benchmarks.ts` historically fell back to an
// empty array for any failing source and still wrote `latest.json`. A
// Chatbot Arena frontend change could silently replace 80 valid rows
// with 0 rows — then every `/code/benchmarks` visitor would see a blank
// table, and the problem would live on disk until someone noticed.
//
// Health-check rules:
//   1. Critical sources (Arena + Aider) are the backbone of the page.
//      If ALL of them return empty on a run, we REFUSE to overwrite
//      latest.json — the last known good snapshot stays live.
//   2. Auxiliary sources (SWE-bench, BigCodeBench, EvalPlus, LiveCodeBench)
//      are nice-to-have. When they fail we fall back to the previous
//      snapshot's rows for that one source only, and flag it in health.
//   3. Every run — pass, partial, or refused — appends a record to
//      profile-data/benchmarks/_health/YYYY-MM.json so we can diff the
//      snapshot count over time and catch slow rot (e.g. Arena still
//      returning rows but 50% fewer than last week).
//
// This file is intentionally framework-free and side-effect-free beyond
// file IO — easy to test and reason about.

import fs from 'fs'
import path from 'path'

export interface SourceOutcome {
  name: string
  count: number                 // rows returned this run
  previousCount: number | null  // rows in the previous snapshot, if any
  /**
   * Age of the upstream data, in days. Only set when the caller has a
   * reliable Last-Modified / publish-date signal for this source.
   * Undefined means "unknown" — treated as fresh for decision-making.
   */
  ageDays?: number
  status: 'ok' | 'empty' | 'thin' | 'stale' | 'fetch-error'
  note?: string                 // extra context for a UI tooltip or log
}

export interface HealthReport {
  runAt: string
  weekRelative: string           // the label used in the caller's log, e.g. "2026-04-17"
  sources: SourceOutcome[]
  /** A source is "critical" if its absence makes the dashboard useless. */
  criticalEmpty: string[]
  /** Auxiliary sources where we fell back to the previous snapshot's rows. */
  auxiliaryFallback: string[]
  /** Auxiliary sources that returned data but the data itself is >staleHardDays old. */
  auxiliaryStale: string[]
  /** If true, this run REFUSED to overwrite latest.json. */
  refusedWrite: boolean
  /** Human-readable summary for the run's last console line. */
  summary: string
}

export interface EvaluateArgs {
  /** Run timestamp, usually `new Date().toISOString()`. */
  runAt: string
  /** Label shown in logs (week identifier, date, whatever the caller uses). */
  weekRelative: string
  /** Current run's row counts, keyed by source name. */
  current: Record<string, number>
  /** Previous snapshot's row counts, keyed by source name. Pass {} if none. */
  previous: Record<string, number>
  /**
   * Upstream data age (days) keyed by source name. Optional per-source —
   * only include sources for which a trustworthy age signal exists
   * (HTTP Last-Modified, explicit publishedAt field, etc). Missing or
   * undefined values are treated as "age unknown → skip age check".
   */
  ages?: Record<string, number | undefined>
  /** Source names considered critical. Caller decides. */
  criticalSources: string[]
  /**
   * Threshold: if current < previous * (1 - thinDropFraction) AND current > 0,
   * source is flagged "thin" (shrunk sharply but not empty). Default 0.5.
   */
  thinDropFraction?: number
  /**
   * Age thresholds for non-critical sources. A source older than
   * staleSoftDays is flagged "stale" (still surfaced, but annotated).
   * A source older than staleHardDays is treated as effectively empty,
   * triggering auxiliaryFallback. Ignored for critical sources — if
   * Arena hasn't updated in 45 days that's news, not a bug.
   *
   * Defaults: soft=60d, hard=180d (half a year).
   */
  staleSoftDays?: number
  staleHardDays?: number
}

/**
 * Evaluate source counts, build a health report, and decide whether the
 * snapshot is safe to persist to latest.json.
 *
 * Decision rule (intentionally simple):
 *   - refusedWrite := every critical source returned 0 rows.
 *   - auxiliaryFallback := auxiliary sources that returned 0 AND had >0 last time,
 *     OR auxiliary sources older than staleHardDays (treated as dead upstream).
 *   - auxiliaryStale   := auxiliary sources older than staleSoftDays but not yet hard.
 */
export function evaluate(args: EvaluateArgs): HealthReport {
  const thinDropFraction = args.thinDropFraction ?? 0.5
  const staleSoftDays = args.staleSoftDays ?? 60
  const staleHardDays = args.staleHardDays ?? 180
  const criticalSet = new Set(args.criticalSources)
  const ages = args.ages ?? {}

  const sources: SourceOutcome[] = []
  const criticalEmpty: string[] = []
  const auxiliaryFallback: string[] = []
  const auxiliaryStale: string[] = []

  for (const [name, count] of Object.entries(args.current)) {
    const prev = args.previous[name] ?? null
    const isCritical = criticalSet.has(name)
    const age = ages[name]

    let status: SourceOutcome['status']
    let note: string | undefined

    if (count === 0) {
      status = 'empty'
      if (isCritical) {
        criticalEmpty.push(name)
        note = 'critical source returned 0 rows'
      } else if (prev && prev > 0) {
        auxiliaryFallback.push(name)
        note = `0 rows this run, falling back to ${prev} previous rows`
      } else {
        note = 'no data this run and no previous data either'
      }
    } else if (!isCritical && age !== undefined && age >= staleHardDays) {
      // Upstream hasn't moved in >staleHardDays. Treat as dead source:
      // reuse previous rows (they're the same anyway) and flag loudly.
      status = 'stale'
      auxiliaryFallback.push(name)
      note = `upstream unchanged for ${Math.round(age)} days — treating as dead, consider removing from config`
    } else if (!isCritical && age !== undefined && age >= staleSoftDays) {
      status = 'stale'
      auxiliaryStale.push(name)
      note = `upstream unchanged for ${Math.round(age)} days`
    } else if (prev !== null && prev > 0 && count < prev * (1 - thinDropFraction)) {
      status = 'thin'
      note = `returned ${count} rows, down from ${prev} — possible scrape breakage`
    } else {
      status = 'ok'
    }

    sources.push({ name, count, previousCount: prev, ageDays: age, status, note })
  }

  const refusedWrite =
    args.criticalSources.length > 0 &&
    criticalEmpty.length === args.criticalSources.length

  let summary: string
  if (refusedWrite) {
    summary = `REFUSED write: all critical sources empty (${criticalEmpty.join(', ')})`
  } else if (criticalEmpty.length > 0) {
    summary = `partial: ${criticalEmpty.length} critical source(s) empty (${criticalEmpty.join(', ')})`
  } else if (auxiliaryFallback.length > 0) {
    summary = `ok with fallback: ${auxiliaryFallback.join(', ')} using previous rows`
  } else if (auxiliaryStale.length > 0) {
    summary = `ok but stale: ${auxiliaryStale.join(', ')} upstream not updating`
  } else {
    const thin = sources.filter(s => s.status === 'thin')
    summary = thin.length > 0
      ? `ok but thin: ${thin.map(s => s.name).join(', ')}`
      : 'ok'
  }

  return {
    runAt: args.runAt,
    weekRelative: args.weekRelative,
    sources,
    criticalEmpty,
    auxiliaryFallback,
    auxiliaryStale,
    refusedWrite,
    summary,
  }
}

/**
 * Append `report` to `profile-data/benchmarks/_health/YYYY-MM.json`,
 * creating the file if needed. We key by run timestamp so multiple runs
 * in the same day are preserved (unlike the `appendRunRecord` pattern
 * for ai-daily where same-date replaces).
 */
export function appendHealthRecord(dir: string, report: HealthReport): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const month = report.runAt.slice(0, 7) // YYYY-MM
  const file = path.join(dir, `${month}.json`)

  let existing: HealthReport[] = []
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
      if (Array.isArray(parsed)) existing = parsed
    } catch {
      // Corrupt file — back it up and start fresh so we never crash.
      const backupPath = `${file}.corrupt-${Date.now()}`
      fs.renameSync(file, backupPath)
      console.warn(`[benchmarks-health] Corrupt health log moved to ${backupPath}`)
    }
  }

  existing.push(report)
  // Trim to last 500 records per month to keep files bounded in pathological cases.
  if (existing.length > 500) existing = existing.slice(-500)

  fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf-8')
}
