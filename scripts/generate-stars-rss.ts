import fs from 'fs'
import path from 'path'

// --- Config ---

const GITHUB_STARS_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const BLUESKY_POSTS_DIR = path.join(__dirname, '..', 'profile-data', 'bluesky-posts')
const SUMMARIES_DIR = path.join(__dirname, '..', 'profile-data', 'daily-summaries')
const OUTPUT_PATH = path.join(__dirname, '..', 'website', 'public', 'stars', 'feed.xml')

const SITE_URL = 'https://kylinmiao.me'
const FEED_TITLE = 'Stars & Posts — Kylin Miao'
const FEED_DESCRIPTION = 'Daily curated GitHub starred repos and Bluesky posts from AI leaders with AI-powered summaries.'
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

function collectAllDates(): string[] {
  const dates = new Set<string>()

  for (const dir of [GITHUB_STARS_DIR, BLUESKY_POSTS_DIR]) {
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

interface PostData {
  author: { handle: string; displayName: string }
  content: string
  url: string
}

function loadGitHubStars(date: string): StarData[] {
  const filePath = path.join(GITHUB_STARS_DIR, `${date}.json`)
  if (!fs.existsSync(filePath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return (data.stars || []).map((s: any) => ({
      repo: s.repo,
      url: s.url,
      description: s.description || '',
      language: s.language,
    }))
  } catch {
    return []
  }
}

function loadBlueskyPosts(date: string): PostData[] {
  const filePath = path.join(BLUESKY_POSTS_DIR, `${date}.json`)
  if (!fs.existsSync(filePath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return (data.posts || []).map((p: any) => ({
      author: {
        handle: p.author.handle,
        displayName: p.author.displayName,
      },
      content: p.content,
      url: p.url,
    }))
  } catch {
    return []
  }
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

function buildItemDescription(
  summary: string,
  stars: StarData[],
  posts: PostData[],
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

  if (posts.length > 0) {
    parts.push('Bluesky Posts:')
    for (const post of posts) {
      const excerpt = post.content.length > 150
        ? post.content.slice(0, 150) + '...'
        : post.content
      const name = post.author.displayName || post.author.handle
      parts.push(`* ${name}: ${excerpt}`)
    }
  }

  return parts.join('\n').trim()
}

function buildItem(date: string): string | null {
  const stars = loadGitHubStars(date)
  const posts = loadBlueskyPosts(date)

  if (stars.length === 0 && posts.length === 0) return null

  const summary = loadSummary(date)
  const description = buildItemDescription(summary, stars, posts)
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
