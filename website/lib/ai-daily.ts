import fs from 'fs'
import path from 'path'

// --- Config ---

/**
 * Minimum score (inclusive) for a NewsItem to be shown in the UI.
 * Items below this line are dropped from the rendered digest in both
 * the list page (focusTopics aggregation) and the detail page (section
 * items). Keep in sync with the header/footer copy in [date].tsx.
 *
 * 5.0 is chosen because the scoring pipeline's keywordFallback path
 * assigns score=5 to items that survived keyword matching after LLM
 * failure — we want to keep those, but drop anything the LLM explicitly
 * scored below 5 as low-quality.
 */
export const MIN_SCORE = 5.0

// --- Types ---

export interface NewsSource {
  name: string
  meta?: string
}

export interface NewsItem {
  title: string
  summary: string
  url: string
  score: number
  sources: NewsSource[]
  tags: string[]
  background?: string
  discussion?: string
  focusTopics?: string[]
}

export interface DigestSection {
  id: string
  title: string
  items: NewsItem[]
}

export interface DailyDigest {
  date: string
  itemCount: number
  sections: DigestSection[]
  aiSummary?: string | null
}

export interface DailyDigestSummary {
  date: string
  itemCount: number
  focusTopics?: string[]
}

// --- Data Directory ---

import { resolveProfileDataPath } from './profile-data-paths'

function getDataDir(): string {
  return resolveProfileDataPath('ai-daily')
}

// --- Public API ---

export function getAllDailyDates(): DailyDigestSummary[] {
  const dir = getDataDir()
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  const summaries: DailyDigestSummary[] = []

  for (const file of files) {
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
    if (!dateMatch) continue

    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      const data = JSON.parse(content) as DailyDigest
      // Apply MIN_SCORE filter so list-page counts/topics match detail-page render
      const allTopics = new Set<string>()
      let filteredCount = 0
      for (const section of data.sections) {
        for (const item of section.items) {
          if (item.score < MIN_SCORE) continue
          filteredCount += 1
          for (const t of item.focusTopics ?? []) {
            allTopics.add(t)
          }
        }
      }
      const topicArray = allTopics.size > 0 ? Array.from(allTopics).sort() : []
      summaries.push({
        date: data.date,
        itemCount: filteredCount,
        ...(topicArray.length > 0 ? { focusTopics: topicArray } : {}),
      })
    } catch {
      continue
    }
  }

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Return a digest with sections/items filtered to score >= MIN_SCORE
 * and an itemCount recomputed from the visible items. Empty sections
 * are removed so the UI never shows a zero-item header.
 */
export function getFilteredDailyDigest(date: string): DailyDigest | null {
  const raw = getDailyDigest(date)
  if (!raw) return null

  const sections = raw.sections
    .map(s => ({
      ...s,
      items: s.items.filter(i => i.score >= MIN_SCORE),
    }))
    .filter(s => s.items.length > 0)

  const itemCount = sections.reduce((n, s) => n + s.items.length, 0)

  return { ...raw, sections, itemCount }
}

export function getDailyDigest(date: string): DailyDigest | null {
  const dir = getDataDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as DailyDigest
  } catch {
    return null
  }
}

export function getLatestDate(): string | null {
  const dates = getAllDailyDates()
  return dates.length > 0 ? dates[0].date : null
}

export function getAdjacentDates(date: string): { prev: string | null; next: string | null } {
  const dates = getAllDailyDates().map(d => d.date)
  const idx = dates.indexOf(date)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx < dates.length - 1 ? dates[idx + 1] : null,
    next: idx > 0 ? dates[idx - 1] : null,
  }
}
