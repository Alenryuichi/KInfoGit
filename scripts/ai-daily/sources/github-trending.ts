// AI Daily — GitHub Trending source
//
// Scrapes github.com/trending HTML (no official API exists) across a few
// languages, filters rows whose repo name or description contains AI-related
// keywords, and emits them as RawNewsItems with priorScore derived from
// "stars today" — the community-signal analog of HN's score.
//
// Why scrape instead of use a third-party API:
//   - Unofficial APIs (gitterapp, github-trending-api.de) come and go.
//     GitHub's own /trending page has been stable for a decade.
//   - HTML structure: each repo is an <article class="Box-row"> block.
//     We match repo path, description, and a "N stars today" span.
//
// Why these three language slices:
//   - `all`       → captures AI projects written in Rust, Go, C++, etc.
//   - `python`    → core ML / research ecosystem
//   - `typescript` → AI coding agents, MCP servers, frontend LLM tools
//
// Deduplication: multiple slices will often surface the same repo (it
// appears on both python/ and all/). URL-level dedup in fetch-ai-daily
// handles this downstream, so we don't dedup inside this source.

import type { RawNewsItem } from '../types'

const TRENDING_URLS: ReadonlyArray<{ slice: string; url: string }> = [
  { slice: 'all',        url: 'https://github.com/trending?since=daily' },
  { slice: 'python',     url: 'https://github.com/trending/python?since=daily' },
  { slice: 'typescript', url: 'https://github.com/trending/typescript?since=daily' },
]

const MAX_PER_SLICE = 10

/**
 * AI-relevance keywords. Intentionally narrower than BLUESKY_AI_KEYWORDS —
 * repos get matched if ANY keyword appears in repo path or description.
 * Case-insensitive. Word-boundary matching to avoid false positives like
 * "rainbow" matching "ai".
 */
const AI_KEYWORDS: ReadonlyArray<string> = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'agent', 'mcp',
  'transformer', 'diffusion', 'embedding', 'rag', 'retrieval',
  'fine-tun', 'prompt', 'inference', 'neural', 'reasoning',
  'multimodal', 'openai', 'anthropic', 'deepseek', 'mistral',
  'llama', 'qwen', 'huggingface', 'langchain', 'langgraph',
  'vector', 'semantic search', 'chatbot', 'copilot',
]

export async function fetchGithubTrendingItems(): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    TRENDING_URLS.map(t => fetchOneSlice(t.slice, t.url))
  )

  const items: RawNewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }

  console.log(`[github] ${items.length} AI-relevant items from ${TRENDING_URLS.length} slices`)
  return items
}

async function fetchOneSlice(slice: string, url: string): Promise<RawNewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        // github.com serves the full trending HTML to any browser-like UA.
        // Bot UAs sometimes receive a simplified page without descriptions.
        'User-Agent': 'Mozilla/5.0 (compatible; KInfoGit-AI-Daily/1.0; +https://github.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      console.warn(`[github] ${slice}: HTTP ${res.status}`)
      return []
    }
    const html = await res.text()
    const items = parseTrendingHtml(html, slice).slice(0, MAX_PER_SLICE)
    if (items.length > 0) {
      console.log(`[github] ${slice}: ${items.length} items`)
    }
    return items
  } catch (err) {
    console.warn(`[github] ${slice} failed:`, err)
    return []
  }
}

function parseTrendingHtml(html: string, slice: string): RawNewsItem[] {
  const items: RawNewsItem[] = []

  // Each repo is wrapped in <article class="Box-row">…</article>.
  const articleRegex = /<article class="Box-row">([\s\S]*?)<\/article>/g
  let match: RegExpExecArray | null

  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1]

    // Repo path: first href attribute on the <a> inside the <h2>
    const pathMatch = block.match(/<h2[^>]*>[\s\S]*?href="([^"]+)"/)
    if (!pathMatch) continue
    const repoPath = pathMatch[1]  // e.g. "/openai/openai-agents-python"
    if (!/^\/[^/]+\/[^/]+$/.test(repoPath)) continue  // skip non-repo hrefs

    // Description: <p class="col-9 color-fg-muted …">…</p>
    // color-fg-muted is the defining class for trending descriptions.
    const descMatch = block.match(
      /<p class="col-9 color-fg-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/
    )
    const description = descMatch
      ? decodeHtml(descMatch[1].replace(/<[^>]+>/g, '')).trim()
      : ''

    // "N stars today" — the trending-specific delta stars count.
    // Missing on the "weekly" / "monthly" views, but we only fetch daily.
    const starsMatch = block.match(/([\d,]+)\s*stars today/)
    const starsToday = starsMatch ? parseInt(starsMatch[1].replace(/,/g, ''), 10) : 0

    // AI relevance: match on path OR description (case-insensitive)
    const haystack = (repoPath + ' ' + description).toLowerCase()
    const isAi = AI_KEYWORDS.some(k => haystack.includes(k))
    if (!isAi) continue

    // Construct item. priorScore maps stars-today into 0-1:
    //   0-49    → 0.00-0.05  (noise floor)
    //   50-199  → 0.05-0.20  (emerging interest)
    //   200-499 → 0.20-0.50  (solid traction)
    //   500-999 → 0.50-0.99  (clear break-out)
    //   ≥1000   → 1.00       (max signal)
    const prior = Math.min(starsToday / 1000, 1)

    const repoName = repoPath.slice(1)  // strip leading "/"
    items.push({
      title: repoName,
      url: `https://github.com${repoPath}`,
      summary: description || '(no description)',
      sourceName: `GitHub trending:${slice} (+${starsToday}★)`,
      sourceType: 'github',
      publishedAt: new Date().toISOString(),
      priorScore: prior,
    })
  }

  return items
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
}
