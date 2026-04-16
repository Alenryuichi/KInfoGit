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
  tags: string[]
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
  tags: string[]
}

export interface YouTubeVideo {
  type: 'youtube'
  videoId: string
  title: string
  description: string
  channelTitle: string
  publishedAt: string
  thumbnail: string
  viewCount: number
  url: string
  highlights: string
  worthReading: string
}

export interface BlogPost {
  type: 'blog'
  title: string
  url: string
  author: string
  publishedAt: string
  summary: string
  highlights: string
  worthReading: string
}

export interface XPost {
  type: 'x'
  id: string
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
  retweetCount: number
  highlights: string
  worthReading: string
  tags: string[]
}

export type FeedItem = StarredRepo | BlueskyPost | YouTubeVideo | BlogPost | XPost

// --- Weekly Digest Types ---

export interface WeeklyDigest {
  week: string                // "2026-W15"
  dateRange: {
    start: string             // "2026-04-06"
    end: string               // "2026-04-12"
  }
  overview: string
  trendingTopics: Array<{ topic: string; description: string }>
  notableRepos: Array<{
    repo: string
    url: string
    stars: number
    description: string
    starredBy: string[]
  }>
  keyDiscussions: Array<{ title: string; summary: string; author: string }>
  crossReferences: Array<{ repo: string; starredBy: string[]; url: string }>
  stats: {
    totalRepos: number
    totalPosts: number
    uniqueAuthors: number
    daysWithContent: number
  }
}

export interface WeeklyDigestSummary {
  week: string
  dateRange: {
    start: string
    end: string
  }
  overview: string
  stats: {
    totalRepos: number
    totalPosts: number
    uniqueAuthors: number
    daysWithContent: number
  }
}

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
  youtubeCount: number
  blogCount: number
  xCount: number
}

// --- Data Directories ---

const GITHUB_STARS_DIR = path.join(process.cwd(), '..', 'profile-data', 'github-stars')
const BLUESKY_POSTS_DIR = path.join(process.cwd(), '..', 'profile-data', 'bluesky-posts')
const SUMMARIES_DIR = path.join(process.cwd(), '..', 'profile-data', 'daily-summaries')
const WEEKLY_DIGESTS_DIR = path.join(process.cwd(), '..', 'profile-data', 'weekly-digests')
const BLOG_POSTS_DIR = path.join(process.cwd(), '..', 'profile-data', 'blog-posts')
const YOUTUBE_VIDEOS_DIR = path.join(process.cwd(), '..', 'profile-data', 'youtube-videos')
const X_SIGNALS_DIR = path.join(process.cwd(), '..', 'profile-data', 'x-signals')

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

function getWeeklyDigestsDir(): string {
  if (fs.existsSync(WEEKLY_DIGESTS_DIR)) return WEEKLY_DIGESTS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'weekly-digests')
  if (fs.existsSync(alt)) return alt
  return WEEKLY_DIGESTS_DIR
}

function getBlogPostsDir(): string {
  if (fs.existsSync(BLOG_POSTS_DIR)) return BLOG_POSTS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'blog-posts')
  if (fs.existsSync(alt)) return alt
  return BLOG_POSTS_DIR
}

function getYouTubeDir(): string {
  if (fs.existsSync(YOUTUBE_VIDEOS_DIR)) return YOUTUBE_VIDEOS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'youtube-videos')
  if (fs.existsSync(alt)) return alt
  return YOUTUBE_VIDEOS_DIR
}

function getXSignalsDir(): string {
  if (fs.existsSync(X_SIGNALS_DIR)) return X_SIGNALS_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'x-signals')
  if (fs.existsSync(alt)) return alt
  return X_SIGNALS_DIR
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
      tags: star.tags ?? [],
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
      tags: post.tags ?? [],
    }))
  } catch {
    return []
  }
}

function loadBlogPosts(date: string): BlogPost[] {
  const dir = getBlogPostsDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    return (data.posts || []).map((post: any) => ({
      ...post,
      type: 'blog' as const,
    }))
  } catch {
    return []
  }
}

function loadYouTubeVideos(date: string): YouTubeVideo[] {
  const dir = getYouTubeDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    return (data.videos || []).map((video: any) => ({
      ...video,
      type: 'youtube' as const,
    }))
  } catch {
    return []
  }
}

function loadXSignals(date: string): XPost[] {
  const dir = getXSignalsDir()
  const filePath = path.join(dir, `${date}.json`)

  if (!fs.existsSync(filePath)) return []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    // Ensure all items have type: 'x'
    return (data.posts || []).map((post: any) => ({
      ...post,
      type: 'x' as const,
      tags: post.tags ?? [],
    }))
  } catch {
    return []
  }
}

// --- Public API ---

export function getAllFeedDates(): DailyFeedSummary[] {
  const githubDir = getGitHubDir()
  const blueskyDir = getBlueskyDir()
  const blogDir = getBlogPostsDir()
  const youtubeDir = getYouTubeDir()
  const xDir = getXSignalsDir()
  const dateMap = new Map<string, { github: number; bluesky: number; blog: number; youtube: number; x: number }>()

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
          dateMap.set(date, { github: 0, bluesky: 0, blog: 0, youtube: 0, x: 0 })
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
          dateMap.set(date, { github: 0, bluesky: 0, blog: 0, youtube: 0, x: 0 })
        }
        dateMap.get(date)!.bluesky = (data.posts || []).length
      } catch {
        continue
      }
    }
  }

  // Scan blog posts directory
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (!dateMatch) continue

      try {
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8')
        const data = JSON.parse(content)
        const date = data.date
        if (!dateMap.has(date)) {
          dateMap.set(date, { github: 0, bluesky: 0, blog: 0, youtube: 0, x: 0 })
        }
        dateMap.get(date)!.blog = (data.posts || []).length
      } catch {
        continue
      }
    }
  }

  // Scan YouTube videos directory
  if (fs.existsSync(youtubeDir)) {
    const files = fs.readdirSync(youtubeDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (!dateMatch) continue

      try {
        const content = fs.readFileSync(path.join(youtubeDir, file), 'utf-8')
        const data = JSON.parse(content)
        const date = data.date
        if (!dateMap.has(date)) {
          dateMap.set(date, { github: 0, bluesky: 0, blog: 0, youtube: 0, x: 0 })
        }
        dateMap.get(date)!.youtube = (data.videos || []).length
      } catch {
        continue
      }
    }
  }

  // Scan X signals directory
  if (fs.existsSync(xDir)) {
    const files = fs.readdirSync(xDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (!dateMatch) continue

      try {
        const content = fs.readFileSync(path.join(xDir, file), 'utf-8')
        const data = JSON.parse(content)
        const date = data.date
        if (!dateMap.has(date)) {
          dateMap.set(date, { github: 0, bluesky: 0, blog: 0, youtube: 0, x: 0 })
        }
        dateMap.get(date)!.x = (data.posts || []).length
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
      itemCount: counts.github + counts.bluesky + counts.blog + counts.youtube + counts.x,
      githubCount: counts.github,
      blueskyCount: counts.bluesky,
      youtubeCount: counts.youtube,
      blogCount: counts.blog,
      xCount: counts.x,
    })
  })

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
}

export function getFeedByDate(date: string): DailyFeed | null {
  const githubStars = loadGitHubStars(date)
  const blueskyPosts = loadBlueskyPosts(date)
  const blogPosts = loadBlogPosts(date)
  const youtubeVideos = loadYouTubeVideos(date)
  const xPosts = loadXSignals(date)

  // If no source has data, return null
  if (githubStars.length === 0 && blueskyPosts.length === 0 && blogPosts.length === 0 && youtubeVideos.length === 0 && xPosts.length === 0) {
    return null
  }

  // Merge items — GitHub stars first, then Bluesky posts, then X posts, then YouTube videos, then blog posts
  const items: FeedItem[] = [...githubStars, ...blueskyPosts, ...xPosts, ...youtubeVideos, ...blogPosts]

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

// --- Weekly Digest API ---

export function getAllWeeklyDigests(): WeeklyDigestSummary[] {
  const dir = getWeeklyDigestsDir()
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  const digests: WeeklyDigestSummary[] = []

  // Compute current ISO week to exclude incomplete weeks
  const now = new Date()
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  const currentWeek = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`

  for (const file of files) {
    const match = file.match(/^(\d{4}-W\d{2})\.json$/)
    if (!match) continue

    // Skip current (incomplete) week
    if (match[1] >= currentWeek) continue

    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')
      const data = JSON.parse(content) as WeeklyDigest
      digests.push({
        week: data.week,
        dateRange: data.dateRange,
        overview: data.overview,
        stats: data.stats,
      })
    } catch {
      continue
    }
  }

  return digests.sort((a, b) => b.week.localeCompare(a.week))
}

export function getWeeklyDigestByWeek(week: string): WeeklyDigest | null {
  const dir = getWeeklyDigestsDir()
  const filePath = path.join(dir, `${week}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as WeeklyDigest
  } catch {
    return null
  }
}

export function getAdjacentWeeks(week: string): { prev: string | null; next: string | null } {
  const weeks = getAllWeeklyDigests().map(d => d.week)
  const idx = weeks.indexOf(week)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx < weeks.length - 1 ? weeks[idx + 1] : null,
    next: idx > 0 ? weeks[idx - 1] : null,
  }
}

// --- Tag Stats ---

export interface TagStat {
  tag: string
  count: number
}

export function getTagStats(): TagStat[] {
  const dates = getAllFeedDates()
  const tagCounts = new Map<string, number>()

  for (const { date } of dates) {
    const githubStars = loadGitHubStars(date)
    const blueskyPosts = loadBlueskyPosts(date)
    const xPosts = loadXSignals(date)

    for (const star of githubStars) {
      for (const tag of star.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
    for (const post of blueskyPosts) {
      for (const tag of post.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
    for (const post of xPosts) {
      for (const tag of post.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
  }

  const stats: TagStat[] = []
  tagCounts.forEach((count, tag) => {
    stats.push({ tag, count })
  })

  return stats.sort((a, b) => b.count - a.count)
}

// --- Top Highlights ---

function getItemEngagement(item: FeedItem): number {
  if (item.type === 'github') return item.stargazersCount
  if (item.type === 'bluesky') return item.likeCount + item.repostCount
  if (item.type === 'x') return item.likeCount + item.retweetCount
  if (item.type === 'youtube') return item.viewCount || 0
  if (item.type === 'blog') return item.highlights ? 10 : 0
  return 0
}

export interface HighlightItem {
  item: FeedItem
  date: string
  engagement: number
}

export function getTopHighlights(limit: number = 5): HighlightItem[] {
  const dates = getAllFeedDates()
  const all: HighlightItem[] = []

  for (const { date } of dates) {
    const feed = getFeedByDate(date)
    if (!feed) continue

    for (const item of feed.items) {
      all.push({ item, date, engagement: getItemEngagement(item) })
    }
  }

  return all.sort((a, b) => b.engagement - a.engagement).slice(0, limit)
}

// --- All Feed Items (for timeline) ---

export interface TimelineFeedItem {
  item: FeedItem
  date: string
  sortTime: string
}

export function getAllFeedItems(): TimelineFeedItem[] {
  const dates = getAllFeedDates()
  const all: TimelineFeedItem[] = []

  for (const { date } of dates) {
    const feed = getFeedByDate(date)
    if (!feed) continue

    for (const item of feed.items) {
      let sortTime = date
      if (item.type === 'bluesky') sortTime = item.createdAt
      else if (item.type === 'x') sortTime = item.createdAt
      else if (item.type === 'youtube') sortTime = item.publishedAt
      else if (item.type === 'blog') sortTime = item.publishedAt

      all.push({ item, date, sortTime })
    }
  }

  return all.sort((a, b) => b.sortTime.localeCompare(a.sortTime))
}
