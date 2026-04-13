// Tavily Search API — English editor news search (recent 7 days only)
import { TAVILY_API_URL } from '../config'

/** Number of days to look back for search results */
const RECENCY_DAYS = 7

export interface TavilyResult {
  editor: string
  title: string
  url: string
  content: string
}

interface TavilySearchResponse {
  results: Array<{
    title: string
    url: string
    content: string
    score: number
  }>
}

export async function searchTavily(query: string, editor: string): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    console.warn('[tavily] TAVILY_API_KEY not set, skipping')
    return []
  }

  const res = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: false,
      days: RECENCY_DAYS,
    }),
  })

  if (!res.ok) {
    console.warn(`[tavily] ${editor}: HTTP ${res.status}`)
    return []
  }

  const data = await res.json() as TavilySearchResponse

  return data.results.map(r => ({
    editor,
    title: r.title,
    url: r.url,
    content: r.content.slice(0, 1000),
  }))
}

/** Build a temporal hint like "April 2026" for the current week */
function currentWeekHint(): string {
  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'long' })
  return `${month} ${now.getFullYear()}`
}

export async function fetchTavilyForEditors(
  editors: Array<{ name: string; query: string }>
): Promise<TavilyResult[]> {
  if (!process.env.TAVILY_API_KEY) {
    console.warn('[tavily] TAVILY_API_KEY not set, skipping all Tavily searches')
    return []
  }

  const hint = currentWeekHint()
  const settled = await Promise.allSettled(
    editors.map(({ name, query }) =>
      searchTavily(`${query} this week ${hint}`, name)
    )
  )

  const results: TavilyResult[] = []
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(...result.value)
    } else {
      console.warn('[tavily] Failed:', result.reason)
    }
  }

  return results
}
