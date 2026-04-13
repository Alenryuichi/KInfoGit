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

import { BENCHMARKS_DIR, BENCHMARKS_HISTORY_DIR } from './code-weekly/config'
import { fetchArenaRankings, type ArenaEntry } from './code-weekly/sources/arena-rankings'
import { fetchAiderLeaderboard, type AiderEntry } from './code-weekly/sources/aider-leaderboard'
import { fetchSweBench } from './code-weekly/sources/swe-bench'
import { fetchBigCodeBench } from './code-weekly/sources/bigcodebench'
import { fetchEvalPlus } from './code-weekly/sources/evalplus'
import { fetchLiveCodeBench } from './code-weekly/sources/livecodebench'

// ─── Types ─────────────────────────────────────────────────

interface BenchmarkSnapshot {
  arenaRanking: Array<ArenaEntry & { delta: number | null }>
  arenaPublishDate?: string
  aiderLeaderboard: Array<AiderEntry & { delta: number | null }>
  sweBench: Array<{ model: string; resolved: number; org?: string }>
  bigCodeBench: Array<{ model: string; passRate: number; completeRate: number; size?: number }>
  evalPlus: Array<{ model: string; humanEvalPlus: number; mbppPlus: number; average: number; size?: number }>
  liveCodeBench: Array<{ model: string; passRate: number; easy?: number; medium?: number; hard?: number }>
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

// ─── Arena publish date ────────────────────────────────────

async function fetchArenaPublishDate(): Promise<string | undefined> {
  try {
    const url = 'https://datasets-server.huggingface.co/rows?dataset=lmarena-ai/leaderboard-dataset&config=webdev&split=latest&offset=0&length=1'
    const res = await fetch(url, { headers: { 'User-Agent': 'KInfoGit-Code-Weekly' } })
    if (!res.ok) return undefined
    const data = await res.json() as { rows: Array<{ row: { leaderboard_publish_date?: string } }> }
    return data.rows?.[0]?.row?.leaderboard_publish_date || undefined
  } catch {
    return undefined
  }
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('🏆 Benchmarks — starting data collection...\n')

  const benchDir = path.join(__dirname, '..', BENCHMARKS_DIR)
  const historyDir = path.join(__dirname, '..', BENCHMARKS_HISTORY_DIR)

  for (const dir of [benchDir, historyDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  const previous = loadPreviousSnapshot(benchDir)

  // Fetch all 6 benchmarks in parallel
  console.log('📡 Fetching benchmark data...')
  const [arenaR, aiderR, sweR, bcbR, epR, lcbR, dateR] = await Promise.allSettled([
    fetchArenaRankings(),
    fetchAiderLeaderboard(),
    fetchSweBench(),
    fetchBigCodeBench(),
    fetchEvalPlus(),
    fetchLiveCodeBench(),
    fetchArenaPublishDate(),
  ])

  const arenaRaw = arenaR.status === 'fulfilled' ? arenaR.value : []
  const aiderRaw = aiderR.status === 'fulfilled' ? aiderR.value : []
  const sweRaw = sweR.status === 'fulfilled' ? sweR.value : []
  const bcbRaw = bcbR.status === 'fulfilled' ? bcbR.value : []
  const epRaw = epR.status === 'fulfilled' ? epR.value : []
  const lcbRaw = lcbR.status === 'fulfilled' ? lcbR.value : []
  const arenaDate = dateR.status === 'fulfilled' ? dateR.value : undefined

  console.log(`  Arena Coding:    ${arenaRaw.length} models${arenaDate ? ` (published ${arenaDate})` : ''}`)
  console.log(`  Aider:           ${aiderRaw.length} models`)
  console.log(`  SWE-bench:       ${sweRaw.length} models`)
  console.log(`  BigCodeBench:    ${bcbRaw.length} models`)
  console.log(`  EvalPlus:        ${epRaw.length} models`)
  console.log(`  LiveCodeBench:   ${lcbRaw.length} models`)

  // Calculate deltas for Arena & Aider
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
    sweBench: sweRaw,
    bigCodeBench: bcbRaw,
    evalPlus: epRaw,
    liveCodeBench: lcbRaw,
    notable: notableChanges.join('; ') || 'No significant changes',
    updatedAt: new Date().toISOString(),
  }

  // Write latest.json
  const latestPath = path.join(benchDir, 'latest.json')
  fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 2), 'utf-8')
  console.log(`\n✅ Updated: ${latestPath}`)

  // Write history snapshot
  const today = new Date().toISOString().slice(0, 10)
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
