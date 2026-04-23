// Benchmarks alert hook.
//
// Reads the latest HealthReport from profile-data/benchmarks/_health/
// and decides whether to:
//   - escalate to a GitHub Issue (severity: critical | warning)
//   - emit a notice-only line to the run summary (severity: watch | ok)
//   - persist consecutive-failure state for multi-day watch escalation
//
// This file is deliberately framework-free and has no HTTP side effects.
// The caller (CI workflow) is responsible for turning our output into
// an actual Issue / Slack ping / workflow failure — we just compute
// the *decision* and serialize it deterministically.
//
// Output contract:
//   - stdout: a single-line JSON object matching AlertDecision, intended
//     to be captured into $GITHUB_OUTPUT via `jq -c` or similar.
//   - stderr: human-readable console.log lines for the job log.
//   - return value from decide(): same AlertDecision object.
//
// Severity ladder (from most urgent to least):
//   1. "critical": refusedWrite === true (every critical source empty).
//      → Open/update Issue with `benchmarks-alert` + `critical` labels.
//      → Workflow should set job outcome to failure for visibility.
//   2. "warning":  criticalEmpty.length > 0 but < criticalSources.length.
//      → Open/update Issue with `benchmarks-alert` + `warning` labels.
//      → Workflow stays green (partial data still published).
//   3. "watch":    auxiliaryFallback.length > 0 for >= 3 consecutive runs,
//      OR any source is "thin" (>= thinDropFraction loss vs previous).
//      → Open/update Issue with `benchmarks-alert` + `watch` labels.
//   4. "ok":       everything else. No Issue action. Summary gets a
//      one-liner "All green" note.
//
// Consecutive-run state lives in
// profile-data/benchmarks/_health/_alert-state.json and is intentionally
// committed with the rest of the health log — that way the history of
// "was this a recurring issue or a one-off blip?" is visible in git log.

import fs from 'fs'
import path from 'path'
import type { HealthReport } from './benchmarks-health'

export type AlertSeverity = 'critical' | 'warning' | 'watch' | 'ok'

export interface AlertDecision {
  severity: AlertSeverity
  /** Short human-readable reason, fits on one Issue title line. */
  title: string
  /** Markdown body safe to paste into a GitHub Issue / Step Summary. */
  body: string
  /** Labels to apply when opening / updating an Issue. */
  labels: string[]
  /** True when the workflow should fail explicitly (critical only). */
  shouldFailWorkflow: boolean
  /** True when an Issue/comment should be opened/updated. */
  shouldOpenIssue: boolean
  /** The runAt ISO timestamp of the underlying HealthReport. */
  runAt: string
}

interface AlertState {
  /** How many consecutive runs each auxiliary source has been in fallback. */
  auxiliaryFallbackStreak: Record<string, number>
  /** Last run that set any of the above; used for state-rot detection. */
  lastUpdatedAt: string
}

const DEFAULT_STATE: AlertState = {
  auxiliaryFallbackStreak: {},
  lastUpdatedAt: '1970-01-01T00:00:00Z',
}

/** Watch-level threshold: 3 consecutive runs in fallback = escalate. */
const WATCH_STREAK_THRESHOLD = 3

export function readLatestHealthReport(healthDir: string): HealthReport | null {
  if (!fs.existsSync(healthDir)) return null

  // Pick the most recent YYYY-MM.json; skip the alert-state file.
  const files = fs
    .readdirSync(healthDir)
    .filter(f => /^\d{4}-\d{2}\.json$/.test(f))
    .sort()

  for (let i = files.length - 1; i >= 0; i--) {
    const file = path.join(healthDir, files[i])
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[parsed.length - 1] as HealthReport
      }
    } catch {
      // Corrupt month file — try the previous month.
      continue
    }
  }
  return null
}

export function readState(healthDir: string): AlertState {
  const file = path.join(healthDir, '_alert-state.json')
  if (!fs.existsSync(file)) return { ...DEFAULT_STATE }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return {
      auxiliaryFallbackStreak: parsed.auxiliaryFallbackStreak ?? {},
      lastUpdatedAt: parsed.lastUpdatedAt ?? DEFAULT_STATE.lastUpdatedAt,
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export function writeState(healthDir: string, state: AlertState): void {
  if (!fs.existsSync(healthDir)) fs.mkdirSync(healthDir, { recursive: true })
  const file = path.join(healthDir, '_alert-state.json')
  fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf-8')
}

/**
 * Advance the alert state based on the current report, returning the
 * *new* state (caller decides whether to persist it). Keeps the two
 * concerns separate so tests don't touch disk.
 */
export function advanceState(prev: AlertState, report: HealthReport): AlertState {
  const newStreak: Record<string, number> = {}

  // A source still in fallback => increment; otherwise reset to 0 (drop).
  // We only track auxiliary sources; critical-empty escalates immediately
  // at the "warning"/"critical" level so no streak math is needed for them.
  const fallbackSet = new Set(report.auxiliaryFallback)
  for (const src of fallbackSet) {
    newStreak[src] = (prev.auxiliaryFallbackStreak[src] ?? 0) + 1
  }
  // Sources that *were* in fallback but aren't today are simply omitted
  // from newStreak — i.e. the streak resets to 0 by virtue of absence.

  return {
    auxiliaryFallbackStreak: newStreak,
    lastUpdatedAt: report.runAt,
  }
}

export function decide(report: HealthReport, state: AlertState): AlertDecision {
  const runAt = report.runAt
  const labels = ['benchmarks-alert']

  // ─── Critical: refused write ──────────────────────────────
  if (report.refusedWrite) {
    const sources = report.criticalEmpty.join(', ')
    return {
      severity: 'critical',
      title: `🔴 Benchmarks refused write — critical sources empty: ${sources}`,
      body: buildIssueBody({
        report,
        state,
        heading: '🔴 Refused to overwrite `latest.json`',
        explanation:
          'Every critical source returned **0 rows** on this run. The ' +
          'dashboard is being served from the previous snapshot to avoid ' +
          'showing a blank table. Investigate the scraper(s) listed below ' +
          'before the next scheduled run.',
      }),
      labels: [...labels, 'critical'],
      shouldFailWorkflow: true,
      shouldOpenIssue: true,
      runAt,
    }
  }

  // ─── Warning: at least one critical source empty ──────────
  if (report.criticalEmpty.length > 0) {
    const sources = report.criticalEmpty.join(', ')
    return {
      severity: 'warning',
      title: `🟡 Benchmarks critical source(s) empty: ${sources}`,
      body: buildIssueBody({
        report,
        state,
        heading: '🟡 Critical source partially down',
        explanation:
          `One or more critical sources returned 0 rows this run: **${sources}**. ` +
          'The snapshot was still published because at least one critical ' +
          'source still has data, but the empty source(s) need attention. ' +
          'If this persists for another run, the dashboard will refuse to write.',
      }),
      labels: [...labels, 'warning'],
      shouldFailWorkflow: false,
      shouldOpenIssue: true,
      runAt,
    }
  }

  // ─── Watch: auxiliary fallback streak >= threshold, or any "thin" source ─
  const persistentFallback = Object.entries(state.auxiliaryFallbackStreak)
    .filter(([, streak]) => streak >= WATCH_STREAK_THRESHOLD)
    .map(([name, streak]) => ({ name, streak }))

  const thinSources = report.sources.filter(s => s.status === 'thin')

  if (persistentFallback.length > 0 || thinSources.length > 0) {
    const persistDesc = persistentFallback
      .map(p => `${p.name} (${p.streak} runs)`)
      .join(', ')
    const thinDesc = thinSources
      .map(t => `${t.name} (${t.count} vs ${t.previousCount})`)
      .join(', ')
    const titleBits: string[] = []
    if (persistDesc) titleBits.push(`fallback streak: ${persistDesc}`)
    if (thinDesc) titleBits.push(`thin rows: ${thinDesc}`)

    return {
      severity: 'watch',
      title: `🟠 Benchmarks watch — ${titleBits.join('; ')}`,
      body: buildIssueBody({
        report,
        state,
        heading: '🟠 Degraded signal, keep watching',
        explanation:
          'No critical sources are down, but the health log shows ' +
          'degradation that\'s either persistent (auxiliary fallback ' +
          'repeated over multiple runs) or sharp (a source shrank ' +
          `by more than 50%). Threshold: ${WATCH_STREAK_THRESHOLD} ` +
          'consecutive fallback runs for persistence flag.',
      }),
      labels: [...labels, 'watch'],
      shouldFailWorkflow: false,
      shouldOpenIssue: true,
      runAt,
    }
  }

  // ─── OK: green run, nothing to escalate ────────────────────
  return {
    severity: 'ok',
    title: 'Benchmarks green',
    body: `All sources healthy as of ${runAt}.`,
    labels,
    shouldFailWorkflow: false,
    shouldOpenIssue: false,
    runAt,
  }
}

function buildIssueBody(args: {
  report: HealthReport
  state: AlertState
  heading: string
  explanation: string
}): string {
  const { report, state, heading, explanation } = args
  const lines: string[] = []

  lines.push(`## ${heading}`, '')
  lines.push(explanation, '')
  lines.push(`**Run timestamp:** \`${report.runAt}\`  `)
  lines.push(`**Week label:** \`${report.weekRelative}\`  `)
  lines.push(`**Summary:** ${report.summary}`, '')

  lines.push('### Per-source status', '')
  lines.push('| Source | Count | Previous | Status | Note |')
  lines.push('| --- | ---: | ---: | --- | --- |')
  for (const s of report.sources) {
    const prev = s.previousCount === null ? '—' : String(s.previousCount)
    const ageTag = s.ageDays !== undefined ? ` (age ${Math.round(s.ageDays)}d)` : ''
    const note = (s.note ?? '') + ageTag
    lines.push(`| \`${s.name}\` | ${s.count} | ${prev} | ${s.status} | ${note || '—'} |`)
  }
  lines.push('')

  if (Object.keys(state.auxiliaryFallbackStreak).length > 0) {
    lines.push('### Fallback streaks', '')
    for (const [name, streak] of Object.entries(state.auxiliaryFallbackStreak)) {
      lines.push(`- \`${name}\`: ${streak} consecutive runs in fallback`)
    }
    lines.push('')
  }

  lines.push('### Next steps', '')
  lines.push(
    '1. Open `profile-data/benchmarks/_health/` and read the most recent monthly log.',
    '2. Re-run the affected scraper locally: `npx tsx scripts/code-weekly/sources/<src>.ts` (or the main `fetch-benchmarks.ts`).',
    '3. If upstream has legitimately moved, adjust the scraper selector; if it\'s a transient outage, this Issue will auto-close on the next green run.'
  )

  return lines.join('\n')
}

/**
 * CLI entry point: evaluate the latest health record and emit the
 * decision. Designed to be invoked from the CI workflow like:
 *
 *   npx tsx scripts/code-weekly/benchmarks-alert.ts
 *
 * Output:
 *   - Writes a single-line JSON AlertDecision to stdout.
 *   - Writes a human-readable markdown block to $GITHUB_STEP_SUMMARY
 *     if the env var is set (standard in GitHub Actions).
 *   - Persists the advanced AlertState to
 *     profile-data/benchmarks/_health/_alert-state.json.
 *   - Exits 0 always — the workflow is responsible for checking the
 *     severity and deciding what to do. (Exiting non-zero here would
 *     break the subsequent "commit and push" step we still want to run.)
 */
export function runCli(healthDir: string): number {
  const report = readLatestHealthReport(healthDir)
  if (!report) {
    const noData: AlertDecision = {
      severity: 'ok',
      title: 'Benchmarks alert: no health data yet',
      body: `No health records found in ${healthDir}. Skipping alert evaluation.`,
      labels: ['benchmarks-alert'],
      shouldFailWorkflow: false,
      shouldOpenIssue: false,
      runAt: new Date().toISOString(),
    }
    emit(noData)
    return 0
  }

  const prevState = readState(healthDir)
  const nextState = advanceState(prevState, report)
  writeState(healthDir, nextState)

  const decision = decide(report, nextState)
  emit(decision)
  return 0
}

function emit(decision: AlertDecision): void {
  // Human-readable log → stderr (not captured by $GITHUB_OUTPUT redirection)
  console.error(`\n🚨 Benchmarks alert: [${decision.severity}] ${decision.title}`)
  console.error(`   shouldOpenIssue=${decision.shouldOpenIssue}  shouldFailWorkflow=${decision.shouldFailWorkflow}`)

  // Machine-readable → stdout (single line, easy to jq)
  console.log(JSON.stringify(decision))

  // GitHub Actions step summary: append a markdown block if the
  // env var is present. In local dev this is a no-op.
  const summaryFile = process.env.GITHUB_STEP_SUMMARY
  if (summaryFile) {
    try {
      fs.appendFileSync(
        summaryFile,
        `\n## 🩺 Benchmarks alert — \`${decision.severity}\`\n\n${decision.body}\n`
      )
    } catch {
      // Non-fatal: summary write is best-effort.
    }
  }
}

// Allow direct invocation via tsx. In library imports this block is a no-op.
if (require.main === module) {
  // Default health dir for the Code Weekly pipeline.
  const healthDir = path.join(
    process.cwd(),
    'profile-data',
    'benchmarks',
    '_health'
  )
  process.exit(runCli(healthDir))
}
