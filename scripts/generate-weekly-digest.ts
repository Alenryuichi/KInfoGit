import fs from 'fs'
import path from 'path'

// --- Config ---

const GITHUB_STARS_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const BLUESKY_POSTS_DIR = path.join(__dirname, '..', 'profile-data', 'bluesky-posts')
const WEEKLY_DIGESTS_DIR = path.join(__dirname, '..', 'profile-data', 'weekly-digests')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const MAX_INPUT_CHARS = 12000 // ~4000 tokens

// --- Types ---

interface WeeklyDigest {
  week: string
  dateRange: { start: string; end: string }
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

interface StarData {
  repo: string
  url: string
  description: string
  language: string | null
  stargazersCount: number
  starredBy: string
}

interface PostData {
  author: { handle: string; displayName: string }
  content: string
  likeCount: number
}

// --- ISO Week Helpers ---

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { year: d.getUTCFullYear(), week: weekNo }
}

function formatWeek(year: number, week: number): string {
  return `${year}-W${week.toString().padStart(2, '0')}`
}

function collectWeekDays(week: string): string[] {
  // Parse YYYY-WXX
  const match = week.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return []

  const year = parseInt(match[1], 10)
  const weekNum = parseInt(match[2], 10)

  // Find the Monday of the ISO week
  // Jan 4 is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7 // Mon=1 .. Sun=7
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1))

  const monday = new Date(mondayOfWeek1)
  monday.setUTCDate(mondayOfWeek1.getUTCDate() + (weekNum - 1) * 7)

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    const yyyy = d.getUTCFullYear()
    const mm = (d.getUTCMonth() + 1).toString().padStart(2, '0')
    const dd = d.getUTCDate().toString().padStart(2, '0')
    dates.push(`${yyyy}-${mm}-${dd}`)
  }

  return dates
}

// --- Data Loading ---

function loadStarsForDate(date: string): StarData[] {
  const filePath = path.join(GITHUB_STARS_DIR, `${date}.json`)
  if (!fs.existsSync(filePath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return (data.stars || []).map((s: any) => ({
      repo: s.repo,
      url: s.url,
      description: s.description || '',
      language: s.language,
      stargazersCount: s.stargazersCount,
      starredBy: s.starredBy,
    }))
  } catch {
    return []
  }
}

function loadPostsForDate(date: string): PostData[] {
  const filePath = path.join(BLUESKY_POSTS_DIR, `${date}.json`)
  if (!fs.existsSync(filePath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return (data.posts || []).map((p: any) => ({
      author: { handle: p.author.handle, displayName: p.author.displayName },
      content: p.content,
      likeCount: p.likeCount || 0,
    }))
  } catch {
    return []
  }
}

function loadWeekContent(dates: string[]): {
  allStars: StarData[]
  allPosts: PostData[]
  daysWithContent: number
  contentText: string
} {
  const allStars: StarData[] = []
  const allPosts: PostData[] = []
  let daysWithContent = 0

  for (const date of dates) {
    const stars = loadStarsForDate(date)
    const posts = loadPostsForDate(date)
    if (stars.length > 0 || posts.length > 0) daysWithContent++
    allStars.push(...stars)
    allPosts.push(...posts)
  }

  // Build text representation for the prompt, truncating if needed
  const parts: string[] = []

  // Sort stars by stargazersCount desc
  const sortedStars = [...allStars].sort((a, b) => b.stargazersCount - a.stargazersCount)
  for (const star of sortedStars) {
    parts.push(`[GitHub Star] ${star.repo} — ${star.description} (${star.language || 'unknown'}, ⭐${star.stargazersCount}, starred by ${star.starredBy})`)
  }

  // Sort posts by likeCount desc
  const sortedPosts = [...allPosts].sort((a, b) => b.likeCount - a.likeCount)
  for (const post of sortedPosts) {
    const text = post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content
    parts.push(`[Bluesky Post] ${post.author.displayName} (@${post.author.handle}): ${text}`)
  }

  let contentText = parts.join('\n')
  if (contentText.length > MAX_INPUT_CHARS) {
    contentText = contentText.slice(0, MAX_INPUT_CHARS) + '\n... (truncated)'
  }

  return { allStars, allPosts, daysWithContent, contentText }
}

// --- Stats & Cross-References ---

function computeStats(
  allStars: StarData[],
  allPosts: PostData[],
  daysWithContent: number
): WeeklyDigest['stats'] {
  const authors = new Set<string>()
  for (const star of allStars) authors.add(star.starredBy)
  for (const post of allPosts) authors.add(post.author.handle)

  return {
    totalRepos: allStars.length,
    totalPosts: allPosts.length,
    uniqueAuthors: authors.size,
    daysWithContent,
  }
}

function detectCrossReferences(allStars: StarData[]): WeeklyDigest['crossReferences'] {
  const repoMap = new Map<string, { starredBy: Set<string>; url: string }>()

  for (const star of allStars) {
    if (!repoMap.has(star.repo)) {
      repoMap.set(star.repo, { starredBy: new Set(), url: star.url })
    }
    repoMap.get(star.repo)!.starredBy.add(star.starredBy)
  }

  const crossRefs: WeeklyDigest['crossReferences'] = []
  for (const [repo, data] of repoMap) {
    if (data.starredBy.size > 1) {
      crossRefs.push({
        repo,
        starredBy: Array.from(data.starredBy),
        url: data.url,
      })
    }
  }

  return crossRefs.sort((a, b) => b.starredBy.length - a.starredBy.length)
}

// --- DeepSeek API ---

async function generateWeeklyDigest(
  week: string,
  dateRange: { start: string; end: string },
  contentText: string,
  crossReferences: WeeklyDigest['crossReferences'],
  stats: WeeklyDigest['stats']
): Promise<WeeklyDigest | null> {
  const crossRefText = crossReferences.length > 0
    ? `\nCross-referenced repos (starred by multiple people):\n${crossReferences.map(cr => `- ${cr.repo}: starred by ${cr.starredBy.join(', ')}`).join('\n')}`
    : ''

  const prompt = `You are a tech news editor. Given a week's collection of GitHub starred repos and Bluesky posts from AI leaders, generate a structured weekly digest in JSON format.

Week: ${week} (${dateRange.start} to ${dateRange.end})
Stats: ${stats.totalRepos} repos, ${stats.totalPosts} posts, ${stats.uniqueAuthors} authors, ${stats.daysWithContent} days with content
${crossRefText}

Content:
${contentText}

Respond with ONLY valid JSON matching this exact schema:
{
  "overview": "3-5 paragraph narrative summary of the week's key themes and trends",
  "trendingTopics": [{"topic": "Topic Name", "description": "Brief description of why this is trending"}],
  "notableRepos": [{"repo": "owner/name", "url": "https://github.com/...", "stars": 1234, "description": "Why this repo is notable", "starredBy": ["user1"]}],
  "keyDiscussions": [{"title": "Discussion Title", "summary": "Brief summary", "author": "authorName"}]
}

Rules:
- overview: Professional, engaging, specific. 3-5 paragraphs.
- trendingTopics: 3-7 topics identified from the content
- notableRepos: Top 5-10 most interesting repos with actual data
- keyDiscussions: 3-5 notable Bluesky discussions
- Use actual repo names, URLs, and star counts from the content`

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
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`⚠️  DeepSeek API error: ${res.status}`)
      return null
    }

    const data = await res.json()
    const responseText = data.choices?.[0]?.message?.content?.trim()
    if (!responseText) return null

    const parsed = JSON.parse(responseText)

    return {
      week,
      dateRange,
      overview: parsed.overview || '',
      trendingTopics: Array.isArray(parsed.trendingTopics) ? parsed.trendingTopics : [],
      notableRepos: Array.isArray(parsed.notableRepos) ? parsed.notableRepos : [],
      keyDiscussions: Array.isArray(parsed.keyDiscussions) ? parsed.keyDiscussions : [],
      crossReferences,
      stats,
    }
  } catch (err) {
    console.error('❌ DeepSeek error:', err)
    return null
  }
}

// --- Determine Weeks to Process ---

function getWeeksToProcess(): string[] {
  const dates = new Set<string>()

  for (const dir of [GITHUB_STARS_DIR, BLUESKY_POSTS_DIR]) {
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (match) dates.add(match[1])
    }
  }

  const weeks = new Set<string>()
  for (const dateStr of dates) {
    const date = new Date(dateStr + 'T00:00:00Z')
    const { year, week } = getISOWeek(date)
    weeks.add(formatWeek(year, week))
  }

  // Exclude the current (incomplete) week
  const now = new Date()
  const { year: curYear, week: curWeek } = getISOWeek(now)
  const currentWeek = formatWeek(curYear, curWeek)

  return Array.from(weeks).filter(w => w < currentWeek).sort()
}

// --- Main ---

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.log('⚠️  No DEEPSEEK_API_KEY set, skipping weekly digest generation.')
    return
  }

  console.log('📊 Generating weekly digests...')
  fs.mkdirSync(WEEKLY_DIGESTS_DIR, { recursive: true })

  const weeks = getWeeksToProcess()

  for (const week of weeks) {
    const filePath = path.join(WEEKLY_DIGESTS_DIR, `${week}.json`)

    // Skip if digest already exists and has content
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (existing.overview) {
          console.log(`  📄 ${week}: Digest exists, skipping`)
          continue
        }
      } catch { /* regenerate */ }
    }

    const dates = collectWeekDays(week)
    const { allStars, allPosts, daysWithContent, contentText } = loadWeekContent(dates)

    if (allStars.length === 0 && allPosts.length === 0) {
      console.log(`  📄 ${week}: No content, skipping`)
      continue
    }

    const stats = computeStats(allStars, allPosts, daysWithContent)
    const crossReferences = detectCrossReferences(allStars)
    const dateRange = { start: dates[0], end: dates[dates.length - 1] }

    console.log(`  🤖 Generating digest for ${week} (${dateRange.start} to ${dateRange.end})...`)
    const digest = await generateWeeklyDigest(week, dateRange, contentText, crossReferences, stats)

    if (digest) {
      fs.writeFileSync(filePath, JSON.stringify(digest, null, 2) + '\n')
      console.log(`  ✅ ${week}: Digest generated`)
    } else {
      // Fallback: write minimal digest with just stats and cross-references
      const minimal: WeeklyDigest = {
        week,
        dateRange,
        overview: '',
        trendingTopics: [],
        notableRepos: [],
        keyDiscussions: [],
        crossReferences,
        stats,
      }
      fs.writeFileSync(filePath, JSON.stringify(minimal, null, 2) + '\n')
      console.log(`  ⚠️  ${week}: Wrote minimal digest (API failed)`)
    }
  }

  console.log('🎉 Done!')
}

main().catch(console.error)
