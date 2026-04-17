import fs from 'fs'
import path from 'path'

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

const AI_DAILY_DIR = path.join(process.cwd(), '..', 'profile-data', 'ai-daily')

function getDataDir(): string {
  // Handle both dev (website/) and build contexts
  if (fs.existsSync(AI_DAILY_DIR)) return AI_DAILY_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'ai-daily')
  if (fs.existsSync(alt)) return alt
  return AI_DAILY_DIR
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
      const allTopics = new Set<string>()
      for (const section of data.sections) {
        for (const item of section.items) {
          for (const t of item.focusTopics ?? []) {
            allTopics.add(t)
          }
        }
      }
      const topicArray = allTopics.size > 0 ? Array.from(allTopics).sort() : []
      summaries.push({
        date: data.date,
        itemCount: data.itemCount,
        ...(topicArray.length > 0 ? { focusTopics: topicArray } : {}),
      })
    } catch {
      continue
    }
  }

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
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
