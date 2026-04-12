import fs from 'fs'
import path from 'path'

// --- Types ---

export interface StarredRepo {
  type: 'github'
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

export interface BlueskyPost {
  type: 'bluesky'
  uri: string
  url: string
  author: {
    handle: string
    displayName: string
    avatar: string | null
  }
  content: string
  createdAt: string
  likeCount: number
  replyCount: number
  repostCount: number
  highlights: string
  worthReading: string
}

export type FeedItem = StarredRepo | BlueskyPost

export interface DailyFeed {
  date: string
  summary: string
  items: FeedItem[]
}

export interface DailyFeedSummary {
  date: string
  itemCount: number
  githubCount: number
  blueskyCount: number
}

// --- Data Directories ---

const GITHUB_STARS_DIR = path.join(process.cwd(), '..', 'profile-data', 'github-stars')
const BLUESKY_POSTS_DIR = path.join(process.cwd(), '..', 'profile-data', 'bluesky-posts')
const SUMMARIES_DIR = path.join(process.cwd(), '..', 'profile-data', 'daily-summaries')

function getGitHubDir(): string {
  if (fs.existsSync(GITHUB_STARS_DIR)) return GITHUB_STARS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'github-stars')
  if (fs.existsSync(alt)) return alt
  return GITHUB_STARS_DIR
}

function getBlueskyDir(): string {
  if (fs.existsSync(BLUESKY_POSTS_DIR)) return BLUESKY_POSTS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'bluesky-posts')
  if (fs.existsSync(alt)) return alt
  return BLUESKY_POSTS_DIR
}

function getSummariesDir(): string {
  if (fs.existsSync(SUMMARIES_DIR)) return SUMMARIES_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'daily-summaries')
  if (fs.existsSync(alt)) return alt
  return SUMMARIES_DIR
}

// --- Helper Functions ---

function loadDailySummary(date: string): string {
  const dir = getSummariesDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return ''

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    return data.summary || ''
  } catch {
    return ''
  }
}

function loadGitHubStars(date: string): StarredRepo[] {
  const dir = getGitHubDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    // Ensure all items have type: 'github'
    return (data.stars || []).map((star: any) => ({
      ...star,
      type: 'github' as const,
    }))
  } catch {
    return []
  }
}

function loadBlueskyPosts(date: string): BlueskyPost[] {
  const dir = getBlueskyDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    // Ensure all items have type: 'bluesky'
    return (data.posts || []).map((post: any) => ({
      ...post,
      type: 'bluesky' as const,
    }))
  } catch {
    return []
  }
}

// --- Public API ---

export function getAllFeedDates(): DailyFeedSummary[] {
  const githubDir = getGitHubDir()
  const blueskyDir = getBlueskyDir()
  const dateMap = new Map<string, { github: number; bluesky: number }>()

  // Scan GitHub stars directory
  if (fs.existsSync(githubDir)) {
    const files = fs.readdirSync(githubDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (!dateMatch) continue

      try {
        const content = fs.readFileSync(path.join(githubDir, file), 'utf-8')
        const data = JSON.parse(content)
        const date = data.date
        if (!dateMap.has(date)) {
          dateMap.set(date, { github: 0, bluesky: 0 })
        }
        dateMap.get(date)!.github = (data.stars || []).length
      } catch {
        continue
      }
    }
  }

  // Scan Bluesky posts directory
  if (fs.existsSync(blueskyDir)) {
    const files = fs.readdirSync(blueskyDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (!dateMatch) continue

      try {
        const content = fs.readFileSync(path.join(blueskyDir, file), 'utf-8')
        const data = JSON.parse(content)
        const date = data.date
        if (!dateMap.has(date)) {
          dateMap.set(date, { github: 0, bluesky: 0 })
        }
        dateMap.get(date)!.bluesky = (data.posts || []).length
      } catch {
        continue
      }
    }
  }

  // Convert to sorted array
  const summaries: DailyFeedSummary[] = []
  dateMap.forEach((counts, date) => {
    summaries.push({
      date,
      itemCount: counts.github + counts.bluesky,
      githubCount: counts.github,
      blueskyCount: counts.bluesky,
    })
  })

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
}

export function getFeedByDate(date: string): DailyFeed | null {
  const githubStars = loadGitHubStars(date)
  const blueskyPosts = loadBlueskyPosts(date)

  // If neither source has data, return null
  if (githubStars.length === 0 && blueskyPosts.length === 0) {
    return null
  }

  // Merge items — GitHub stars first, then Bluesky posts
  const items: FeedItem[] = [...githubStars, ...blueskyPosts]

  // Load AI-generated daily summary
  const summary = loadDailySummary(date)

  return { date, summary, items }
}

export function getAdjacentDates(date: string): { prev: string | null; next: string | null } {
  const dates = getAllFeedDates().map(d => d.date)
  const idx = dates.indexOf(date)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx < dates.length - 1 ? dates[idx + 1] : null,
    next: idx > 0 ? dates[idx - 1] : null,
  }
}

// --- Backward Compatibility ---

export interface DailyStars {
  date: string
  stars: StarredRepo[]
}

export interface DailyStarsSummary {
  date: string
  starCount: number
}

export function getAllStarDates(): DailyStarsSummary[] {
  return getAllFeedDates().map(feed => ({
    date: feed.date,
    starCount: feed.githubCount,
  }))
}

export function getStarsByDate(date: string): DailyStars | null {
  const feed = getFeedByDate(date)
  if (!feed) return null

  const stars = feed.items.filter((item): item is StarredRepo => item.type === 'github')
  return { date, stars }
}
