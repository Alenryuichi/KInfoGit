import fs from 'fs'
import path from 'path'

// --- Config ---

// AI leader blog feeds (RSS 2.0 and Atom)
const BLOG_FEEDS = [
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/entries/' },
  { name: 'Sebastian Raschka', url: 'https://magazine.sebastianraschka.com/feed' },
  { name: 'Lilian Weng', url: 'https://lilianweng.github.io/index.xml' },
  { name: 'Nathan Lambert', url: 'https://www.interconnects.ai/feed' },
  { name: 'Chip Huyen', url: 'https://huyenchip.com/feed.xml' },
  { name: 'Eugene Yan', url: 'https://eugeneyan.com/rss/' },
]

const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'blog-posts')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// --- Types ---

interface RawBlogPost {
  title: string
  url: string
  author: string
  publishedAt: string
  summary: string
}

interface BlogPost {
  title: string
  url: string
  author: string
  publishedAt: string
  summary: string
  highlights: string
  worthReading: string
}

interface DailyBlogPosts {
  date: string
  posts: BlogPost[]
}

// --- Feed Fetching ---

async function fetchFeedXml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'KInfoGit-Blog-Fetcher',
    },
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }

  return res.text()
}

// --- XML Parsing (regex-based, no library) ---

function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataPattern = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const cdataMatch = xml.match(cdataPattern)
  if (cdataMatch) return cdataMatch[1].trim()

  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(pattern)
  return match ? match[1].trim() : ''
}

function extractAtomLink(xml: string): string {
  // Atom links: <link href="..." /> or <link rel="alternate" href="..." />
  const altMatch = xml.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i)
  if (altMatch) return altMatch[1]

  const hrefMatch = xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
  if (hrefMatch) return hrefMatch[1]

  return ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, maxLen: number = 300): string {
  if (text.length <= maxLen) return text
  const truncated = text.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > maxLen * 0.8 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

function parseRssFeed(xml: string, feedUrl: string, authorName: string): RawBlogPost[] {
  const isAtom = /<feed[\s>]/i.test(xml)
  const posts: RawBlogPost[] = []

  if (isAtom) {
    // Atom format: <entry>...</entry>
    const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || []
    for (const entry of entries) {
      const title = stripHtml(extractTag(entry, 'title'))
      const link = extractAtomLink(entry)
      const published = extractTag(entry, 'published') || extractTag(entry, 'updated')
      const summary = extractTag(entry, 'summary') || extractTag(entry, 'content')

      if (!title || !link) continue

      posts.push({
        title,
        url: link,
        author: authorName,
        publishedAt: published,
        summary: truncate(stripHtml(summary)),
      })
    }
  } else {
    // RSS 2.0 format: <item>...</item>
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []
    for (const item of items) {
      const title = stripHtml(extractTag(item, 'title'))
      const link = extractTag(item, 'link')
      const pubDate = extractTag(item, 'pubDate')
      const description = extractTag(item, 'description') || extractTag(item, 'content:encoded')

      if (!title || !link) continue

      posts.push({
        title,
        url: link,
        author: authorName,
        publishedAt: pubDate,
        summary: truncate(stripHtml(description)),
      })
    }
  }

  return posts
}

// --- DeepSeek API ---

async function generateCommentary(post: BlogPost): Promise<{ highlights: string; worthReading: string }> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '' }
  }

  const prompt = `You are a technical reviewer. Given a blog post about AI/ML, provide:
1. "highlights": Core insight or key takeaway (2-3 sentences, concise)
2. "worthReading": Why it's worth exploring (1-2 sentences)

Post Title: ${post.title}
Author: ${post.author}
Summary: ${post.summary}

Respond in JSON format: {"highlights": "...", "worthReading": "..."}`

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`  DeepSeek API error: ${res.status}`)
      return { highlights: '', worthReading: '' }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)
    return {
      highlights: parsed.highlights || '',
      worthReading: parsed.worthReading || '',
    }
  } catch (err) {
    console.error('  DeepSeek error:', err)
    return { highlights: '', worthReading: '' }
  }
}

// --- Main ---

async function main() {
  console.log('Fetching blog posts from AI leader feeds...')
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const allPosts: RawBlogPost[] = []

  // Fetch all feeds
  for (const feed of BLOG_FEEDS) {
    console.log(`  Fetching ${feed.name} (${feed.url})...`)
    try {
      const xml = await fetchFeedXml(feed.url)
      const posts = parseRssFeed(xml, feed.url, feed.name)
      console.log(`     Found ${posts.length} entries`)
      allPosts.push(...posts)
    } catch (err) {
      console.warn(`  Failed to fetch ${feed.name}: ${err}`)
    }
  }

  // Filter to last 7 days
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffDate = cutoff.toISOString().split('T')[0]

  const recentPosts = allPosts.filter(post => {
    if (!post.publishedAt) return false
    const pubDate = new Date(post.publishedAt).toISOString().split('T')[0]
    return pubDate >= cutoffDate
  })

  if (recentPosts.length === 0) {
    console.log(`No posts found in the last 7 days (since ${cutoffDate}). Done.`)
    return
  }

  console.log(`  Found ${recentPosts.length} posts in the last 7 days`)

  // Group by published date
  const byDate = new Map<string, BlogPost[]>()
  for (const post of recentPosts) {
    const date = new Date(post.publishedAt).toISOString().split('T')[0]
    if (!byDate.has(date)) byDate.set(date, [])

    byDate.get(date)!.push({
      ...post,
      highlights: '',
      worthReading: '',
    })
  }

  // Process each date — merge, dedup, write
  for (const [date, posts] of byDate) {
    const filePath = path.join(OUTPUT_DIR, `${date}.json`)

    // Merge with existing data if present
    let existingPosts: BlogPost[] = []
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailyBlogPosts
        existingPosts = existing.posts
      } catch {
        // Ignore parse errors
      }
    }

    // Deduplicate by URL
    const existingUrls = new Set(existingPosts.map(p => p.url))
    const newPosts = posts.filter(p => !existingUrls.has(p.url))

    if (newPosts.length === 0 && existingPosts.length > 0) {
      console.log(`  ${date}: No new posts (${existingPosts.length} existing)`)
      continue
    }

    // Generate AI commentary for new posts
    if (DEEPSEEK_API_KEY) {
      console.log(`  Generating AI commentary for ${newPosts.length} posts on ${date}...`)
      for (const post of newPosts) {
        const commentary = await generateCommentary(post)
        post.highlights = commentary.highlights
        post.worthReading = commentary.worthReading
      }
    }

    // Also generate commentary for existing posts that lack it
    if (DEEPSEEK_API_KEY) {
      for (const post of existingPosts) {
        if (!post.highlights && !post.worthReading) {
          const commentary = await generateCommentary(post)
          post.highlights = commentary.highlights
          post.worthReading = commentary.worthReading
        }
      }
    }

    const allDayPosts = [...existingPosts, ...newPosts]
    const dailyData: DailyBlogPosts = { date, posts: allDayPosts }

    fs.writeFileSync(filePath, JSON.stringify(dailyData, null, 2) + '\n')
    console.log(`  ${date}: ${allDayPosts.length} posts (${newPosts.length} new)`)
  }

  console.log('Done!')
}

main().catch(console.error)
