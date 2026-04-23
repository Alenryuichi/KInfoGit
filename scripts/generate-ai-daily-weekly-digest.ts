/**
 * Generate weekly digests for the AI Daily feed.
 *
 * Reads 7 days of `profile-data/ai-daily/YYYY-MM-DD.json`, buckets items
 * by `focusTopic`, and calls DeepSeek to produce a structured weekly
 * digest at `profile-data/ai-daily-weekly/YYYY-WXX.json`.
 *
 * Architecturally a sibling to `scripts/generate-weekly-digest.ts` (stars
 * weekly). Deliberately kept as a separate script — the schemas diverge
 * enough (topic-bucketed vs source-bucketed) that shared abstraction would
 * cost more than it saves. See `openspec/changes/ai-daily-weekly-digest/
 * design.md` for the full rationale.
 *
 * Usage:
 *   npx tsx scripts/generate-ai-daily-weekly-digest.ts         # idempotent
 *   npx tsx scripts/generate-ai-daily-weekly-digest.ts --force # regenerate all
 */

import fs from 'fs'
import path from 'path'

// --- Load .env (if present) ---
// Same approach as scripts/ai-daily/fetch-ai-daily.ts. Stars-side
// `generate-weekly-digest.ts` skips this step and relies on caller-injected
// env, but that makes local dry runs awkward — this script is expected to
// be re-run manually during iteration, so we load .env up-front.
{
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=\s*(.*)$/)
      if (match && !process.env[match[1]]) {
        let value = match[2].trim()
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        process.env[match[1]] = value
      }
    }
  }
}

// --- Config ---

const PROFILE_DATA_DIR = path.join(__dirname, '..', 'profile-data')
const AI_DAILY_DIR = path.join(PROFILE_DATA_DIR, 'ai-daily')
const AI_DAILY_WEEKLY_DIR = path.join(PROFILE_DATA_DIR, 'ai-daily-weekly')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

/**
 * Minimum item score to enter the weekly prompt. One step stricter than
 * the daily MIN_SCORE=5 — the weekly digest only surfaces curated picks,
 * and a week's ~370 items × score≥5 would blow the prompt budget.
 */
const MIN_SCORE_WEEKLY = 6.0

/** Max stories per topic entering the prompt (before DeepSeek picks 2–4). */
const PER_TOPIC_TOP = 8

/** Skip weeks with fewer than this many days of data. */
const MIN_DAYS_WITH_CONTENT = 4

/** Char budget per topic section in the prompt. Total sum ≈ 10k chars. */
const PER_TOPIC_CHAR_BUDGET = 1400

const FORCE = process.argv.includes('--force')

/**
 * v2 focusTopic whitelist + UI labels. Copy of `FOCUS_TOPIC_META` from
 * `website/pages/ai-daily.tsx` (kept in sync manually — both lists short
 * and rarely change). Legacy v1 topics are intentionally excluded from
 * the prompt but still counted in `stats.topicCounts`.
 */
const FOCUS_TOPICS: Record<string, string> = {
  'coding-agents': 'Coding Agents',
  'context-engineering': 'Context Engineering',
  'agent-harness': 'Agent Harness',
  planning: 'Planning',
  'tool-use': 'Tool Use',
  'post-training': 'Post-Training',
  'model-release': 'Model Release',
  evals: 'Evals',
}

// --- Types ---

interface DailyItem {
  title: string
  summary: string
  url: string
  score: number
  sources: Array<{ name: string; meta?: string }>
  tags?: string[]
  focusTopics?: string[]
}

interface DailyDigest {
  date: string
  itemCount: number
  sections: Array<{ id: string; title: string; items: DailyItem[] }>
}

/** Flat item used for weekly aggregation, plus the originating date for provenance. */
interface WeekItem extends DailyItem {
  date: string
}

interface TopStory {
  title: string
  url: string
  oneLiner: string
  score: number
  sources: string[]
}

interface TopicBucket {
  topic: string
  topicLabel: string
  stories: TopStory[]
}

interface WeeklyDigest {
  week: string
  dateRange: { start: string; end: string }
  overview: string
  topStoriesByTopic: TopicBucket[]
  trendingTopics: Array<{ topic: string; description: string }>
  keyReads: Array<{ title: string; url: string; summary: string; why: string }>
  stats: {
    totalItems: number
    uniqueTopics: number
    daysWithContent: number
    topicCounts: Record<string, number>
  }
}

// --- ISO Week helpers ---

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
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    const yyyy = d.getUTCFullYear()
    const mm = (d.getUTCMonth() + 1).toString().padStart(2, '0')
    const dd = d.getUTCDate().toString().padStart(2, '0')
    dates.push(`${yyyy}-${mm}-${dd}`)
  }
  return dates
}

// --- Data loading ---

function loadDailyDigest(date: string): DailyDigest | null {
  const file = path.join(AI_DAILY_DIR, `${date}.json`)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as DailyDigest
  } catch {
    return null
  }
}

interface WeekContent {
  items: WeekItem[]
  daysWithContent: number
  /** Topic counts including legacy (non-v2) focusTopic ids. */
  topicCounts: Record<string, number>
}

/**
 * Load 7 days of AI Daily digests and return a de-duped, score-filtered
 * flat list of items. URL canonical dedup keeps the highest-scoring copy
 * of each story (cross-day duplicates are common: HN today → ArXiv
 * tomorrow).
 */
function loadWeekContent(dates: string[]): WeekContent {
  const byUrl = new Map<string, WeekItem>()
  const topicCounts: Record<string, number> = {}
  let daysWithContent = 0

  for (const date of dates) {
    const digest = loadDailyDigest(date)
    if (!digest) continue
    let dayHadItems = false

    for (const section of digest.sections ?? []) {
      for (const raw of section.items ?? []) {
        if (typeof raw.score !== 'number' || raw.score < MIN_SCORE_WEEKLY) continue
        if (!raw.url || !raw.title) continue

        const canon = canonUrl(raw.url)
        const existing = byUrl.get(canon)
        if (existing && existing.score >= raw.score) continue

        byUrl.set(canon, { ...raw, date })
        dayHadItems = true

        for (const topic of raw.focusTopics ?? []) {
          topicCounts[topic] = (topicCounts[topic] ?? 0) + 1
        }
      }
    }

    if (dayHadItems) daysWithContent += 1
  }

  return {
    items: Array.from(byUrl.values()),
    daysWithContent,
    topicCounts,
  }
}

/**
 * Strip `utm_*` and common tracking params to improve dedup. Non-URL
 * inputs pass through unchanged.
 */
function canonUrl(url: string): string {
  try {
    const u = new URL(url)
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'ref_src']
    for (const key of drop) u.searchParams.delete(key)
    return u.toString()
  } catch {
    return url
  }
}

// --- Bucketing & prompt building ---

function bucketByTopic(items: WeekItem[]): TopicBucket[] {
  const byTopic = new Map<string, WeekItem[]>()
  for (const topic of Object.keys(FOCUS_TOPICS)) byTopic.set(topic, [])

  for (const item of items) {
    for (const topic of item.focusTopics ?? []) {
      if (!byTopic.has(topic)) continue // legacy/unknown topics skipped for the prompt
      byTopic.get(topic)!.push(item)
    }
  }

  const buckets: TopicBucket[] = []
  for (const [topic, topicItems] of byTopic.entries()) {
    if (topicItems.length === 0) continue
    const sorted = [...topicItems].sort((a, b) => b.score - a.score).slice(0, PER_TOPIC_TOP)
    buckets.push({
      topic,
      topicLabel: FOCUS_TOPICS[topic],
      stories: sorted.map(s => ({
        title: s.title,
        url: s.url,
        oneLiner: truncate(s.summary, 140),
        score: s.score,
        sources: (s.sources ?? []).map(x => x.name).filter(Boolean),
      })),
    })
  }

  // Sort buckets by total inbound signal (stories.length as a proxy within
  // the already-top-N-trimmed pool) — the prompt prefers seeing the
  // "heaviest" topic first, which tends to anchor the LLM's overview.
  return buckets.sort((a, b) => b.stories.length - a.stories.length)
}

function truncate(s: string, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max) + '...' : s
}

function buildPromptContent(buckets: TopicBucket[], totalRawCounts: Record<string, number>): string {
  const sections: string[] = []
  for (const b of buckets) {
    const totalForTopic = totalRawCounts[b.topic] ?? b.stories.length
    let text = `\n=== TOPIC: ${b.topic} (${b.topicLabel}) — ${totalForTopic} items this week, top ${b.stories.length} shown ===\n`
    let used = text.length
    for (const s of b.stories) {
      const srcTag = s.sources.length > 0 ? ` [${s.sources.slice(0, 2).join(', ')}]` : ''
      const line = `- [${s.score.toFixed(1)}] ${s.title}${srcTag} — ${s.oneLiner} <${s.url}>\n`
      if (used + line.length > PER_TOPIC_CHAR_BUDGET) {
        text += `... (${b.stories.length - (text.split('\n').length - 2)} more truncated)\n`
        break
      }
      text += line
      used += line.length
    }
    sections.push(text)
  }
  return sections.join('')
}

// --- DeepSeek call ---

async function generateWeeklyDigest(
  week: string,
  dateRange: { start: string; end: string },
  content: WeekContent,
  buckets: TopicBucket[]
): Promise<WeeklyDigest | null> {
  const promptContent = buildPromptContent(buckets, content.topicCounts)
  const topicIdList = Object.keys(FOCUS_TOPICS).join(', ')

  const uniqueTopics = Object.keys(content.topicCounts).filter(t => FOCUS_TOPICS[t]).length

  const stats = {
    totalItems: content.items.length,
    uniqueTopics,
    daysWithContent: content.daysWithContent,
    topicCounts: content.topicCounts,
  }

  const prompt = `You are a tech news editor specialising in AI. Given a week's collection of AI Daily items, bucketed by focus topic, produce a structured weekly digest in JSON.

Week: ${week} (${dateRange.start} to ${dateRange.end})
Stats: ${stats.totalItems} items (score ≥ ${MIN_SCORE_WEEKLY}) across ${stats.daysWithContent}/7 days, ${stats.uniqueTopics} focus topics active.

Valid focus topic ids (use these VERBATIM in topStoriesByTopic[].topic):
${topicIdList}

Content (each line: \`- [score] <title> [sources] — one-liner <url>\`):
${promptContent}

Respond with ONLY valid JSON matching this exact schema:
{
  "overview": "3-4 paragraph narrative synthesising the week. Reference specific stories by title. Call out cross-topic patterns (e.g. 'model-release drove coding-agents coverage').",
  "topStoriesByTopic": [
    {
      "topic": "coding-agents",
      "topicLabel": "Coding Agents",
      "stories": [
        {"title": "...", "url": "...", "oneLiner": "One sentence on why this matters", "score": 8.5, "sources": ["HN", "..."]}
      ]
    }
  ],
  "trendingTopics": [{"topic": "Cross-cutting trend label", "description": "Why this is trending across multiple focus topics"}],
  "keyReads": [{"title": "...", "url": "...", "summary": "What the piece is about", "why": "Why it's worth ~15 min of reading time"}]
}

Rules:
- **overview**: 3-4 paragraphs. Specific titles > vague abstractions. Mention cross-topic linkage where real.
- **topStoriesByTopic**: Include ONLY topics that actually have stories in the input content. For each topic, pick 2-4 stories; use the \`topic\` field VERBATIM from the TOPIC headers above (e.g. "coding-agents", not "Coding Agents"). Keep \`topicLabel\` as the human-readable version. Do NOT merge topics together; each topic is its own group. Do NOT invent topic ids outside the whitelist.
- **stories[]**: Use EXACT titles and URLs from the input. Never fabricate a URL. Copy \`score\` verbatim. \`oneLiner\` is 1 sentence ≤120 chars, different from a mere re-truncation of the input one-liner — add editorial judgement ("Why this matters").
- **trendingTopics**: 2-5 cross-cutting themes (can be looser than focus topics — e.g. "Open-source post-training catches up" spanning post-training + evals).
- **keyReads**: 2-5 longer-form items (research papers, deep blog posts) worth a 15-min read. Use real titles and URLs from the content. If the week has no such longform items, return \`[]\`.
- **NEVER** output placeholder URLs like "https://..." or ".../". If you cannot find a URL in the content, omit the item.`

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
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

    // --- URL post-validation (mirrors stars generate-weekly-digest.ts E1) ---

    const isRealUrl = (u: string): boolean =>
      typeof u === 'string' &&
      /^https?:\/\//.test(u) &&
      !u.endsWith('/...') &&
      !/\/\.\.\.$/.test(u) &&
      !/^https?:\/\/\.\.\.?/.test(u)

    const itemByTitle = new Map(content.items.map(i => [i.title.toLowerCase(), i]))
    const itemByCanonUrl = new Map(content.items.map(i => [canonUrl(i.url), i]))
    const urlWhitelistRaw = new Set(content.items.map(i => i.url))

    let fallthroughAttempts = 0
    let fallthroughSuccesses = 0

    function validateStory(s: any): TopStory | null {
      if (!s || typeof s.title !== 'string') return null
      const urlOk = isRealUrl(s.url) && (urlWhitelistRaw.has(s.url) || itemByCanonUrl.has(canonUrl(s.url)))
      if (!urlOk) {
        fallthroughAttempts += 1
        const real = itemByTitle.get(String(s.title).toLowerCase())
        if (!real) return null
        fallthroughSuccesses += 1
        return {
          title: s.title,
          url: real.url,
          oneLiner: typeof s.oneLiner === 'string' ? s.oneLiner : truncate(real.summary, 140),
          score: typeof s.score === 'number' ? s.score : real.score,
          sources: Array.isArray(s.sources) ? s.sources.filter((x: any) => typeof x === 'string') : (real.sources ?? []).map(x => x.name),
        }
      }
      return {
        title: s.title,
        url: s.url,
        oneLiner: typeof s.oneLiner === 'string' ? s.oneLiner : '',
        score: typeof s.score === 'number' ? s.score : 0,
        sources: Array.isArray(s.sources) ? s.sources.filter((x: any) => typeof x === 'string') : [],
      }
    }

    const fixedTopStoriesByTopic: TopicBucket[] = (Array.isArray(parsed.topStoriesByTopic) ? parsed.topStoriesByTopic : [])
      .map((b: any): TopicBucket | null => {
        if (!b || typeof b.topic !== 'string') return null
        if (!FOCUS_TOPICS[b.topic]) return null // reject invented topic ids
        const stories = Array.isArray(b.stories) ? b.stories.map(validateStory).filter(Boolean) as TopStory[] : []
        if (stories.length === 0) return null
        return {
          topic: b.topic,
          topicLabel: FOCUS_TOPICS[b.topic],
          stories,
        }
      })
      .filter(Boolean) as TopicBucket[]

    const fixedKeyReads = (Array.isArray(parsed.keyReads) ? parsed.keyReads : [])
      .map((r: any) => {
        if (!r || typeof r.title !== 'string') return null
        const urlOk = isRealUrl(r.url) && (urlWhitelistRaw.has(r.url) || itemByCanonUrl.has(canonUrl(r.url)))
        if (!urlOk) {
          fallthroughAttempts += 1
          const real = itemByTitle.get(String(r.title).toLowerCase())
          if (!real) return null
          fallthroughSuccesses += 1
          return { title: r.title, url: real.url, summary: typeof r.summary === 'string' ? r.summary : truncate(real.summary, 180), why: typeof r.why === 'string' ? r.why : '' }
        }
        return { title: r.title, url: r.url, summary: typeof r.summary === 'string' ? r.summary : '', why: typeof r.why === 'string' ? r.why : '' }
      })
      .filter(Boolean)

    if (fallthroughAttempts > 0) {
      const rate = ((fallthroughAttempts - fallthroughSuccesses) / fallthroughAttempts * 100).toFixed(1)
      console.log(`     🛡️  URL guard: ${fallthroughAttempts} repairs attempted · ${fallthroughSuccesses} succeeded · ${rate}% dropped`)
    }

    return {
      week,
      dateRange,
      overview: typeof parsed.overview === 'string' ? parsed.overview : '',
      topStoriesByTopic: fixedTopStoriesByTopic,
      trendingTopics: Array.isArray(parsed.trendingTopics)
        ? parsed.trendingTopics.filter((t: any) => t && typeof t.topic === 'string' && typeof t.description === 'string')
        : [],
      keyReads: fixedKeyReads as WeeklyDigest['keyReads'],
      stats,
    }
  } catch (err) {
    console.error('❌ DeepSeek error:', err)
    return null
  }
}

// --- Weeks to process ---

function getWeeksToProcess(): string[] {
  if (!fs.existsSync(AI_DAILY_DIR)) return []

  const dates = new Set<string>()
  for (const file of fs.readdirSync(AI_DAILY_DIR)) {
    const match = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
    if (match) dates.add(match[1])
  }

  const weeks = new Set<string>()
  for (const dateStr of dates) {
    const { year, week } = getISOWeek(new Date(dateStr + 'T00:00:00Z'))
    weeks.add(formatWeek(year, week))
  }

  const now = new Date()
  const { year: curYear, week: curWeek } = getISOWeek(now)
  const currentWeek = formatWeek(curYear, curWeek)

  return Array.from(weeks).filter(w => w < currentWeek).sort()
}

// --- Main ---

async function main(): Promise<void> {
  if (!DEEPSEEK_API_KEY) {
    console.log('⚠️  No DEEPSEEK_API_KEY set, skipping AI Daily weekly digest generation.')
    return
  }

  console.log(`📊 Generating AI Daily weekly digests${FORCE ? ' (--force: regenerating all)' : ''}...`)
  fs.mkdirSync(AI_DAILY_WEEKLY_DIR, { recursive: true })

  const weeks = getWeeksToProcess()
  if (weeks.length === 0) {
    console.log('  📭 No complete weeks found in profile-data/ai-daily/')
    return
  }

  for (const week of weeks) {
    const filePath = path.join(AI_DAILY_WEEKLY_DIR, `${week}.json`)

    if (!FORCE && fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (existing.overview && Array.isArray(existing.topStoriesByTopic)) {
          console.log(`  📄 ${week}: Digest exists, skipping`)
          continue
        }
      } catch { /* regenerate */ }
    }

    const dates = collectWeekDays(week)
    const content = loadWeekContent(dates)

    if (content.daysWithContent < MIN_DAYS_WITH_CONTENT) {
      console.log(`  ⏭️  ${week}: Skipped — only ${content.daysWithContent}/${MIN_DAYS_WITH_CONTENT} days with content`)
      continue
    }
    if (content.items.length === 0) {
      console.log(`  📭 ${week}: No items above score ${MIN_SCORE_WEEKLY}, skipping`)
      continue
    }

    const buckets = bucketByTopic(content.items)
    const dateRange = { start: dates[0], end: dates[dates.length - 1] }

    console.log(
      `  🤖 Generating ${week} (${dateRange.start} → ${dateRange.end}) — ${content.items.length} items, ${buckets.length} active topics, ${content.daysWithContent}/7 days...`
    )
    const digest = await generateWeeklyDigest(week, dateRange, content, buckets)

    if (digest) {
      fs.writeFileSync(filePath, JSON.stringify(digest, null, 2) + '\n')
      const topicCount = digest.topStoriesByTopic.length
      const storyTotal = digest.topStoriesByTopic.reduce((n, b) => n + b.stories.length, 0)
      console.log(
        `  ✅ ${week}: ${topicCount} topics · ${storyTotal} stories · ${digest.trendingTopics.length} trends · ${digest.keyReads.length} key reads`
      )
    } else {
      console.log(`  ⚠️  ${week}: DeepSeek generation failed — not writing partial digest`)
    }
  }

  console.log('🎉 Done!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
