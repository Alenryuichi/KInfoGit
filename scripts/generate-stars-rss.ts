import fs from 'fs'
import path from 'path'

// --- Config ---

const PROFILE_DATA_DIR = path.join(__dirname, '..', 'profile-data')
const GITHUB_STARS_DIR = path.join(PROFILE_DATA_DIR, 'github-stars')
const BLUESKY_POSTS_DIR = path.join(PROFILE_DATA_DIR, 'bluesky-posts')
const X_SIGNALS_DIR = path.join(PROFILE_DATA_DIR, 'x-signals')
const YOUTUBE_VIDEOS_DIR = path.join(PROFILE_DATA_DIR, 'youtube-videos')
const BLOG_POSTS_DIR = path.join(PROFILE_DATA_DIR, 'blog-posts')
const SUMMARIES_DIR = path.join(PROFILE_DATA_DIR, 'daily-summaries')
const OUTPUT_PATH = path.join(__dirname, '..', 'website', 'public', 'stars', 'feed.xml')

const SITE_URL = 'https://kylinmiao.me'
const FEED_TITLE = 'Stars & Posts — Kylin Miao'
const FEED_DESCRIPTION =
  'Daily curated GitHub starred repos, Bluesky/X posts, YouTube videos and blog articles from AI leaders with AI-powered summaries.'
const MAX_ITEMS = 30

// --- XML Helpers ---

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRFC822Date(dateStr: string): string {
  // dateStr is YYYY-MM-DD; use noon UTC to avoid timezone edge cases
  const date = new Date(`${dateStr}T12:00:00Z`)
  return date.toUTCString()
}

// --- Data Reading ---

const SOURCE_DIRS = [
  GITHUB_STARS_DIR,
  BLUESKY_POSTS_DIR,
  X_SIGNALS_DIR,
  YOUTUBE_VIDEOS_DIR,
  BLOG_POSTS_DIR,
]

function collectAllDates(): string[] {
  const dates = new Set<string>()

  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (match) dates.add(match[1])
    }
  }

  return Array.from(dates).sort((a, b) => b.localeCompare(a))
}

interface StarData {
  repo: string
  url: string
  description: string
  language: string | null
}

interface SocialPostData {
  author: { handle: string; displayName: string }
  content: string
  url: string
}

interface VideoData {
  title: string
  channelTitle: string
  url: string
}

interface BlogData {
  title: string
  author: string
  url: string
  summary: string
}

function loadJsonArray<T>(filePath: string, key: string, mapper: (raw: any) => T): T[] {
  if (!fs.existsSync(filePath)) return []
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return ((data?.[key] as any[]) || []).map(mapper)
  } catch {
    return []
  }
}

function loadGitHubStars(date: string): StarData[] {
  return loadJsonArray<StarData>(path.join(GITHUB_STARS_DIR, `${date}.json`), 'stars', s => ({
    repo: s.repo,
    url: s.url,
    description: s.description || '',
    language: s.language ?? null,
  }))
}

function loadBlueskyPosts(date: string): SocialPostData[] {
  return loadJsonArray<SocialPostData>(
    path.join(BLUESKY_POSTS_DIR, `${date}.json`),
    'posts',
    p => ({
      author: {
        handle: p.author?.handle ?? '',
        displayName: p.author?.displayName ?? '',
      },
      content: p.content ?? '',
      url: p.url ?? '',
    })
  )
}

function loadXPosts(date: string): SocialPostData[] {
  return loadJsonArray<SocialPostData>(
    path.join(X_SIGNALS_DIR, `${date}.json`),
    'posts',
    p => ({
      author: {
        handle: p.author?.handle ?? '',
        displayName: p.author?.displayName ?? '',
      },
      content: p.content ?? '',
      url: p.url ?? '',
    })
  )
}

function loadYouTubeVideos(date: string): VideoData[] {
  return loadJsonArray<VideoData>(path.join(YOUTUBE_VIDEOS_DIR, `${date}.json`), 'videos', v => ({
    title: v.title ?? '',
    channelTitle: v.channelTitle ?? '',
    url: v.url ?? '',
  }))
}

function loadBlogPosts(date: string): BlogData[] {
  return loadJsonArray<BlogData>(path.join(BLOG_POSTS_DIR, `${date}.json`), 'posts', b => ({
    title: b.title ?? '',
    author: b.author ?? '',
    url: b.url ?? '',
    summary: b.summary ?? '',
  }))
}

function loadSummary(date: string): string {
  const filePath = path.join(SUMMARIES_DIR, `${date}.json`)
  if (!fs.existsSync(filePath)) return ''

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return data.summary || ''
  } catch {
    return ''
  }
}

// --- RSS Item Generation ---

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

function buildItemDescription(
  summary: string,
  stars: StarData[],
  bsky: SocialPostData[],
  x: SocialPostData[],
  videos: VideoData[],
  blogs: BlogData[]
): string {
  const parts: string[] = []

  if (summary) {
    parts.push(summary)
    parts.push('')
  }

  if (stars.length > 0) {
    parts.push('GitHub Repos:')
    for (const star of stars) {
      const desc = star.description ? ` — ${star.description}` : ''
      const lang = star.language ? ` [${star.language}]` : ''
      parts.push(`* ${star.repo}${desc}${lang}`)
    }
    parts.push('')
  }

  if (bsky.length > 0) {
    parts.push('Bluesky Posts:')
    for (const post of bsky) {
      const name = post.author.displayName || post.author.handle
      parts.push(`* ${name}: ${truncate(post.content, 150)}`)
    }
    parts.push('')
  }

  if (x.length > 0) {
    parts.push('X Posts:')
    for (const post of x) {
      const name = post.author.displayName || post.author.handle
      parts.push(`* ${name}: ${truncate(post.content, 150)}`)
    }
    parts.push('')
  }

  if (videos.length > 0) {
    parts.push('YouTube Videos:')
    for (const video of videos) {
      const channel = video.channelTitle ? ` (${video.channelTitle})` : ''
      parts.push(`* ${video.title}${channel}`)
    }
    parts.push('')
  }

  if (blogs.length > 0) {
    parts.push('Blog Articles:')
    for (const blog of blogs) {
      const author = blog.author ? ` — ${blog.author}` : ''
      const summary = blog.summary ? `: ${truncate(blog.summary, 150)}` : ''
      parts.push(`* ${blog.title}${author}${summary}`)
    }
  }

  return parts.join('\n').trim()
}

function buildItem(date: string): string | null {
  const stars = loadGitHubStars(date)
  const bsky = loadBlueskyPosts(date)
  const x = loadXPosts(date)
  const videos = loadYouTubeVideos(date)
  const blogs = loadBlogPosts(date)

  if (
    stars.length === 0 &&
    bsky.length === 0 &&
    x.length === 0 &&
    videos.length === 0 &&
    blogs.length === 0
  ) {
    return null
  }

  const summary = loadSummary(date)
  const description = buildItemDescription(summary, stars, bsky, x, videos, blogs)
  const title = `Stars & Posts — ${date}`
  const link = `${SITE_URL}/stars/${date}/`
  const pubDate = toRFC822Date(date)

  return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`
}

// --- RSS Channel ---

function buildFeed(items: string[]): string {
  const lastBuildDate = new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/stars/</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/stars/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`
}

// --- Main ---

function main() {
  console.log('📡 Generating Stars & Posts RSS feed...')

  const allDates = collectAllDates()
  const recentDates = allDates.slice(0, MAX_ITEMS)

  const items: string[] = []
  for (const date of recentDates) {
    const item = buildItem(date)
    if (item) {
      items.push(item)
    }
  }

  const feed = buildFeed(items)

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH)
  fs.mkdirSync(outputDir, { recursive: true })

  fs.writeFileSync(OUTPUT_PATH, feed, 'utf-8')
  console.log(`✅ Written ${items.length} items to ${OUTPUT_PATH}`)
}

main()
