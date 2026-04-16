import fs from 'fs'
import path from 'path'

// ─── Types (mirrored from scripts/spec-tracker/types.ts for website) ───

export interface GitHubStats {
  repo: string
  stars: number
  forks: number
  openIssues: number
  pushedAt: string
  latestRelease?: { tag: string; publishedAt: string }
  weeklyCommits: number
  contributors: number
}

export interface NpmStats {
  package: string
  latestVersion: string
  weeklyDownloads: number
  lastPublishedAt: string
}

export interface ChangelogEntry {
  version?: string
  date: string
  highlights: string[]
}

export interface SpecFramework {
  id: string
  name: string
  category: 'toolkit' | 'agent-framework' | 'ide' | 'platform' | 'rules'
  description: string
  website?: string
  github?: GitHubStats
  npm?: NpmStats
  changelog?: ChangelogEntry[]
}

export interface DiscoveredProject {
  name: string
  fullName: string
  stars: number
  description: string
  url: string
  language: string
  pushedAt: string
  discoveredAt: string
  source: 'github' | 'npm'
  aiRelevant?: boolean
  aiReason?: string
}

export interface FrameworkDelta {
  frameworkId: string
  starsDelta: number | null
  npmDelta: number | null
}

export interface WeeklyDiff {
  topGainer: { frameworkId: string; delta: number } | null
  newDiscovered: string[]
  exitedDiscovered: string[]
}

export interface SpecSnapshot {
  updatedAt: string
  frameworks: SpecFramework[]
  discovered: DiscoveredProject[]
  deltas?: FrameworkDelta[]
  weeklyDiff?: WeeklyDiff | null
  insights?: string | null
}

export interface StarsTrendPoint {
  date: string
  stars: number
}

export interface StarsTrendSeries {
  id: string
  name: string
  points: StarsTrendPoint[]
}

// ─── Data Directory ────────────────────────────────────────

const SPECS_DIR = path.join(process.cwd(), '..', 'profile-data', 'specs')

function getSpecsDir(): string {
  if (fs.existsSync(SPECS_DIR)) return SPECS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'specs')
  if (fs.existsSync(alt)) return alt
  return SPECS_DIR
}

// ─── Public API ────────────────────────────────────────────

export function getLatestSpecs(): SpecSnapshot | null {
  const dir = getSpecsDir()
  const filePath = path.join(dir, 'latest.json')

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as SpecSnapshot
  } catch {
    return null
  }
}

const MAX_HISTORY_DAYS = 365

export function getSpecTrend(): StarsTrendSeries[] {
  const dir = getSpecsDir()
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

  // Parse snapshots and build per-framework stars series
  const frameworkData = new Map<string, Map<string, number>>() // id → { date → stars }
  const frameworkNames = new Map<string, string>() // id → name

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(historyDir, file), 'utf-8')
      const snapshot = JSON.parse(content) as SpecSnapshot
      const date = file.replace('.json', '')

      for (const fw of snapshot.frameworks) {
        if (!fw.github?.stars) continue

        if (!frameworkData.has(fw.id)) {
          frameworkData.set(fw.id, new Map())
        }
        frameworkData.get(fw.id)!.set(date, fw.github.stars)
        frameworkNames.set(fw.id, fw.name)
      }
    } catch {
      continue
    }
  }

  // Build series
  const allSeries: StarsTrendSeries[] = []
  for (const [id, dateMap] of Array.from(frameworkData.entries())) {
    const dates = Array.from(dateMap.keys()).sort()
    const points: StarsTrendPoint[] = dates.map(date => ({
      date,
      stars: dateMap.get(date)!,
    }))
    allSeries.push({ id, name: frameworkNames.get(id) ?? id, points })
  }

  // Sort by latest stars desc
  allSeries.sort((a, b) => {
    const aLast = a.points[a.points.length - 1]?.stars ?? 0
    const bLast = b.points[b.points.length - 1]?.stars ?? 0
    return bLast - aLast
  })

  return allSeries
}
