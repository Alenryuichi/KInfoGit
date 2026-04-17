// Code Weekly — Editor tracking configuration
// Add/remove editors here to change what gets tracked each week.

export type EditorCategory = 'ide' | 'cli'

export interface EditorConfig {
  name: string
  category: EditorCategory
  sources: {
    githubRepo?: string        // owner/repo — for GitHub Releases API
    rssUrl?: string            // company blog RSS feed
    tavilyQuery?: string       // English search query template
    bailianQuery?: string      // Chinese search query template
    npmPackage?: string        // npm package name — for npm registry API
    changelogUrl?: string      // HTML changelog page URL — for changelog-page scraper
  }
}

export interface RssFeedConfig {
  company: string
  url: string
  tags?: string[]
}

// ─── Editor List ───────────────────────────────────────────

export const EDITORS: EditorConfig[] = [
  // IDE
  {
    name: 'Cursor',
    category: 'ide',
    sources: {
      rssUrl: 'https://cursor.com/changelog/rss.xml',
      tavilyQuery: 'Cursor IDE new features updates this week',
    },
  },
  {
    name: 'Windsurf',
    category: 'ide',
    sources: {
      changelogUrl: 'https://windsurf.com/changelog',
      tavilyQuery: 'Windsurf IDE updates OR Windsurf release notes OR Codeium Windsurf changelog',
    },
  },
  {
    name: 'Trae',
    category: 'ide',
    sources: {
      githubRepo: 'bytedance/trae-agent',
      changelogUrl: 'https://docs.trae.ai/ide/changelog',
      bailianQuery: 'Trae AI 编辑器 最新功能 更新',
      tavilyQuery: 'Trae AI editor ByteDance new features this week',
    },
  },
  {
    name: 'Augment',
    category: 'ide',
    sources: {
      changelogUrl: 'https://www.augmentcode.com/changelog',
      tavilyQuery: 'Augment Code editor updates OR Augment IDE release notes OR Augment AI announcement',
    },
  },
  // CLI / Plugin
  {
    name: 'Claude Code',
    category: 'cli',
    sources: {
      npmPackage: '@anthropic-ai/claude-code',
      changelogUrl: 'https://platform.claude.com/docs/en/agents-and-tools/claude-code/changelog',
      tavilyQuery: 'Claude Code release OR Claude CLI update OR Anthropic Claude Code changelog',
    },
  },
  {
    name: 'Gemini CLI',
    category: 'cli',
    sources: {
      githubRepo: 'google-gemini/gemini-cli',
      tavilyQuery: 'Gemini CLI Google new features this week',
    },
  },
  {
    name: 'OpenCode',
    category: 'cli',
    sources: {
      githubRepo: 'opencode-ai/opencode',
      tavilyQuery: 'OpenCode AI terminal coding new features this week',
    },
  },
  {
    name: 'Aider',
    category: 'cli',
    sources: {
      githubRepo: 'Aider-AI/aider',
      tavilyQuery: 'Aider AI coding assistant new features this week',
    },
  },
  {
    name: 'Copilot',
    category: 'cli',
    sources: {
      tavilyQuery: 'GitHub Copilot new features updates this week',
    },
  },
  {
    name: 'CodeBuddy',
    category: 'cli',
    sources: {
      npmPackage: '@tencent-ai/codebuddy-code',
      bailianQuery: 'CodeBuddy 腾讯 AI 编程助手 最新功能 更新',
      tavilyQuery: 'CodeBuddy Tencent AI coding assistant new features',
    },
  },
]

// ─── Company Blog RSS Feeds ────────────────────────────────

export const RSS_FEEDS: RssFeedConfig[] = [
  // Anthropic removed their RSS feed — rely on Tavily search instead
  // { company: 'Anthropic', url: 'https://www.anthropic.com/rss.xml', tags: ['claude', 'safety'] },
  // OpenAI removed their blog RSS feed — rely on Tavily search instead
  // { company: 'OpenAI', url: 'https://openai.com/blog/rss.xml', tags: ['gpt', 'chatgpt'] },
  { company: 'Google AI', url: 'https://blog.google/innovation-and-ai/technology/ai/rss/', tags: ['gemini', 'deepmind'] },
  { company: 'Cursor', url: 'https://cursor.com/changelog/rss.xml', tags: ['cursor', 'ide'] },
  { company: 'Vercel', url: 'https://vercel.com/atom', tags: ['v0', 'ai-sdk'] },
  { company: 'Windsurf', url: 'https://windsurf.com/feed.xml', tags: ['windsurf', 'codeium', 'ide'] },
]

// ─── API Configuration ─────────────────────────────────────

export const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
export const DEEPSEEK_MODEL = 'deepseek-chat'

export const TAVILY_API_URL = 'https://api.tavily.com/search'

export const BAILIAN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
export const BAILIAN_MODEL = 'qwen-plus'

// ─── Output paths ──────────────────────────────────────────

export const CODE_WEEKLY_DIR = 'profile-data/code-weekly'
export const BENCHMARKS_DIR = 'profile-data/benchmarks'
export const BENCHMARKS_HISTORY_DIR = 'profile-data/benchmarks/history'
export const BENCHMARKS_HEALTH_DIR = 'profile-data/benchmarks/_health'

// ─── Week Boundaries (Asia/Shanghai) ───────────────────────
//
// The whole pipeline must agree on exactly one [start, end) week window.
// Prior to 2026-04-17 each source used its own `new Date(); setDate(-7)`,
// producing a rolling 7×24h window that drifted by hours depending on
// when cron actually fired — so items from Monday AM of the *next* week
// leaked in, and items from Monday AM of the *target* week dropped out.
//
// Contract:
//   - A week is Monday 00:00 Asia/Shanghai ..= Sunday 23:59:59.999.
//   - The "reference date" picks WHICH week. If referenceDate itself is
//     a Monday, we treat it as the first day of that week (so the cron
//     job that runs Monday morning describes the previous Mon–Sun, and
//     the caller should pass `yesterday` to land on the previous Sunday).
//   - All sources receive `bounds.start` / `bounds.end` and must filter
//     `publishedAt` against them; the main script re-applies the same
//     filter defensively after merging.

export interface WeekBounds {
  /** Inclusive lower bound (Monday 00:00:00 Asia/Shanghai), as UTC Date. */
  start: Date
  /** Exclusive upper bound (next Monday 00:00:00 Asia/Shanghai), as UTC Date. */
  end: Date
  /** ISO week label e.g. "2026-W16". */
  weekLabel: string
  /** Human-readable range "2026-04-13 — 2026-04-19". */
  dateRange: string
}

/**
 * Return a Date representing the Asia/Shanghai wall-clock time of `d`
 * reinterpreted as UTC. Used purely for extracting the Shanghai
 * Y/M/D/weekday components — never displayed to users.
 */
function toShanghaiClock(d: Date): Date {
  // Intl formatToParts gives us stable numeric parts regardless of the
  // host OS timezone, which is what we need in CI environments (UTC).
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const map: Record<string, string> = {}
  for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value
  // Reinterpret as UTC so day-arithmetic stays timezone-free.
  return new Date(Date.UTC(
    +map.year, +map.month - 1, +map.day,
    +map.hour, +map.minute, +map.second,
  ))
}

/**
 * Convert a Shanghai wall-clock UTC date (as produced above) back to a
 * real UTC instant. Asia/Shanghai is a fixed UTC+8 offset with no DST,
 * so this is a simple shift.
 */
function shanghaiWallClockToUtc(d: Date): Date {
  return new Date(d.getTime() - 8 * 60 * 60 * 1000)
}

/**
 * Compute week bounds for the week containing `referenceDate` in
 * Asia/Shanghai. Used by both fetch-code-weekly and by source modules.
 */
export function getWeekBoundsInShanghai(referenceDate: Date = new Date()): WeekBounds {
  const shClock = toShanghaiClock(referenceDate)
  // getUTCDay on a Shanghai-wall-clock-as-UTC Date gives Shanghai weekday.
  // 0=Sun .. 6=Sat → we want ISO (Monday=1..Sunday=7).
  const isoDow = shClock.getUTCDay() === 0 ? 7 : shClock.getUTCDay()
  // Roll back to Monday 00:00 Shanghai wall-clock.
  const mondayShClock = new Date(Date.UTC(
    shClock.getUTCFullYear(), shClock.getUTCMonth(), shClock.getUTCDate(),
    0, 0, 0, 0,
  ))
  mondayShClock.setUTCDate(mondayShClock.getUTCDate() - (isoDow - 1))
  const nextMondayShClock = new Date(mondayShClock)
  nextMondayShClock.setUTCDate(nextMondayShClock.getUTCDate() + 7)

  const start = shanghaiWallClockToUtc(mondayShClock)
  const end = shanghaiWallClockToUtc(nextMondayShClock)

  // ISO week label — use the Thursday of this week to match ISO 8601
  // week-numbering rules (Thursday always falls in the correct year).
  const thursdayShClock = new Date(mondayShClock)
  thursdayShClock.setUTCDate(thursdayShClock.getUTCDate() + 3)
  const isoYear = thursdayShClock.getUTCFullYear()
  const jan4 = new Date(Date.UTC(isoYear, 0, 4))
  const jan4Dow = jan4.getUTCDay() === 0 ? 7 : jan4.getUTCDay()
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1))
  const weekNo = Math.round(
    (thursdayShClock.getTime() - week1Monday.getTime()) / (7 * 86400_000),
  ) + 1

  const sundayShClock = new Date(mondayShClock)
  sundayShClock.setUTCDate(sundayShClock.getUTCDate() + 6)
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

  return {
    start,
    end,
    weekLabel: `${isoYear}-W${String(weekNo).padStart(2, '0')}`,
    dateRange: `${fmt(mondayShClock)} — ${fmt(sundayShClock)}`,
  }
}
