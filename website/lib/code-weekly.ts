import fs from 'fs'
import path from 'path'

// ─── Types ─────────────────────────────────────────────────

export interface EditorUpdate {
  name: string
  category: 'ide' | 'cli'
  version?: string
  highlights: string[]
  source: string
  sourceUrl?: string
  aiSummary?: string
}

export interface ArenaRanking {
  rank: number
  model: string
  elo: number
  delta: number | null
  org: string
}

export interface AiderLeaderboardEntry {
  model: string
  passRate: number
  delta: number | null
}

export interface SweBenchEntry {
  model: string
  resolved: number
  org?: string
}

export interface BigCodeBenchEntry {
  model: string
  passRate: number
  completeRate: number
  size?: number
}

export interface EvalPlusEntry {
  model: string
  humanEvalPlus: number
  mbppPlus: number
  average: number
  size?: number
}

export interface LiveCodeBenchEntry {
  model: string
  passRate: number
  easy?: number
  medium?: number
  hard?: number
}

export interface BenchmarkData {
  arenaRanking: ArenaRanking[]
  aiderLeaderboard: AiderLeaderboardEntry[]
  sweBench?: SweBenchEntry[]
  bigCodeBench?: BigCodeBenchEntry[]
  evalPlus?: EvalPlusEntry[]
  liveCodeBench?: LiveCodeBenchEntry[]
  notable?: string
  updatedAt?: string
  arenaPublishDate?: string
  aiderLastUpdated?: string
  sweBenchLastUpdated?: string
  bigCodeBenchLastUpdated?: string
  evalPlusLastUpdated?: string
  liveCodeBenchLastUpdated?: string
}

export interface BlogPost {
  company: string
  title: string
  url: string
  publishedAt: string
  summary: string
  tags: string[]
}

export interface CodeWeekly {
  week: string
  dateRange: string
  generatedAt: string
  editors: EditorUpdate[]
  benchmarks: BenchmarkData
  blogs: BlogPost[]
  weekSummary: string
}

export interface CodeWeeklySummary {
  week: string
  dateRange: string
  weekSummary: string
  editorCount: number
}

// ─── Data Directory ────────────────────────────────────────

const CODE_WEEKLY_DIR = path.join(process.cwd(), '..', 'profile-data', 'code-weekly')
const BENCHMARKS_DIR = path.join(process.cwd(), '..', 'profile-data', 'benchmarks')

function getCodeWeeklyDir(): string {
  if (fs.existsSync(CODE_WEEKLY_DIR)) return CODE_WEEKLY_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'code-weekly')
  if (fs.existsSync(alt)) return alt
  return CODE_WEEKLY_DIR
}

function getBenchmarksDir(): string {
  if (fs.existsSync(BENCHMARKS_DIR)) return BENCHMARKS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'benchmarks')
  if (fs.existsSync(alt)) return alt
  return BENCHMARKS_DIR
}

// ─── Org Trend (Borda Count) Types ────────────────────────

export interface OrgTrendPoint {
  date: string // 'YYYY-MM-DD'
  score: number // Arena Elo of best model
  bestModel: string // name of the best model that day
}

export interface OrgTrendSeries {
  org: string
  points: OrgTrendPoint[]
}

// ─── Public API ────────────────────────────────────────────

export function getAllCodeWeeks(): CodeWeeklySummary[] {
  const dir = getCodeWeeklyDir()
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  const summaries: CodeWeeklySummary[] = []

  for (const file of files) {
    const weekMatch = file.match(/^(\d{4}-W\d{2})\.json$/)
    if (!weekMatch) continue

    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      const data = JSON.parse(content) as CodeWeekly
      summaries.push({
        week: data.week,
        dateRange: data.dateRange,
        weekSummary: data.weekSummary,
        editorCount: data.editors.length,
      })
    } catch {
      continue
    }
  }

  // Sort by week descending (newest first)
  return summaries.sort((a, b) => b.week.localeCompare(a.week))
}

export function getCodeWeekByWeek(week: string): CodeWeekly | null {
  const dir = getCodeWeeklyDir()
  const filePath = path.join(dir, `${week}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as CodeWeekly
  } catch {
    return null
  }
}

export function getAdjacentWeeks(week: string): { prev: string | null; next: string | null } {
  const weeks = getAllCodeWeeks().map(w => w.week)
  const idx = weeks.indexOf(week)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx < weeks.length - 1 ? weeks[idx + 1] : null,
    next: idx > 0 ? weeks[idx - 1] : null,
  }
}

export function getLatestBenchmarks(): BenchmarkData | null {
  const dir = getBenchmarksDir()
  const filePath = path.join(dir, 'latest.json')

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as BenchmarkData
  } catch {
    return null
  }
}

const MAX_HISTORY_DAYS = 365
const TOP_N_ORGS = 12

/** Major model vendors — filter out tool/agent teams (UIUC, Sonar, etc.) */
const MAJOR_ORGS = new Set([
  'Anthropic', 'OpenAI', 'Google', 'DeepSeek',
  'Alibaba', 'Meta', 'xAI', 'Moonshot',
  'MiniMax', 'Xiaomi', 'ByteDance', 'Mistral',
  'Tencent', 'Baidu', 'Z.ai', 'KwaiKAT',
])

/**
 * Org trend data based on Arena Coding Elo.
 *
 * For each daily snapshot:
 *   1. Read arenaRanking (sorted by Elo desc, org from vendor field)
 *   2. Per org, keep only the best model (highest Elo)
 *   3. Filter to major model vendors only
 *
 * Y-axis = Elo score of each org's best model.
 * Returns one OrgTrendSeries per org (top N by latest Elo).
 */
export function getOrgTrendData(): OrgTrendSeries[] {
  const dir = getBenchmarksDir()
  const historyDir = path.join(dir, 'history')

  if (!fs.existsSync(historyDir)) return []

  let files: string[]
  try {
    files = fs.readdirSync(historyDir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  } catch {
    return []
  }

  if (files.length === 0) return []

  files.sort()

  // Limit to last N days
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS)
  const cutoffStr = cutoffDate.toISOString().slice(0, 10)
  files = files.filter(f => f.replace('.json', '') >= cutoffStr)

  if (files.length === 0) return []

  // Parse snapshots
  const snapshots: Array<{ date: string; data: BenchmarkData }> = []
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(historyDir, file), 'utf-8')
      const data = JSON.parse(content) as BenchmarkData
      if (!data.arenaRanking || !Array.isArray(data.arenaRanking)) continue
      snapshots.push({ date: file.replace('.json', ''), data })
    } catch {
      continue
    }
  }

  if (snapshots.length === 0) return []

  // Build per-org time series from Arena Elo
  // orgData: org → { date → { elo, bestModel } }
  const orgData = new Map<string, Map<string, { elo: number; bestModel: string }>>()

  for (const { date, data } of snapshots) {
    // Per org, keep the best model (first occurrence = highest Elo, since data is sorted)
    const orgBest = new Map<string, { elo: number; model: string }>()

    for (const entry of data.arenaRanking) {
      const org = entry.org || ''
      if (!org || !MAJOR_ORGS.has(org)) continue
      if (!orgBest.has(org)) {
        orgBest.set(org, { elo: entry.elo, model: entry.model })
      }
    }

    for (const [org, { elo, model }] of Array.from(orgBest.entries())) {
      if (!orgData.has(org)) orgData.set(org, new Map())
      orgData.get(org)!.set(date, { elo, bestModel: model })
    }
  }

  // Build series
  const allSeries: OrgTrendSeries[] = []
  for (const [org, dateMap] of Array.from(orgData.entries())) {
    const dates = Array.from(dateMap.keys()).sort()
    const points: OrgTrendPoint[] = dates.map(date => {
      const { elo, bestModel } = dateMap.get(date)!
      return { date, score: elo, bestModel }
    })
    allSeries.push({ org, points })
  }

  // Sort by latest Elo desc, take top N
  allSeries.sort((a, b) => {
    const aLast = a.points[a.points.length - 1]?.score ?? 0
    const bLast = b.points[b.points.length - 1]?.score ?? 0
    return bLast - aLast
  })

  return allSeries.slice(0, TOP_N_ORGS)
}
