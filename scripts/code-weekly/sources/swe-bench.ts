// SWE-bench Verified leaderboard — software engineering benchmark data

export interface SweBenchEntry {
  model: string
  resolved: number // percentage of issues resolved
  org?: string
}

/** Top-level JSON shape embedded in swebench.com HTML */
interface LeaderboardCategory {
  name: string
  results: LeaderboardResult[]
}

interface LeaderboardResult {
  name: string
  resolved: number
  tags?: string[]
  os_model?: boolean
  os_system?: boolean
  date?: string
  cost?: number
  [key: string]: unknown
}

const SWE_BENCH_URL = 'https://www.swebench.com'
const CATEGORY = 'Verified'
const MAX_ENTRIES = 30

export async function fetchSweBench(): Promise<SweBenchEntry[]> {
  try {
    const res = await fetch(SWE_BENCH_URL, {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[swe-bench] HTTP ${res.status}`)
      return []
    }

    const html = await res.text()
    return parseLeaderboardFromHtml(html)
  } catch (err) {
    console.warn('[swe-bench] Fetch failed:', err)
    return []
  }
}

function parseLeaderboardFromHtml(html: string): SweBenchEntry[] {
  // Data lives in <script type="application/json" id="leaderboard-data">
  const startMarker = 'id="leaderboard-data">'
  const startIdx = html.indexOf(startMarker)
  if (startIdx === -1) {
    console.warn('[swe-bench] leaderboard-data script tag not found')
    return []
  }

  const jsonStart = startIdx + startMarker.length
  const jsonEnd = html.indexOf('</script>', jsonStart)
  if (jsonEnd === -1) {
    console.warn('[swe-bench] Could not find closing </script> tag')
    return []
  }

  let categories: LeaderboardCategory[]
  try {
    categories = JSON.parse(html.slice(jsonStart, jsonEnd))
  } catch (err) {
    console.warn('[swe-bench] JSON parse failed:', err)
    return []
  }

  const verified = categories.find((c) => c.name === CATEGORY)
  if (!verified) {
    console.warn(
      `[swe-bench] "${CATEGORY}" category not found. Available: ${categories.map((c) => c.name).join(', ')}`,
    )
    return []
  }

  return verified.results
    .filter((r) => typeof r.resolved === 'number' && r.resolved > 0)
    .sort((a, b) => b.resolved - a.resolved)
    .slice(0, MAX_ENTRIES)
    .map((r) => ({
      model: r.name,
      resolved: r.resolved,
      org: extractOrg(r.tags),
    }))
}

/** Extract org from tags like ["Org: Anthropic", "Model: claude-4", ...] */
function extractOrg(tags?: string[]): string | undefined {
  if (!tags) return undefined
  for (const tag of tags) {
    if (tag.startsWith('Org: ')) {
      return tag.slice(5)
    }
  }
  return undefined
}
