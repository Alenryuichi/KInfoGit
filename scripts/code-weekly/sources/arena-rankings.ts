// Chatbot Arena — model ranking data via HuggingFace official dataset
// Source: https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset
// This is the official data published by the lmarena-ai team (arena.ai operators)

export interface ArenaEntry {
  rank: number
  model: string
  elo: number
  org: string
}

const HF_DATASET_API = 'https://datasets-server.huggingface.co/rows'
const DATASET = 'lmarena-ai/leaderboard-dataset'
const CONFIG = 'webdev'  // coding/webdev leaderboard — most relevant for Code section
const SPLIT = 'latest'
const PAGE_SIZE = 100

/** Normalize model slug to display name: "claude-opus-4-6-thinking" → "Claude Opus 4.6 Thinking" */
function formatModelName(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    // Collapse version-like patterns: "4 6" → "4.6", "3 1" → "3.1"
    .replace(/(\d) (\d)(?!\d)/g, '$1.$2')
    // Fix known casing
    .replace(/^Gpt /i, 'GPT-')
    .replace(/^O(\d)/i, 'o$1')  // o3, o4-mini
    .replace(/\bGlm\b/g, 'GLM')
    .replace(/\bErnie\b/g, 'ERNIE')
    .replace(/\bQwen\b/g, 'Qwen')
    .replace(/\bGrok\b/g, 'Grok')
}

/** Normalize org slug: "anthropic" → "Anthropic" */
function formatOrg(org: string): string {
  if (!org) return ''
  return org.charAt(0).toUpperCase() + org.slice(1)
}

interface HfRow {
  row: {
    rank: number
    model_name: string
    organization: string
    rating: number
    vote_count: number
    category: string
  }
}

export async function fetchArenaRankings(): Promise<ArenaEntry[]> {
  // Try HuggingFace official dataset first
  const hfResult = await fetchFromHuggingFace()
  if (hfResult.length > 0) return hfResult

  // Fallback: kearai.com (may be stale)
  console.warn('[arena] HuggingFace failed, trying kearai.com fallback')
  const kearResult = await fetchFromKearai()
  if (kearResult.length > 0) return kearResult

  console.warn('[arena] All arena sources failed')
  return []
}

async function fetchFromHuggingFace(): Promise<ArenaEntry[]> {
  try {
    // Fetch first page (top 100 models, sorted by rank)
    const url = `${HF_DATASET_API}?dataset=${DATASET}&config=${CONFIG}&split=${SPLIT}&offset=0&length=${PAGE_SIZE}`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[arena] HuggingFace HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as { rows: HfRow[] }

    if (!data.rows || data.rows.length === 0) {
      console.warn('[arena] HuggingFace returned no rows')
      return []
    }

    // Filter to "overall" category only, take top 50
    const entries: ArenaEntry[] = data.rows
      .filter(r => r.row.category === 'overall')
      .slice(0, 50)
      .map(r => ({
        rank: r.row.rank,
        model: formatModelName(r.row.model_name),
        elo: Math.round(r.row.rating),
        org: formatOrg(r.row.organization),
      }))

    if (entries.length > 0) {
      console.log(`[arena] HuggingFace: ${entries.length} models loaded`)
    }

    return entries
  } catch (err) {
    console.warn('[arena] HuggingFace failed:', err)
    return []
  }
}

async function fetchFromKearai(): Promise<ArenaEntry[]> {
  try {
    const res = await fetch('https://kearai.com/leaderboard/chat', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KInfoGit-Code-Weekly)' },
    })

    if (!res.ok) {
      console.warn(`[arena] kearai.com HTTP ${res.status}`)
      return []
    }

    const html = await res.text()
    const entries: ArenaEntry[] = []
    const rowPattern = /<tr[^>]*>[\s\S]*?<\/tr>/g
    let rowMatch: RegExpExecArray | null
    let rank = 0

    while ((rowMatch = rowPattern.exec(html)) !== null) {
      const row = rowMatch[0]
      const modelMatch = row.match(/class="model-link"[^>]*>([^<]+)<\/a>/)
      const scoreMatch = row.match(/class="score-val"[^>]*>(\d+)<\/span>/)
      if (!modelMatch || !scoreMatch) continue

      rank++
      const orgMatch = row.match(/class="org-name"[^>]*>([^<]+)<\/span>/)

      entries.push({
        rank,
        model: formatModelName(modelMatch[1].trim().replace(/ /g, '-').toLowerCase()),
        elo: parseInt(scoreMatch[1]),
        org: orgMatch ? orgMatch[1].trim() : '',
      })

      if (rank >= 50) break
    }

    return entries
  } catch (err) {
    console.warn('[arena] kearai.com failed:', err)
    return []
  }
}
