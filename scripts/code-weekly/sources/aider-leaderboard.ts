// Aider Leaderboard — code editing benchmark data
import { TAVILY_API_URL } from '../config'

export interface AiderEntry {
  model: string
  passRate: number
}

export async function fetchAiderLeaderboard(): Promise<AiderEntry[]> {
  // Direct HTML scraping is more reliable than Tavily text parsing
  const direct = await fetchAiderDirectly()
  if (direct.length > 0) return direct

  // Fallback to Tavily
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    console.warn('[aider] No data from direct fetch and TAVILY_API_KEY not set')
    return []
  }

  try {
    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: 'aider leaderboard code editing benchmark latest results site:aider.chat',
        search_depth: 'advanced',
        max_results: 3,
        include_answer: true,
      }),
    })

    if (!res.ok) {
      console.warn(`[aider] Tavily HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as {
      answer?: string
      results: Array<{ content: string }>
    }

    const text = [data.answer || '', ...data.results.map(r => r.content)].join('\n')
    return parseAiderLeaderboard(text)
  } catch (err) {
    console.warn('[aider] Tavily failed:', err)
    return []
  }
}

async function fetchAiderDirectly(): Promise<AiderEntry[]> {
  try {
    const res = await fetch('https://aider.chat/docs/leaderboards/', {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[aider] Direct fetch HTTP ${res.status}`)
      return []
    }

    const html = await res.text()
    return parseAiderFromHtml(html)
  } catch (err) {
    console.warn('[aider] Direct fetch failed:', err)
    return []
  }
}

function parseAiderLeaderboard(text: string): AiderEntry[] {
  const entries: AiderEntry[] = []
  const seen = new Set<string>()
  const lines = text.split('\n')

  for (const line of lines) {
    // Pattern: model_name - XX.X% or model_name | XX.X%
    const match = line.match(/(.+?)\s*[\-–|]\s*(\d{1,3}(?:\.\d+)?)\s*%/)
    if (match) {
      const model = match[1].trim()
      const passRate = parseFloat(match[2])

      // Filter out noise: model names should be reasonable length,
      // pass rates should be plausible (10-100%), and no duplicates
      if (
        model.length >= 2 &&
        model.length <= 80 &&
        passRate >= 10 &&
        passRate <= 100 &&
        !seen.has(model)
      ) {
        seen.add(model)
        entries.push({ model, passRate })
      }
    }
  }

  return entries
    .sort((a, b) => b.passRate - a.passRate)
    .slice(0, 20)
}

/** Decode common HTML entities */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/** Strip HTML tags from a string */
function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim()
}

function parseAiderFromHtml(html: string): AiderEntry[] {
  const entries: AiderEntry[] = []
  const seen = new Set<string>()

  // Aider HTML: <tr id="main-row-N"> with <td> columns
  // We extract model from td with <span> (no class) and pass rate from td.bar-cell (not cost-bar-cell)
  const rowPattern = /<tr\s+id="main-row-\d+"[^>]*>([\s\S]*?)<\/tr>/g
  let rowMatch: RegExpExecArray | null

  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowHtml = rowMatch[1]

    // Extract model name: second <td> contains <span>model name</span>
    const modelSpanMatch = rowHtml.match(
      /<td[^>]*>\s*<span>([^<]+)<\/span>\s*<\/td>/
    )

    // Extract pass rate: td with exactly class="bar-cell" (cost cell has "bar-cell cost-bar-cell")
    const barCellMatch = rowHtml.match(
      /<td\s+class="bar-cell">\s*[\s\S]*?<span>([\d.]+)%<\/span>\s*<\/td>/
    )

    if (modelSpanMatch && barCellMatch) {
      const model = decodeEntities(modelSpanMatch[1].trim())
      const passRate = parseFloat(barCellMatch[1])

      // Sanity-check: pass rate should be 0–100, model name non-empty
      if (model && !seen.has(model) && passRate >= 0 && passRate <= 100) {
        seen.add(model)
        entries.push({ model, passRate })
      }
    }
  }

  return entries
    .sort((a, b) => b.passRate - a.passRate)
    .slice(0, 20)
}
