// AI Daily — Reddit source
//
// Fetches the public .rss Atom endpoints for a hardcoded allowlist of
// AI-focused subreddits, filters out megathread/pinned posts by title
// prefix, and emits clean RawNewsItem entries with sourceType: 'rss'.
//
// Why its own module (vs. inlining into rss-feeds.ts):
//   - Reddit RSS summaries are double-HTML-encoded inside CDATA, so they
//     need a decodeEntities pass before the generic stripHtml.
//   - Reddit feeds include several "sticky" megathread posts (Self-
//     Promotion Thread, Monthly Who's Hiring, Best Local LLMs monthly)
//     that would add noise; we filter them by title prefix here rather
//     than polluting the generic parser with Reddit-aware branches.
//   - Reddit markup includes SC_OFF / SC_ON content markers and trailing
//     "[link] [comments]" spans that need trimming.
//
// See openspec/changes/ai-daily-deepmind-reddit-sources/design.md for
// the full rationale.

import type { RawNewsItem } from '../types'

/**
 * Subreddits fetched in every run. Hardcoded allowlist; adding/removing
 * a subreddit is a one-line edit. Deliberately small — two high-signal
 * subs beat five noisy ones. Candidates intentionally NOT included:
 *   - r/singularity        → AGI speculation, low news density
 *   - r/artificial         → generic, mostly reposts from trade press
 *   - r/OpenAI / r/ClaudeAI → product fan subs, lots of "my chat doesn't work"
 */
const REDDIT_SUBREDDITS = ['LocalLLaMA', 'MachineLearning']

/**
 * Title prefixes that mark megathreads / pinned administrative posts.
 * Prefix-match is intentional (not regex): lower false-positive risk on
 * user-submitted titles. Add a line when a new megathread format shows up.
 */
const REDDIT_TITLE_BLACKLIST_PREFIXES = [
  '[D] Self-Promotion Thread',
  '[D] Monthly Who',          // matches "[D] Monthly Who's Hiring and Who wants to be Hired?"
  '[D] Simple Questions',
  'Best Local LLMs',          // monthly r/LocalLLaMA megathread
  'Announcing LocalLlama',    // pinned Discord promo
  'Megathread',               // generic
]

/** Max items per subreddit to keep the request pool bounded. */
const MAX_ITEMS_PER_SUBREDDIT = 15

/** 15s network timeout, matches sources/rss-feeds.ts. */
const FETCH_TIMEOUT_MS = 15_000

/**
 * Fetch each allowed subreddit's .rss, parse the Atom, filter by
 * megathread blacklist + 24h window, and return merged RawNewsItem list.
 * Uses Promise.allSettled so a single subreddit's 429/timeout doesn't
 * nuke the others.
 */
export async function fetchRedditItems(): Promise<RawNewsItem[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 1)

  const results = await Promise.allSettled(
    REDDIT_SUBREDDITS.map(sub => fetchSubreddit(sub, cutoff))
  )

  const items: RawNewsItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value)
    }
  }

  console.log(`[reddit] ${items.length} items from ${REDDIT_SUBREDDITS.length} subreddits`)
  return items
}

async function fetchSubreddit(sub: string, since: Date): Promise<RawNewsItem[]> {
  const url = `https://www.reddit.com/r/${sub}/.rss`
  const sourceName = `Reddit r/${sub}`

  try {
    const res = await fetch(url, {
      headers: {
        // UA identifies the project so Reddit's abuse team can reach us
        // if needed. Mozilla prefix keeps compatibility with user-agent
        // heuristics on Reddit's edge.
        'User-Agent': 'Mozilla/5.0 (compatible; KInfoGit-AI-Daily/1.0; +https://github.com)',
        Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!res.ok) {
      console.warn(`[reddit] ${sourceName}: HTTP ${res.status}`)
      return []
    }

    const xml = await res.text()
    const parsed = parseAtomEntries(xml, sourceName, since)
    const filtered = parsed.filter(item => !isMegathread(item.title))
    const truncated = filtered.slice(0, MAX_ITEMS_PER_SUBREDDIT)

    const filterCount = parsed.length - filtered.length
    if (truncated.length > 0 || filterCount > 0) {
      console.log(`[reddit] ${sourceName}: ${truncated.length} items (${filterCount} filtered, ${parsed.length - truncated.length - filterCount} truncated)`)
    }

    return truncated
  } catch (err) {
    console.warn(`[reddit] ${sourceName} failed:`, err)
    return []
  }
}

/**
 * Parse Atom <entry> blocks. Reddit's RSS is actually Atom format:
 *   <entry>
 *     <title>...</title>
 *     <link href="..."/>
 *     <updated>ISO</updated>
 *     <published>ISO</published>
 *     <content type="html"><![CDATA[<double-encoded HTML>]]></content>
 *   </entry>
 */
function parseAtomEntries(xml: string, sourceName: string, since: Date): RawNewsItem[] {
  const items: RawNewsItem[] = []
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi

  let match: RegExpExecArray | null
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1]

    const title = extractTag(block, 'title')
    const link = extractAtomLink(block)
    const pub = extractTag(block, 'published') ||
                extractTag(block, 'updated')
    const rawSummary = extractTag(block, 'content') ||
                       extractTag(block, 'summary') ||
                       ''

    if (!title || !link) continue

    // 24h date filter. Atom uses ISO 8601, Date constructor handles it.
    if (pub) {
      const d = new Date(pub)
      if (!isNaN(d.getTime()) && d < since) continue
    }

    items.push({
      title: decodeEntities(title).trim(),
      url: link,
      summary: cleanRedditSummary(rawSummary),
      sourceName,
      sourceType: 'rss',
      publishedAt: pub || new Date().toISOString(),
    })
  }

  return items
}

/**
 * Extract the first matching tag body. Handles CDATA wrapping.
 * Local copy (not imported from rss-feeds.ts) to keep this module
 * self-contained.
 */
function extractTag(xml: string, tag: string): string | null {
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1]

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

/** Atom <link href="..."/> extraction. */
function extractAtomLink(block: string): string | null {
  const m = block.match(/<link[^>]*href="([^"]+)"/i)
  return m ? m[1] : null
}

/**
 * Clean Reddit's content/description:
 *   1. decodeEntities (first pass — outer HTML-entity layer, including
 *      numeric entities like &#32; for space)
 *   2. strip HTML tags (now exposed as plain tags after step 1)
 *   3. remove SC_OFF / SC_ON Shreddit content markers
 *   4. remove "submitted by /u/xxx" lines and trailing "[link] [comments]" markers
 *   5. collapse whitespace and truncate to 500 chars
 */
export function cleanRedditSummary(raw: string): string {
  return decodeEntities(raw)
    .replace(/<!--\s*SC_OFF\s*-->/gi, '')
    .replace(/<!--\s*SC_ON\s*-->/gi, '')
    .replace(/<[^>]+>/g, ' ')                       // strip all tags
    .replace(/submitted by\s+\/u\/\S+/gi, '')       // "submitted by /u/user"
    .replace(/\[link\]\s*\[comments\]\s*$/i, '')    // trailing marker
    .replace(/\[link\]\s*\[comments\]/gi, '')       // inline variant (safety)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

/**
 * HTML-entity decoder. Reddit's content field is HTML that's been
 * HTML-entity-encoded (one layer), so a single decodeEntities pass
 * before stripHtml gets us to readable plaintext.
 *
 * Handles both named entities (&amp;) and numeric entities (&#32;,
 * &#xA0;) that appear in Reddit markup (esp. &#32; used as a visible
 * word-separator to force the "submitted by" text on its own line).
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Numeric entities: decimal (e.g. &#32; = space) and hex (e.g. &#xA0; = nbsp)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
}

/** True if title starts with any of the megathread/pinned prefixes. */
export function isMegathread(title: string): boolean {
  return REDDIT_TITLE_BLACKLIST_PREFIXES.some(p => title.startsWith(p))
}
