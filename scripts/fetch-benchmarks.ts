// Benchmarks — independent data collection script
// Updates latest.json + history snapshot, calculates delta
import fs from 'fs'
import path from 'path'

// Load .env from project root
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=\s*(.*)$/)
    if (match && !process.env[match[1]]) {
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[match[1]] = value
    }
  }
}

import { BENCHMARKS_DIR, BENCHMARKS_HISTORY_DIR, BENCHMARKS_HEALTH_DIR } from './code-weekly/config'
import { fetchArenaRankings, fetchArenaPublishDate, type ArenaEntry } from './code-weekly/sources/arena-rankings'
import { fetchAiderLeaderboard, type AiderEntry } from './code-weekly/sources/aider-leaderboard'
import { fetchSweBench } from './code-weekly/sources/swe-bench'
import { fetchLiveCodeBench } from './code-weekly/sources/livecodebench'
import { evaluate as evaluateHealth, appendHealthRecord } from './code-weekly/benchmarks-health'
// NOTE: BigCodeBench and EvalPlus were retired from the live pipeline on
// 2026-04-17. Upstream data had been frozen for 366d (BigCodeBench,
// last updated 2025-04-16) and 478d (EvalPlus, last updated 2024-12-26)
// respectively, meaning they provide no ongoing signal — we were just
// round-tripping a dead snapshot through our health log every day.
// The source files `scripts/code-weekly/sources/bigcodebench.ts` and
// `…/evalplus.ts` are kept for historical reference (in case upstream
// ever resurrects or another project wants the scraping logic), but
// we no longer import them here. The data already collected stays in
// `profile-data/benchmarks/latest.json` as a frozen archive with
// `bigCodeBenchRetiredAt` / `evalPlusRetiredAt` markers; future runs
// won't overwrite those fields.

// ─── Types ─────────────────────────────────────────────────

interface BenchmarkSnapshot {
  arenaRanking: Array<ArenaEntry & { delta: number | null }>
  arenaPublishDate?: string
  aiderLeaderboard: Array<AiderEntry & { delta: number | null }>
  aiderLastUpdated?: string
  sweBench: Array<{ model: string; resolved: number; org?: string }>
  sweBenchLastUpdated?: string
  // ─── Retired sources (kept as frozen archive, never overwritten) ─
  // See top-of-file note. These are carried over from the previous
  // snapshot verbatim so the archive in latest.json stays intact.
  bigCodeBench?: Array<{ model: string; passRate: number; completeRate: number; size?: number }>
  bigCodeBenchLastUpdated?: string
  bigCodeBenchRetiredAt?: string
  evalPlus?: Array<{ model: string; humanEvalPlus: number; mbppPlus: number; average: number; size?: number }>
  evalPlusLastUpdated?: string
  evalPlusRetiredAt?: string
  liveCodeBench: Array<{ model: string; passRate: number; easy?: number; medium?: number; hard?: number }>
  liveCodeBenchLastUpdated?: string
  notable: string
  updatedAt: string
}

// ─── Delta Calculation ─────────────────────────────────────

function loadPreviousSnapshot(dir: string): BenchmarkSnapshot | null {
  const latestPath = path.join(dir, 'latest.json')
  if (!fs.existsSync(latestPath)) return null

  try {
    return JSON.parse(fs.readFileSync(latestPath, 'utf-8'))
  } catch {
    return null
  }
}

function calculateArenaDelta(
  current: ArenaEntry[],
  previous: BenchmarkSnapshot | null
): Array<ArenaEntry & { delta: number | null }> {
  if (!previous?.arenaRanking) {
    return current.map(e => ({ ...e, delta: null }))
  }
  const prevMap = new Map(previous.arenaRanking.map(e => [e.model, e.elo]))
  return current.map(e => ({
    ...e,
    delta: prevMap.has(e.model) ? e.elo - prevMap.get(e.model)! : null,
  }))
}

function calculateAiderDelta(
  current: AiderEntry[],
  previous: BenchmarkSnapshot | null
): Array<AiderEntry & { delta: number | null }> {
  if (!previous?.aiderLeaderboard) {
    return current.map(e => ({ ...e, delta: null }))
  }
  const prevMap = new Map(previous.aiderLeaderboard.map(e => [e.model, e.passRate]))
  return current.map(e => ({
    ...e,
    delta: prevMap.has(e.model)
      ? parseFloat((e.passRate - prevMap.get(e.model)!).toFixed(1))
      : null,
  }))
}

// ─── Fetch Last-Modified date from HTTP header ─────────────

async function fetchLastModified(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
    const lm = res.headers.get('last-modified')
    if (lm) return new Date(lm).toISOString().slice(0, 10)
    return undefined
  } catch {
    return undefined
  }
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('🏆 Benchmarks — starting data collection...\n')

  const benchDir = path.join(__dirname, '..', BENCHMARKS_DIR)
  const historyDir = path.join(__dirname, '..', BENCHMARKS_HISTORY_DIR)
  const healthDir = path.join(__dirname, '..', BENCHMARKS_HEALTH_DIR)

  for (const dir of [benchDir, historyDir, healthDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  const previous = loadPreviousSnapshot(benchDir)

  // Fetch all live benchmarks + dates in parallel.
  // BigCodeBench & EvalPlus were retired 2026-04-17 (see top-of-file note)
  // — their last snapshot lives in latest.json as a frozen archive.
  console.log('📡 Fetching benchmark data...')
  const [arenaR, aiderR, sweR, lcbR, dateR, aiderDateR] = await Promise.allSettled([
    fetchArenaRankings(),
    fetchAiderLeaderboard(),
    fetchSweBench(),
    fetchLiveCodeBench(),
    fetchArenaPublishDate(),
    fetchLastModified('https://aider.chat/docs/leaderboards/'),
  ])

  const arenaRaw = arenaR.status === 'fulfilled' ? arenaR.value : []
  const aiderRaw = aiderR.status === 'fulfilled' ? aiderR.value : []
  const sweRaw = sweR.status === 'fulfilled' ? sweR.value : []
  const lcbRaw = lcbR.status === 'fulfilled' ? lcbR.value : []
  const arenaDate = dateR.status === 'fulfilled' ? dateR.value : undefined
  const aiderDate = aiderDateR.status === 'fulfilled' ? aiderDateR.value : undefined

  console.log(`  Arena Coding:    ${arenaRaw.length} models${arenaDate ? ` (${arenaDate})` : ''}`)
  console.log(`  Aider:           ${aiderRaw.length} models${aiderDate ? ` (${aiderDate})` : ''}`)
  console.log(`  SWE-bench:       ${sweRaw.length} models`)
  console.log(`  LiveCodeBench:   ${lcbRaw.length} models`)

  // ─── Health check: decide whether the snapshot is safe to persist ─
  const today = new Date().toISOString().slice(0, 10)
  const runAtInstant = new Date()

  // Compute upstream ages (days) for sources that expose a trustworthy
  // Last-Modified / publish-date signal. Undefined = "unknown, skip age
  // check". We deliberately don't fabricate ages for Arena/LiveCodeBench
  // (their formal publish date is embedded in the data itself; the HTTP
  // Last-Modified we'd get is the CDN timestamp, not the data's truth).
  const ageInDays = (dateStr: string | undefined): number | undefined => {
    if (!dateStr) return undefined
    const t = new Date(dateStr + 'T00:00:00Z').getTime()
    if (isNaN(t)) return undefined
    return (runAtInstant.getTime() - t) / 86400_000
  }

  const health = evaluateHealth({
    runAt: runAtInstant.toISOString(),
    weekRelative: today,
    current: {
      arena: arenaRaw.length,
      aider: aiderRaw.length,
      sweBench: sweRaw.length,
      liveCodeBench: lcbRaw.length,
    },
    previous: {
      arena: previous?.arenaRanking?.length ?? 0,
      aider: previous?.aiderLeaderboard?.length ?? 0,
      sweBench: previous?.sweBench?.length ?? 0,
      liveCodeBench: previous?.liveCodeBench?.length ?? 0,
    },
    // Only sources with a real Last-Modified signal get an age. Aider's
    // upstream cadence is genuinely slow (monthly+), so its age is a
    // true staleness signal — but it's a critical source, so the stale
    // branch won't trigger anyway (only auxiliaries enter it).
    ages: {
      aider: ageInDays(aiderDate),
    },
    // Arena and Aider are the two sources that actually drive the
    // `/code/benchmarks` page above-the-fold. If either is empty we've
    // still got something to show, but if BOTH are empty the page is
    // effectively broken, so we refuse to persist that state.
    criticalSources: ['arena', 'aider'],
  })

  console.log(`\n🩺 Health: ${health.summary}`)
  for (const src of health.sources) {
    if (src.status !== 'ok') {
      const ageTag = src.ageDays !== undefined ? ` [age=${Math.round(src.ageDays)}d]` : ''
      console.log(`   - ${src.name}: ${src.status}${ageTag}${src.note ? ` (${src.note})` : ''}`)
    }
  }

  // Always append the health record, even when we refuse to write.
  appendHealthRecord(healthDir, health)

  if (health.refusedWrite) {
    console.error('\n❌ Refusing to overwrite latest.json — keeping previous snapshot live.')
    console.error('   See profile-data/benchmarks/_health/ for the failure record.')
    // Still exit 0 so CI doesn't retry-storm. The health log is the
    // durable signal; a future alert hook can watch it.
    return
  }

  // ─── Fallback for failed auxiliary sources ─────────────────────
  // auxiliaryFallback covers: source returned 0 rows this run but had
  // data last time (transient breakage — reuse previous rows so the
  // section doesn't disappear from the page).
  //
  // Historical note: this also used to catch sources that were >180d
  // stale upstream. BigCodeBench (frozen 366d) and EvalPlus (frozen
  // 478d) lived in that bucket for 30+ days before we formally retired
  // them on 2026-04-17 — see top-of-file note.
  const fbSet = new Set(health.auxiliaryFallback)
  const sweFinal  = fbSet.has('sweBench')      && previous ? previous.sweBench      : sweRaw
  const lcbFinal  = fbSet.has('liveCodeBench') && previous ? previous.liveCodeBench : lcbRaw

  // Calculate deltas for Arena & Aider (only run when we have fresh data)
  const arenaRanking = calculateArenaDelta(arenaRaw, previous)
  const aiderLeaderboard = calculateAiderDelta(aiderRaw, previous)

  // Notable changes
  const notableChanges: string[] = []
  for (const entry of arenaRanking) {
    if (entry.delta && Math.abs(entry.delta) >= 10) {
      notableChanges.push(`${entry.model}: ELO ${entry.delta > 0 ? '+' : ''}${entry.delta}`)
    }
  }
  for (const entry of aiderLeaderboard) {
    if (entry.delta && Math.abs(entry.delta) >= 2) {
      notableChanges.push(`${entry.model}: pass rate ${entry.delta > 0 ? '+' : ''}${entry.delta}%`)
    }
  }

  const snapshot: BenchmarkSnapshot = {
    arenaRanking,
    arenaPublishDate: arenaDate,
    aiderLeaderboard,
    aiderLastUpdated: aiderDate,
    sweBench: sweFinal,
    sweBenchLastUpdated: undefined, // SWE-bench date is embedded in data, not HTTP header
    // ─── Retired archive: carry forward verbatim, never recompute ──
    // These fields represent the last known state before retirement
    // (2026-04-17). `bigCodeBenchRetiredAt` / `evalPlusRetiredAt` are
    // seeded in latest.json itself; we just preserve them here so any
    // downstream consumer reading the snapshot sees the full picture.
    bigCodeBench: previous?.bigCodeBench,
    bigCodeBenchLastUpdated: previous?.bigCodeBenchLastUpdated,
    bigCodeBenchRetiredAt: previous?.bigCodeBenchRetiredAt ?? '2026-04-17',
    evalPlus: previous?.evalPlus,
    evalPlusLastUpdated: previous?.evalPlusLastUpdated,
    evalPlusRetiredAt: previous?.evalPlusRetiredAt ?? '2026-04-17',
    liveCodeBench: lcbFinal,
    liveCodeBenchLastUpdated: undefined,
    notable: notableChanges.join('; ') || 'No significant changes',
    updatedAt: new Date().toISOString(),
  }

  // Write latest.json
  const latestPath = path.join(benchDir, 'latest.json')
  fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 2), 'utf-8')
  console.log(`\n✅ Updated: ${latestPath}`)

  // Write history snapshot
  const historyPath = path.join(historyDir, `${today}.json`)
  fs.writeFileSync(historyPath, JSON.stringify(snapshot, null, 2), 'utf-8')
  console.log(`✅ History: ${historyPath}`)

  if (notableChanges.length > 0) {
    console.log(`\n📊 Notable changes: ${notableChanges.join(', ')}`)
  } else {
    console.log('\n📊 No significant ranking changes today.')
  }
}

main().catch(err => {
  console.error('❌ Benchmarks fetch failed:', err)
  process.exit(1)
})
