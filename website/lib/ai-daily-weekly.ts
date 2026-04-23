import fs from 'fs'
import path from 'path'
import { resolveProfileDataPath } from './profile-data-paths'

// --- Types ---

/**
 * One story inside a topic bucket. Fields are deliberately narrower than the
 * daily `NewsItem` — the weekly digest only surfaces what the UI needs for
 * the "Top Stories by Topic" card, so we drop things like `background` /
 * `discussion` / `tags` / `focusTopics` (the bucket already implies the
 * topic, and weekly UI doesn't render free-form tags).
 */
export interface TopStory {
  title: string
  url: string
  oneLiner: string
  score: number
  sources: string[] // just the source names, flattened
}

export interface TopicBucket {
  topic: string // focusTopic id, e.g. "coding-agents"
  topicLabel: string // UI label, e.g. "Coding Agents"
  stories: TopStory[]
}

export interface AiDailyWeeklyDigest {
  week: string // "2026-W16"
  dateRange: {
    start: string // "2026-04-13"
    end: string // "2026-04-19"
  }
  overview: string
  topStoriesByTopic: TopicBucket[]
  trendingTopics: Array<{ topic: string; description: string }>
  keyReads: Array<{
    title: string
    url: string
    summary: string
    why: string
  }>
  stats: {
    totalItems: number
    uniqueTopics: number
    daysWithContent: number
    /**
     * Counts per focusTopic id for the week, including topics that didn't
     * make it into `topStoriesByTopic` (e.g. legacy v1 topics). Useful for
     * the list-page banner to show "top 3 topics this week".
     */
    topicCounts: Record<string, number>
  }
}

/**
 * Summary-only shape returned by `getAllAiDailyWeeklies()` — avoids reading
 * large arrays into every list-page render. Mirrors the stars
 * `WeeklyDigestSummary` approach.
 */
export interface AiDailyWeeklySummary {
  week: string
  dateRange: { start: string; end: string }
  overview: string
  stats: AiDailyWeeklyDigest['stats']
}

// --- Data Directory ---

function getDir(): string {
  return resolveProfileDataPath('ai-daily-weekly')
}

// --- ISO Week helpers (kept local so consumers don't need to cross-import) ---

function currentIsoWeek(): string {
  const now = new Date()
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

// --- Public API ---

/**
 * Return all persisted AI Daily weekly digests, newest first, excluding the
 * current (still-incomplete) ISO week.
 */
export function getAllAiDailyWeeklies(): AiDailyWeeklySummary[] {
  const dir = getDir()
  if (!fs.existsSync(dir)) return []

  const currentWeek = currentIsoWeek()
  const summaries: AiDailyWeeklySummary[] = []

  let files: string[] = []
  try {
    files = fs.readdirSync(dir).filter(f => /^\d{4}-W\d{2}\.json$/.test(f))
  } catch {
    return []
  }

  for (const file of files) {
    const week = file.replace(/\.json$/, '')
    if (week >= currentWeek) continue
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const data = JSON.parse(raw) as AiDailyWeeklyDigest
      if (!data?.week || !data?.dateRange) continue
      summaries.push({
        week: data.week,
        dateRange: data.dateRange,
        overview: data.overview ?? '',
        stats: data.stats,
      })
    } catch {
      continue
    }
  }

  return summaries.sort((a, b) => b.week.localeCompare(a.week))
}

export function getAiDailyWeeklyByWeek(week: string): AiDailyWeeklyDigest | null {
  const filePath = path.join(getDir(), `${week}.json`)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as AiDailyWeeklyDigest
  } catch {
    return null
  }
}

export function getAdjacentAiDailyWeeks(
  week: string
): { prev: string | null; next: string | null } {
  const weeks = getAllAiDailyWeeklies().map(d => d.week)
  const idx = weeks.indexOf(week)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx < weeks.length - 1 ? weeks[idx + 1] : null,
    next: idx > 0 ? weeks[idx - 1] : null,
  }
}

/**
 * Convenience for the `/ai-daily` list-page banner. Returns the most recent
 * complete-week digest, or `null` when none exists.
 */
export function getLatestAiDailyWeekly(): AiDailyWeeklyDigest | null {
  const all = getAllAiDailyWeeklies()
  if (all.length === 0) return null
  return getAiDailyWeeklyByWeek(all[0].week)
}
