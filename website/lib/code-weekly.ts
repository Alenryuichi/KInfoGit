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

/**
 * Items imported from AI Daily's `coding-agents` focus-topic pool.
 * These are typically GitHub-trending repos, MCP servers, memory-layer
 * tools, Claude Code skills, etc — signal that Code Weekly's own sources
 * (GitHub Releases of 10 tracked editors, company RSS, Tavily/Bailian)
 * don't reach. Optional for backward compatibility with weeks written
 * before this field existed.
 */
export interface EcosystemItem {
  title: string
  url: string
  summary: string
  score: number
  source: string
  publishedAt: string
  secondaryTopics: string[]
}

export interface CodeWeekly {
  week: string
  dateRange: string
  generatedAt: string
  editors: EditorUpdate[]
  benchmarks: BenchmarkData
  blogs: BlogPost[]
  ecosystem?: EcosystemItem[]
  weekSummary: string
}

export interface CodeWeeklySummary {
  week: string
  dateRange: string
  weekSummary: string
  editorCount: number
}

// ─── Data Directory ────────────────────────────────────────

import { resolveProfileDataPath } from './profile-data-paths'

function getCodeWeeklyDir(): string {
  return resolveProfileDataPath('code-weekly')
}

function getBenchmarksDir(): string {
  return resolveProfileDataPath('benchmarks')
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

// ─── Editor Diff Matrix ────────────────────────────────────
//
// Build-time composition for the "Week-over-Week Overview" section on
// /code/[week]. Turns two EditorUpdate[] arrays (current + optional
// previous) into a compact matrix for scan-level cross-editor reading.
//
// This is all deterministic / keyword-match based — no LLM. See
// openspec/changes/archive/YYYY-MM-DD-code-weekly-editor-diff/design.md
// for the rationale on why we intentionally avoid LLM scoring here.

export type EditorTheme = 'release' | 'feature' | 'fix' | 'perf' | 'policy' | 'integration'

export type EditorWowDelta =
  | 'first'         // this week has activity, last week had 0 → ✨ first-time
  | 'silent'        // this week has 0, last week had activity → ⚠ silent
  | 'accelerating'  // delta ≥ +2 → ↑
  | 'slowing'       // delta ≤ −2 → ↓
  | 'steady'        // small fluctuation → →
  | 'unknown'       // no previous-week record at all

export interface EditorDiffRow {
  name: string
  category: 'ide' | 'cli'
  version?: string
  /** 0 = silent, 5 = heavy. See computeActivityDots for composition. */
  activityDots: 0 | 1 | 2 | 3 | 4 | 5
  /** Themes matched from highlights + aiSummary keyword scan. */
  themes: EditorTheme[]
  wow: EditorWowDelta
}

export interface EditorDiffMatrix {
  ide: EditorDiffRow[]
  cli: EditorDiffRow[]
  /** True when previous-week data was available for WoW computation. */
  hasPrevious: boolean
}

/**
 * Declaration order here is the render order of theme chips in the UI.
 * CN + EN keywords; case-insensitive matching on .toLowerCase() of input.
 */
const THEME_KEYWORDS: Record<EditorTheme, string[]> = {
  release:     ['release', 'launch', 'announce', 'ga', '发布', '推出', '宣布', '上线'],
  feature:     ['feature', ' new ', 'introduce', 'add support', '新增', '引入', '新功能', '新增功能'],
  fix:         ['fix', 'bug', 'patch', 'issue', '修复', '问题', '错误', '补丁'],
  perf:        ['performance', 'speed', 'memory', 'cpu', 'faster', '性能', '速度', '内存', '优化'],
  policy:      ['policy', 'privacy', 'training data', 'opt-out', 'opt out', '政策', '隐私', '训练', '数据隐私'],
  integration: ['integration', 'provider', 'mcp', 'plugin', 'self-host', 'integrate', '集成', '支持', '插件', '提供商'],
}

/** Stub summary emitted by the pipeline when an editor has no real updates. */
const STUB_AI_SUMMARY = '本周暂无重大更新'

/**
 * Visible text an editor update contributes to theme keyword scanning.
 * Intentionally combines highlights + aiSummary so a summary that only
 * mentions a theme (not a highlight) still gets counted.
 */
function scanText(editor: EditorUpdate): string {
  const parts: string[] = []
  for (const h of editor.highlights) parts.push(h)
  if (editor.aiSummary) parts.push(editor.aiSummary)
  return parts.join(' ').toLowerCase()
}

/**
 * Classify themes by keyword hit. A theme is included if ANY of its
 * keywords match; duplicates across keywords don't add weight (this is
 * a set of labels, not a score).
 */
export function classifyThemes(editor: EditorUpdate): EditorTheme[] {
  const text = scanText(editor)
  if (!text) return []
  const hit: EditorTheme[] = []
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS) as Array<[EditorTheme, string[]]>) {
    if (keywords.some(k => text.includes(k.toLowerCase()))) {
      hit.push(theme)
    }
  }
  return hit
}

/**
 * Compose 0-5 activity dots from highlights count + version presence +
 * stub-summary detection. See design.md for the exact table.
 */
export function computeActivityDots(editor: EditorUpdate): EditorDiffRow['activityDots'] {
  // Defensive clamp: if the pipeline emitted the stub summary, we
  // treat the editor as silent even if highlights has stray content.
  if (editor.aiSummary === STUB_AI_SUMMARY) return 0

  const n = editor.highlights.length
  let base: 0 | 1 | 2 | 3 | 4 | 5
  if (n === 0) base = 0
  else if (n <= 1) base = 1
  else if (n === 2) base = 2
  else if (n === 3) base = 3
  else if (n === 4) base = 4
  else base = 5

  // Version presence bumps by +1, capped at 5.
  if (editor.version && editor.version.trim().length > 0) {
    const bumped = Math.min(5, base + 1)
    return bumped as EditorDiffRow['activityDots']
  }
  return base
}

/**
 * Decide WoW delta kind. Both inputs may be undefined; if previous is
 * missing, return 'unknown' so the UI can render "—".
 */
export function computeWow(
  current: EditorUpdate,
  previous: EditorUpdate | undefined,
): EditorWowDelta {
  if (!previous) return 'unknown'

  const curN = current.highlights.length
  const prevN = previous.highlights.length

  // First-time / silent transitions take priority over delta size.
  if (curN >= 2 && prevN === 0) return 'first'
  if (curN === 0 && prevN >= 2) return 'silent'

  const delta = curN - prevN
  if (delta >= 2) return 'accelerating'
  if (delta <= -2) return 'slowing'
  return 'steady'
}

/**
 * Build the full diff matrix. Iterates the current-week editor list,
 * looks up each editor by name in the previous week (if provided), and
 * groups results into ide / cli buckets sorted by activityDots DESC,
 * name ASC.
 */
export function computeEditorDiffMatrix(
  current: EditorUpdate[],
  previous?: EditorUpdate[],
): EditorDiffMatrix {
  const prevByName = new Map<string, EditorUpdate>()
  if (previous) {
    for (const e of previous) prevByName.set(e.name, e)
  }

  const rows: EditorDiffRow[] = current.map(editor => ({
    name: editor.name,
    category: editor.category,
    version: editor.version,
    activityDots: computeActivityDots(editor),
    themes: classifyThemes(editor),
    wow: computeWow(editor, prevByName.get(editor.name)),
  }))

  // Split into ide / cli buckets, sort each.
  const ide = rows.filter(r => r.category === 'ide')
  const cli = rows.filter(r => r.category === 'cli')
  const sortRows = (arr: EditorDiffRow[]) =>
    arr.sort((a, b) => b.activityDots - a.activityDots || a.name.localeCompare(b.name))

  return {
    ide: sortRows(ide),
    cli: sortRows(cli),
    hasPrevious: Boolean(previous && previous.length > 0),
  }
}
