import fs from 'fs'
import path from 'path'

// --- Types ---

export interface StarredRepo {
  repo: string
  url: string
  description: string
  language: string | null
  stargazersCount: number
  starredBy: string
  highlights: string
  worthReading: string
  topics: string[]
}

export interface DailyStars {
  date: string
  stars: StarredRepo[]
}

export interface DailyStarsSummary {
  date: string
  starCount: number
}

// --- Data Directory ---

const STARS_DIR = path.join(process.cwd(), '..', 'profile-data', 'github-stars')

function getDataDir(): string {
  // Handle both dev (website/) and build contexts
  if (fs.existsSync(STARS_DIR)) return STARS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'github-stars')
  if (fs.existsSync(alt)) return alt
  return STARS_DIR
}

// --- Public API ---

export function getAllStarDates(): DailyStarsSummary[] {
  const dir = getDataDir()
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  const summaries: DailyStarsSummary[] = []

  for (const file of files) {
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
    if (!dateMatch) continue

    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      const data = JSON.parse(content) as DailyStars
      summaries.push({
        date: data.date,
        starCount: data.stars.length,
      })
    } catch {
      continue
    }
  }

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
}

export function getStarsByDate(date: string): DailyStars | null {
  const dir = getDataDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as DailyStars
  } catch {
    return null
  }
}

export function getAdjacentDates(date: string): { prev: string | null; next: string | null } {
  const dates = getAllStarDates().map(d => d.date)
  const idx = dates.indexOf(date)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx < dates.length - 1 ? dates[idx + 1] : null,
    next: idx > 0 ? dates[idx - 1] : null,
  }
}
