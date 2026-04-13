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
