// AI Daily — search engine sources (Tavily + Exa)

import { TAVILY_QUERIES, EXA_QUERY, EXA_DOMAINS } from '../config'
import type { RawNewsItem } from '../types'

const TAVILY_API_URL = 'https://api.tavily.com/search'
const EXA_API_URL = 'https://api.exa.ai/search'

// ─── URL Filtering ───────────────────────────────────────

/** Domains that host evergreen/aggregator content, not daily news */
const EXCLUDED_DOMAINS = [
  'youtube.com', 'youtu.be',
  'reddit.com',
  'github.com',
  'medium.com',             // most Medium hits are listicles
  'codesubmit.io',
  'manus.im',
  'builder.io',
  'machinelearningmastery.com',
  'llm-stats.com',
  'pricepertoken.com',
  'scouts.yutori.com',
]

/** URL path patterns that indicate non-news pages (homepages, category pages, tag pages) */
const EXCLUDED_PATH_PATTERNS = [
  /^\/(?:research)?\/?$/,                   // site homepages like ai.google/research/
  /\/category\//i,                          // category listing pages
  /\/tag\//i,                               // tag listing pages
  /\/best[-_].*tools/i,                     // "best X tools" evergreen lists
  /\/top[-_]\d+/i,                          // "top 10" style lists
]

/** Returns true if the URL should be excluded (evergreen / non-news) */
function isExcludedUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const hostname = u.hostname.replace(/^www\./, '')

    // Check domain blocklist
    if (EXCLUDED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
      return true
    }

    // Check path patterns
    if (EXCLUDED_PATH_PATTERNS.some(re => re.test(u.pathname))) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Search for AI news via Tavily and Exa.
 */
export async function fetchSearchItems(): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled([
    fetchTavilyItems(),
    fetchExaItems(),
  ])

  const items: RawNewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }

  console.log(`[search] ${items.length} items total`)
  return items
}

// ─── Tavily ───────────────────────────────────────────────

async function fetchTavilyItems(): Promise<RawNewsItem[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    console.log('[search] TAVILY_API_KEY not set, skipping Tavily')
    return []
  }

  const results = await Promise.allSettled(
    TAVILY_QUERIES.map(q => searchTavily(apiKey, q))
  )

  const items: RawNewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }

  if (items.length > 0) console.log(`[search] Tavily: ${items.length} results`)
  return items
}

async function searchTavily(apiKey: string, query: string): Promise<RawNewsItem[]> {
  try {
    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        topic: 'news',
        search_depth: 'basic',
        max_results: 8,
        days: 1,
        exclude_domains: EXCLUDED_DOMAINS,
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[search] Tavily HTTP ${res.status} for "${query.slice(0, 40)}"`)
      return []
    }

    const data = await res.json() as {
      results: Array<{
        title: string
        url: string
        content: string
        score: number
        published_date?: string
      }>
    }

    const beforeFilter = (data.results ?? []).filter(r => r.score > 0.4)
    const afterFilter = beforeFilter.filter(r => !isExcludedUrl(r.url))

    if (beforeFilter.length !== afterFilter.length) {
      console.log(`[search] Tavily: filtered ${beforeFilter.length - afterFilter.length} evergreen URLs`)
    }

    return afterFilter.map(r => ({
      title: r.title,
      url: r.url,
      summary: (r.content ?? '').slice(0, 500),
      sourceName: extractDomain(r.url),
      sourceType: 'search' as const,
      publishedAt: r.published_date ?? new Date().toISOString(),
    }))
  } catch (err) {
    console.warn(`[search] Tavily failed:`, err)
    return []
  }
}

// ─── Exa ──────────────────────────────────────────────────

async function fetchExaItems(): Promise<RawNewsItem[]> {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    console.log('[search] EXA_API_KEY not set, skipping Exa')
    return []
  }

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 1)

    const res = await fetch(EXA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        query: EXA_QUERY,
        numResults: 5,
        type: 'auto',
        contents: { text: { maxCharacters: 500 } },
        startPublishedDate: startDate.toISOString(),
        includeDomains: EXA_DOMAINS,
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[search] Exa HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as {
      results: Array<{ title: string; url: string; text: string; publishedDate?: string }>
    }

    const items = (data.results ?? []).map(r => ({
      title: r.title ?? '',
      url: r.url,
      summary: (r.text ?? '').slice(0, 500),
      sourceName: extractDomain(r.url),
      sourceType: 'search' as const,
      publishedAt: r.publishedDate ?? new Date().toISOString(),
    }))

    if (items.length > 0) console.log(`[search] Exa: ${items.length} results`)
    return items
  } catch (err) {
    console.warn(`[search] Exa failed:`, err)
    return []
  }
}

// ─── Helpers ──────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    // Strip www. and common suffixes for cleaner display
    return hostname.replace(/^www\./, '')
  } catch {
    return 'web'
  }
}
