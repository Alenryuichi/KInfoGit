import fs from 'fs'
import path from 'path'

// --- Config ---

const PROFILE_DATA_DIR = path.join(__dirname, '..', 'profile-data')
const GITHUB_STARS_DIR = path.join(PROFILE_DATA_DIR, 'github-stars')
const BLUESKY_POSTS_DIR = path.join(PROFILE_DATA_DIR, 'bluesky-posts')
const X_SIGNALS_DIR = path.join(PROFILE_DATA_DIR, 'x-signals')
const YOUTUBE_VIDEOS_DIR = path.join(PROFILE_DATA_DIR, 'youtube-videos')
const BLOG_POSTS_DIR = path.join(PROFILE_DATA_DIR, 'blog-posts')
const WEEKLY_DIGESTS_DIR = path.join(PROFILE_DATA_DIR, 'weekly-digests')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// Per-source char budget for the prompt (sums to ~12k ≈ 4k tokens).
const PROMPT_BUDGET = {
  github: 4000,
  bluesky: 3000,
  x: 3000,
  youtube: 1200,
  blog: 1200,
}

const FORCE = process.argv.includes('--force')

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
  notableVideos?: Array<{
    title: string
    url: string
    channelTitle: string
    views: number
    description: string
  }>
  notableBlogs?: Array<{
    title: string
    url: string
    author: string
    summary: string
  }>
  notableXPosts?: Array<{
    url: string
    author: string
    content: string
    likes: number
  }>
  keyDiscussions: Array<{
    title: string
    summary: string
    author: string
    source?: 'bluesky' | 'x'
  }>
  crossReferences: Array<{ repo: string; starredBy: string[]; url: string }>
  stats: {
    totalRepos: number
    totalPosts: number
    uniqueAuthors: number
    daysWithContent: number
    totalXPosts?: number
    totalVideos?: number
    totalBlogs?: number
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

interface BlueskyPostData {
  author: { handle: string; displayName: string }
  content: string
  url: string
  likeCount: number
  repostCount: number
}

interface XPostData {
  author: { handle: string; displayName: string }
  content: string
  url: string
  likeCount: number
  retweetCount: number
}

interface VideoData {
  title: string
  description: string
  channelTitle: string
  viewCount: number
  url: string
  publishedAt: string
}

interface BlogData {
  title: string
  url: string
  author: string
  summary: string
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
  const match = week.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return []

  const year = parseInt(match[1], 10)
  const weekNum = parseInt(match[2], 10)

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
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

// --- Generic Loader ---

function loadJsonArray<T>(filePath: string, key: string, mapper: (raw: any) => T): T[] {
  if (!fs.existsSync(filePath)) return []
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return ((data?.[key] as any[]) || []).map(mapper)
  } catch {
    return []
  }
}

function loadStars(date: string): StarData[] {
  return loadJsonArray(path.join(GITHUB_STARS_DIR, `${date}.json`), 'stars', s => ({
    repo: s.repo,
    url: s.url,
    description: s.description || '',
    language: s.language ?? null,
    stargazersCount: s.stargazersCount || 0,
    starredBy: s.starredBy || '',
  }))
}

function loadBluesky(date: string): BlueskyPostData[] {
  return loadJsonArray(path.join(BLUESKY_POSTS_DIR, `${date}.json`), 'posts', p => ({
    author: {
      handle: p.author?.handle ?? '',
      displayName: p.author?.displayName ?? '',
    },
    content: p.content || '',
    url: p.url || '',
    likeCount: p.likeCount || 0,
    repostCount: p.repostCount || 0,
  }))
}

function loadXPosts(date: string): XPostData[] {
  return loadJsonArray(path.join(X_SIGNALS_DIR, `${date}.json`), 'posts', p => ({
    author: {
      handle: p.author?.handle ?? '',
      displayName: p.author?.displayName ?? '',
    },
    content: p.content || '',
    url: p.url || '',
    likeCount: p.likeCount || 0,
    retweetCount: p.retweetCount || 0,
  }))
}

function loadBlogs(date: string): BlogData[] {
  return loadJsonArray(path.join(BLOG_POSTS_DIR, `${date}.json`), 'posts', b => ({
    title: b.title || '',
    url: b.url || '',
    author: b.author || '',
    summary: b.summary || '',
  }))
}

/**
 * YouTube data files are named after each video's `publishedAt` date, not the
 * ingestion date — so a 2025-10-30 file may contain a 2025-10-30 video but
 * never a "this week" video. To surface notable videos actually *published*
 * during the week, we scan every JSON in the directory and filter by the
 * video's own `publishedAt` timestamp.
 */
function loadVideosInRange(startDate: string, endDate: string): VideoData[] {
  if (!fs.existsSync(YOUTUBE_VIDEOS_DIR)) return []
  const out: VideoData[] = []
  const startMs = new Date(`${startDate}T00:00:00Z`).getTime()
  const endMs = new Date(`${endDate}T23:59:59Z`).getTime()

  for (const file of fs.readdirSync(YOUTUBE_VIDEOS_DIR)) {
    if (!file.endsWith('.json')) continue
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(YOUTUBE_VIDEOS_DIR, file), 'utf-8'))
      const videos = (raw?.videos as any[]) || []
      for (const v of videos) {
        const pubMs = v.publishedAt ? new Date(v.publishedAt).getTime() : NaN
        if (!Number.isFinite(pubMs) || pubMs < startMs || pubMs > endMs) continue
        out.push({
          title: v.title || '',
          description: v.description || '',
          channelTitle: v.channelTitle || '',
          viewCount: v.viewCount || 0,
          url: v.url || '',
          publishedAt: v.publishedAt || '',
        })
      }
    } catch { /* skip malformed */ }
  }
  return out
}

interface WeekContent {
  stars: StarData[]
  bluesky: BlueskyPostData[]
  xPosts: XPostData[]
  videos: VideoData[]
  blogs: BlogData[]
  daysWithContent: number
  contentText: string
}

function buildSection(
  header: string,
  items: string[],
  budget: number
): string {
  if (items.length === 0) return ''
  let text = `\n=== ${header} ===\n`
  let used = text.length
  for (const line of items) {
    if (used + line.length + 1 > budget) {
      text += `... (${items.length - (text.split('\n').length - 2)} more truncated)\n`
      break
    }
    text += line + '\n'
    used += line.length + 1
  }
  return text
}

function loadWeekContent(dates: string[]): WeekContent {
  const allStars: StarData[] = []
  const allBluesky: BlueskyPostData[] = []
  const allXPosts: XPostData[] = []
  const allBlogs: BlogData[] = []
  let daysWithContent = 0

  for (const date of dates) {
    const s = loadStars(date)
    const b = loadBluesky(date)
    const x = loadXPosts(date)
    const bl = loadBlogs(date)
    if (s.length + b.length + x.length + bl.length > 0) daysWithContent++
    allStars.push(...s)
    allBluesky.push(...b)
    allXPosts.push(...x)
    allBlogs.push(...bl)
  }

  // YouTube is special: files are named by publishedAt, so iterate the whole
  // directory and filter by publishedAt within the week window.
  const allVideos = loadVideosInRange(dates[0], dates[dates.length - 1])
  if (allVideos.length > 0) daysWithContent = Math.max(daysWithContent, 1)

  // Render per-source lines, sorted by engagement, and pack within per-source budget
  const githubLines = [...allStars]
    .sort((a, b) => b.stargazersCount - a.stargazersCount)
    .map(s => `- ${s.repo} — ${s.description} (${s.language || 'unknown'}, ⭐${s.stargazersCount}, starred by ${s.starredBy}) <${s.url}>`)

  const blueskyLines = [...allBluesky]
    .sort((a, b) => b.likeCount - a.likeCount)
    .map(p => `- ${p.author.displayName || p.author.handle}: ${truncate(p.content, 220)} (❤${p.likeCount}) <${p.url}>`)

  const xLines = [...allXPosts]
    .sort((a, b) => b.likeCount + b.retweetCount - (a.likeCount + a.retweetCount))
    .map(p => `- ${p.author.displayName || p.author.handle} (@${p.author.handle}): ${truncate(p.content, 220)} (❤${p.likeCount}, 🔁${p.retweetCount}) <${p.url}>`)

  const videoLines = [...allVideos]
    .sort((a, b) => b.viewCount - a.viewCount)
    .map(v => `- [${v.channelTitle}] ${v.title} — ${truncate(v.description, 140)} (👁${v.viewCount}) <${v.url}>`)

  const blogLines = [...allBlogs]
    .map(b => `- [${b.author}] ${b.title}: ${truncate(b.summary, 180)} <${b.url}>`)

  const contentText = [
    buildSection('GitHub Stars', githubLines, PROMPT_BUDGET.github),
    buildSection('Bluesky Posts', blueskyLines, PROMPT_BUDGET.bluesky),
    buildSection('X Posts', xLines, PROMPT_BUDGET.x),
    buildSection('YouTube Videos', videoLines, PROMPT_BUDGET.youtube),
    buildSection('Blog Articles', blogLines, PROMPT_BUDGET.blog),
  ].join('')

  return {
    stars: allStars,
    bluesky: allBluesky,
    xPosts: allXPosts,
    videos: allVideos,
    blogs: allBlogs,
    daysWithContent,
    contentText,
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

// --- Stats & Cross-References ---

function computeStats(c: WeekContent): WeeklyDigest['stats'] {
  const authors = new Set<string>()
  for (const s of c.stars) if (s.starredBy) authors.add(`github:${s.starredBy}`)
  for (const p of c.bluesky) authors.add(`bluesky:${p.author.handle}`)
  for (const p of c.xPosts) authors.add(`x:${p.author.handle}`)
  for (const v of c.videos) if (v.channelTitle) authors.add(`youtube:${v.channelTitle}`)
  for (const b of c.blogs) if (b.author) authors.add(`blog:${b.author}`)

  return {
    totalRepos: c.stars.length,
    totalPosts: c.bluesky.length,
    uniqueAuthors: authors.size,
    daysWithContent: c.daysWithContent,
    totalXPosts: c.xPosts.length,
    totalVideos: c.videos.length,
    totalBlogs: c.blogs.length,
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
  content: WeekContent,
  crossReferences: WeeklyDigest['crossReferences'],
  stats: WeeklyDigest['stats']
): Promise<WeeklyDigest | null> {
  const crossRefText = crossReferences.length > 0
    ? `\nCross-referenced repos (starred by multiple people):\n${crossReferences.slice(0, 10).map(cr => `- ${cr.repo}: starred by ${cr.starredBy.join(', ')}`).join('\n')}`
    : ''

  const prompt = `You are a tech news editor specialising in AI. Given a week's collection of multi-source content from AI leaders — GitHub starred repos, Bluesky posts, X (Twitter) posts, YouTube videos and blog articles — produce a structured weekly digest in JSON.

Week: ${week} (${dateRange.start} to ${dateRange.end})
Stats: ${stats.totalRepos} repos · ${stats.totalPosts} bluesky · ${stats.totalXPosts ?? 0} x · ${stats.totalVideos ?? 0} videos · ${stats.totalBlogs ?? 0} blogs · ${stats.uniqueAuthors} authors · ${stats.daysWithContent}/7 days with content
${crossRefText}

Content:
${content.contentText}

Respond with ONLY valid JSON matching this exact schema (use empty arrays for sections that genuinely have no notable content; do NOT invent items):
{
  "overview": "3-5 paragraph narrative synthesising the week across ALL sources. Reference specific repos / posts / videos / articles by name.",
  "trendingTopics": [{"topic": "Topic", "description": "Why this is trending, citing evidence across sources"}],
  "notableRepos": [{"repo": "owner/name", "url": "https://github.com/...", "stars": 1234, "description": "Why notable", "starredBy": ["user"]}],
  "notableVideos": [{"title": "Video Title", "url": "https://youtube.com/...", "channelTitle": "Channel", "views": 12345, "description": "Why this video matters"}],
  "notableBlogs": [{"title": "Post Title", "url": "https://...", "author": "Name", "summary": "One-sentence takeaway"}],
  "notableXPosts": [{"url": "https://x.com/...", "author": "@handle", "content": "First 120 chars of the post", "likes": 42}],
  "keyDiscussions": [{"title": "Discussion Title", "summary": "Brief summary", "author": "authorName", "source": "bluesky"}]
}

Input format notes:
- Each content line ends with the item's real URL wrapped in angle brackets: <https://...>. Copy those URLs VERBATIM into the "url" fields of the output. Never fabricate a URL.

Rules:
- overview: 3-5 paragraphs, professional and specific. Mention cross-source patterns (e.g. "the vLLM repo gained traction on GitHub while Nathan Lambert discussed it on Bluesky").
- trendingTopics: 3-7 topics. Prefer topics that appear in ≥2 sources.
- notableRepos: Top 5-10. Use real repo names, URLs and star counts from the content.
- notableVideos: Top 3-5. Empty array if no videos this week.
- notableBlogs: Top 3-5. Empty array if no blog posts this week.
- notableXPosts: Top 3-5. The \`content\` field should quote the first ~120 chars of the real post. Empty array if no X posts.
- keyDiscussions: 3-5. Can pull from Bluesky AND X. Set \`source\` to "bluesky" or "x" based on where the discussion happened.
- ALL data fields must come from the Content section above. Do not hallucinate repos, videos, blogs, or posts that aren't in the input.
- NEVER output placeholder URLs like "https://youtube.com/..." or "https://...". If you cannot find the URL in the content, OMIT that item.`

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
        max_tokens: 5000,
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

    // --- Post-validation: strip or repair hallucinated URLs ---

    const isRealUrl = (u: string): boolean =>
      typeof u === 'string' &&
      /^https?:\/\//.test(u) &&
      !u.endsWith('/...') &&
      !/\/\.\.\.$/.test(u) &&
      !/^https:\/\/(youtube\.com|x\.com|\.\.\.)\/\.\.\.?$/.test(u)

    const videoByTitle = new Map(content.videos.map(v => [v.title.toLowerCase(), v.url]))
    const videoByUrl = new Set(content.videos.map(v => v.url))

    const fixedVideos = (Array.isArray(parsed.notableVideos) ? parsed.notableVideos : [])
      .map((v: any) => {
        if (!isRealUrl(v.url) || !videoByUrl.has(v.url)) {
          const real = videoByTitle.get(String(v.title || '').toLowerCase())
          if (real) return { ...v, url: real }
          return null
        }
        return v
      })
      .filter(Boolean)

    const blogByTitle = new Map(content.blogs.map(b => [b.title.toLowerCase(), b.url]))
    const blogByUrl = new Set(content.blogs.map(b => b.url))
    const fixedBlogs = (Array.isArray(parsed.notableBlogs) ? parsed.notableBlogs : [])
      .map((b: any) => {
        if (!isRealUrl(b.url) || !blogByUrl.has(b.url)) {
          const real = blogByTitle.get(String(b.title || '').toLowerCase())
          if (real) return { ...b, url: real }
          return null
        }
        return b
      })
      .filter(Boolean)

    const xByUrl = new Set(content.xPosts.map(p => p.url))
    const fixedXPosts = (Array.isArray(parsed.notableXPosts) ? parsed.notableXPosts : [])
      .filter((p: any) => isRealUrl(p.url) && xByUrl.has(p.url))

    const repoByName = new Map(content.stars.map(s => [s.repo, s.url]))
    const fixedRepos = (Array.isArray(parsed.notableRepos) ? parsed.notableRepos : [])
      .map((r: any) => {
        const real = repoByName.get(r.repo)
        if (real && r.url !== real) return { ...r, url: real }
        return r
      })
      .filter((r: any) => repoByName.has(r.repo))

    return {
      week,
      dateRange,
      overview: parsed.overview || '',
      trendingTopics: Array.isArray(parsed.trendingTopics) ? parsed.trendingTopics : [],
      notableRepos: fixedRepos,
      notableVideos: fixedVideos,
      notableBlogs: fixedBlogs,
      notableXPosts: fixedXPosts,
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

  for (const dir of [
    GITHUB_STARS_DIR, BLUESKY_POSTS_DIR, X_SIGNALS_DIR,
    YOUTUBE_VIDEOS_DIR, BLOG_POSTS_DIR,
  ]) {
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

function hasE1Fields(digest: any): boolean {
  return digest && (
    Array.isArray(digest.notableVideos) ||
    Array.isArray(digest.notableBlogs) ||
    Array.isArray(digest.notableXPosts) ||
    typeof digest?.stats?.totalXPosts === 'number'
  )
}

// --- Main ---

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.log('⚠️  No DEEPSEEK_API_KEY set, skipping weekly digest generation.')
    return
  }

  console.log(`📊 Generating weekly digests${FORCE ? ' (--force: regenerating all)' : ''}...`)
  fs.mkdirSync(WEEKLY_DIGESTS_DIR, { recursive: true })

  const weeks = getWeeksToProcess()

  for (const week of weeks) {
    const filePath = path.join(WEEKLY_DIGESTS_DIR, `${week}.json`)

    // Skip if digest already exists, has content, AND already has E1 fields
    // (unless --force).
    if (!FORCE && fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (existing.overview && hasE1Fields(existing)) {
          console.log(`  📄 ${week}: Digest exists with E1 fields, skipping`)
          continue
        }
        if (existing.overview) {
          console.log(`  ♻️  ${week}: Legacy digest detected — regenerating with E1 schema`)
        }
      } catch { /* regenerate */ }
    }

    const dates = collectWeekDays(week)
    const content = loadWeekContent(dates)
    const total =
      content.stars.length + content.bluesky.length + content.xPosts.length +
      content.videos.length + content.blogs.length

    if (total === 0) {
      console.log(`  📄 ${week}: No content, skipping`)
      continue
    }

    const stats = computeStats(content)
    const crossReferences = detectCrossReferences(content.stars)
    const dateRange = { start: dates[0], end: dates[dates.length - 1] }

    console.log(`  🤖 Generating digest for ${week} (${dateRange.start} to ${dateRange.end}) — ${total} items...`)
    const digest = await generateWeeklyDigest(week, dateRange, content, crossReferences, stats)

    if (digest) {
      fs.writeFileSync(filePath, JSON.stringify(digest, null, 2) + '\n')
      console.log(`  ✅ ${week}: Digest generated (${digest.notableRepos.length} repos · ${digest.notableVideos?.length ?? 0} videos · ${digest.notableBlogs?.length ?? 0} blogs · ${digest.notableXPosts?.length ?? 0} x · ${digest.keyDiscussions.length} discussions)`)
    } else {
      // Fallback: write minimal digest with just stats and cross-references
      const minimal: WeeklyDigest = {
        week,
        dateRange,
        overview: '',
        trendingTopics: [],
        notableRepos: [],
        notableVideos: [],
        notableBlogs: [],
        notableXPosts: [],
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
