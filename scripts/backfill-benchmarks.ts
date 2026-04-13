// Backfill benchmark history — one-time script
// Pulls historical Arena data from wulong.dev (supports ?date=YYYY-MM-DD)
// For other benchmarks, uses current data as approximation (they change slowly)

import fs from 'fs'
import path from 'path'

// Load .env
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

import { BENCHMARKS_HISTORY_DIR } from './code-weekly/config'
import { fetchAiderLeaderboard } from './code-weekly/sources/aider-leaderboard'
import { fetchSweBench } from './code-weekly/sources/swe-bench'
import { fetchLiveCodeBench } from './code-weekly/sources/livecodebench'

const WULONG_API = 'https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=code'
const HISTORY_START = '2026-03-19' // earliest date with data on wulong.dev

/** Format model slug → display name (same as arena-rankings.ts) */
function formatModelName(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/(\d) (\d)(?!\d)/g, '$1.$2')
    .replace(/^Gpt /i, 'GPT-')
    .replace(/^O(\d)/i, 'o$1')
    .replace(/\bGlm\b/g, 'GLM')
    .replace(/\bErnie\b/g, 'ERNIE')
    .replace(/\bQwen\b/g, 'Qwen')
    .replace(/\bGrok\b/g, 'Grok')
}

interface ArenaEntry {
  rank: number
  model: string
  elo: number
  org: string
  delta: number | null
}

async function fetchArenaForDate(date: string): Promise<ArenaEntry[]> {
  try {
    const res = await fetch(`${WULONG_API}&date=${date}`, {
      headers: { 'User-Agent': 'KInfoGit-Backfill' },
    })
    if (!res.ok) return []
    const data = await res.json() as { models: Array<{ rank: number; model: string; vendor: string; score: number }> }
    if (!data.models || data.models.length === 0) return []
    return data.models.slice(0, 50).map(m => ({
      rank: m.rank,
      model: formatModelName(m.model),
      elo: m.score,
      org: m.vendor || '',
      delta: null,
    }))
  } catch {
    return []
  }
}

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

async function main() {
  const historyDir = path.join(__dirname, '..', BENCHMARKS_HISTORY_DIR)
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true })
  }

  const today = new Date().toISOString().slice(0, 10)
  const dates = generateDateRange(HISTORY_START, today)

  // Check which dates already have data
  const existing = new Set(
    fs.readdirSync(historyDir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map(f => f.replace('.json', ''))
  )

  const missing = dates.filter(d => !existing.has(d))
  console.log(`📅 Date range: ${HISTORY_START} → ${today} (${dates.length} days)`)
  console.log(`📦 Existing: ${existing.size} snapshots`)
  console.log(`🔍 Missing: ${missing.length} days to backfill\n`)

  if (missing.length === 0) {
    console.log('✅ History is complete, nothing to backfill.')
    return
  }

  // Fetch current Aider/SWE-bench/LiveCodeBench (used as approximation for all dates)
  console.log('📡 Fetching current Aider, SWE-bench, LiveCodeBench...')
  const [aiderResult, sweResult, lcbResult] = await Promise.allSettled([
    fetchAiderLeaderboard(),
    fetchSweBench(),
    fetchLiveCodeBench(),
  ])

  const aiderData = aiderResult.status === 'fulfilled' ? aiderResult.value : []
  const sweData = sweResult.status === 'fulfilled' ? sweResult.value : []
  const lcbData = lcbResult.status === 'fulfilled' ? lcbResult.value : []

  console.log(`  Aider: ${aiderData.length} models`)
  console.log(`  SWE-bench: ${sweData.length} models`)
  console.log(`  LiveCodeBench: ${lcbData.length} models\n`)

  // Backfill each missing date
  let success = 0
  let skipped = 0

  for (const date of missing) {
    process.stdout.write(`  ${date}... `)

    const arena = await fetchArenaForDate(date)
    if (arena.length === 0) {
      console.log('⚠️ no Arena data, skipping')
      skipped++
      continue
    }

    const snapshot = {
      arenaRanking: arena,
      arenaPublishDate: date,
      aiderLeaderboard: aiderData.map(e => ({ ...e, delta: null })),
      aiderLastUpdated: undefined,
      sweBench: sweData,
      sweBenchLastUpdated: undefined,
      liveCodeBench: lcbData,
      liveCodeBenchLastUpdated: undefined,
      notable: 'Backfilled',
      updatedAt: `${date}T12:00:00.000Z`,
    }

    const outPath = path.join(historyDir, `${date}.json`)
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8')
    console.log(`✅ ${arena.length} arena models`)
    success++

    // Small delay to be polite to the API
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`\n📊 Done: ${success} backfilled, ${skipped} skipped, ${existing.size} pre-existing`)
  console.log(`📁 Total: ${success + existing.size} history snapshots in ${historyDir}`)
}

main().catch(err => {
  console.error('❌ Backfill failed:', err)
  process.exit(1)
})
