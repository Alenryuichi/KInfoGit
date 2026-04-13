// Chatbot Arena — coding model ranking data via wulong.dev API
// Primary: https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=code
// Fallback: HuggingFace lmarena-ai/leaderboard-dataset (webdev config)

export interface ArenaEntry {
  rank: number
  model: string
  elo: number
  org: string
}

// ─── wulong.dev API ───────────────────────────────────────

const WULONG_API = 'https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=code'

interface WulongResponse {
  meta: {
    leaderboard: string
    fetched_at: string
    model_count: number
  }
  models: Array<{
    rank: number
    model: string
    vendor: string
    license: string
    score: number
    ci: number
    votes: number
  }>
}

/** Convert slug "claude-opus-4-6-thinking" → "Claude Opus 4.6 Thinking" */
function formatModelName(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/(\d) (\d)(?!\d)/g, '$1.$2')
    .replace(/^Gpt /i, 'GPT-')
    .replace(/^O(\d)/i, 'o$1')
    .replace(/\bGlm\b/g, 'GLM')
    .replace(/\bErnie\b/g, 'ERNIE')
    .replace(/\bQwen\b/g, 'Qwen')
    .replace(/\bGrok\b/g, 'Grok')
}

async function fetchFromWulong(): Promise<{ entries: ArenaEntry[]; fetchedAt?: string }> {
  try {
    const res = await fetch(WULONG_API, {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[arena] wulong.dev HTTP ${res.status}`)
      return { entries: [] }
    }

    const data = await res.json() as WulongResponse

    if (!data.models || data.models.length === 0) {
      console.warn('[arena] wulong.dev returned no models')
      return { entries: [] }
    }

    const entries: ArenaEntry[] = data.models
      .slice(0, 50)
      .map(m => ({
        rank: m.rank,
        model: formatModelName(m.model),
        elo: m.score,
        org: m.vendor || '',
      }))

    console.log(`[arena] wulong.dev: ${entries.length} models loaded (fetched_at: ${data.meta.fetched_at})`)
    return { entries, fetchedAt: data.meta.fetched_at }
  } catch (err) {
    console.warn('[arena] wulong.dev failed:', err)
    return { entries: [] }
  }
}

// ─── HuggingFace fallback ─────────────────────────────────

const HF_DATASET_API = 'https://datasets-server.huggingface.co/rows'
const DATASET = 'lmarena-ai/leaderboard-dataset'
const CONFIG = 'webdev'
const SPLIT = 'latest'

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

async function fetchFromHuggingFace(): Promise<ArenaEntry[]> {
  try {
    const url = `${HF_DATASET_API}?dataset=${DATASET}&config=${CONFIG}&split=${SPLIT}&offset=0&length=100`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[arena] HuggingFace HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as { rows: HfRow[] }
    if (!data.rows || data.rows.length === 0) return []

    const entries = data.rows
      .filter(r => r.row.category === 'overall')
      .slice(0, 50)
      .map(r => ({
        rank: r.row.rank,
        model: formatModelName(r.row.model_name),
        elo: Math.round(r.row.rating),
        org: r.row.organization ? r.row.organization.charAt(0).toUpperCase() + r.row.organization.slice(1) : '',
      }))

    if (entries.length > 0) {
      console.log(`[arena] HuggingFace fallback: ${entries.length} models loaded`)
    }
    return entries
  } catch (err) {
    console.warn('[arena] HuggingFace failed:', err)
    return []
  }
}

// ─── Public API ───────────────────────────────────────────

/** Fetch Arena coding rankings. Returns entries + optional publish date. */
export async function fetchArenaRankings(): Promise<ArenaEntry[]> {
  const wulong = await fetchFromWulong()
  if (wulong.entries.length > 0) return wulong.entries

  console.warn('[arena] wulong.dev failed, trying HuggingFace fallback')
  const hf = await fetchFromHuggingFace()
  if (hf.length > 0) return hf

  console.warn('[arena] All arena sources failed')
  return []
}

/** Fetch Arena publish/fetched date from wulong.dev meta. */
export async function fetchArenaPublishDate(): Promise<string | undefined> {
  try {
    const res = await fetch(WULONG_API, {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })
    if (!res.ok) return undefined
    const data = await res.json() as WulongResponse
    // Return date portion of fetched_at ISO string
    return data.meta?.fetched_at?.slice(0, 10) || undefined
  } catch {
    return undefined
  }
}
