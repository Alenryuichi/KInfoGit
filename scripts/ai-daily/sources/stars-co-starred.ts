// AI Daily — Co-Starred repos source.
//
// Consumes profile-data/github-stars/*.json (produced by the Stars board)
// and emits RawNewsItem entries for repos that were independently starred
// by >= 2 distinct "leader" handles within a rolling 30-day window.
//
// Why this exists: high-signal AI research tooling is often surfaced by
// researchers personally starring repos before any release note / trade
// press article. When two or more leaders independently star the same
// repo, that's evidence the repo deserves wider attention — exactly the
// gap RSS / Exa / Tavily miss (they track announcements, not quiet
// research uptake).
//
// Design mirrors scripts/code-weekly/sources/ai-daily-ingest.ts: do NOT
// import from website/lib/* (different build env). Read raw JSON directly
// and re-implement the minimal subset of aggregation logic we need.
//
// See openspec/changes/archive/YYYY-MM-DD-ai-daily-co-starred-source/
// design.md for the full rationale.

import fs from 'fs'
import path from 'path'
import type { RawNewsItem } from '../types'

/** Rolling window (days, ending today Asia/Shanghai). */
const LOOKBACK_DAYS = 30

/** Minimum distinct handles required for a repo to qualify. */
const MIN_COUNT = 2

/** Cap on output items — keep the pipeline bounded if Stars scales up. */
const MAX_ITEMS = 10

/** Summary leading-text character budget and overall cap. */
const SUMMARY_MAX = 500

/** Directory name under profile-data/ that holds daily github-star JSONs. */
const STARS_SUBDIR = 'github-stars'

interface StarRecord {
  repo: string
  url?: string
  description?: string
  stargazersCount?: number
  starredBy?: string | string[]
  score?: number
}

interface Aggregate {
  url: string
  description: string
  stargazersCount: number
  maxScore: number
  starredBy: Set<string>
  latestDate: string
}

/**
 * Return YYYY-MM-DD strings for the last `days` calendar days ending today
 * (inclusive), in Asia/Shanghai to match the pipeline's date key.
 */
function recentDateKeys(days: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = 0; i < days; i += 1) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    keys.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }))
  }
  return keys
}

/**
 * Load a single day's star records. Returns [] on any error (missing file,
 * malformed JSON, unexpected shape). Never throws.
 */
function loadDailyStars(starsDir: string, date: string): StarRecord[] {
  const fp = path.join(starsDir, `${date}.json`)
  if (!fs.existsSync(fp)) return []
  try {
    const raw = fs.readFileSync(fp, 'utf-8')
    const parsed = JSON.parse(raw)
    const stars = parsed?.stars
    return Array.isArray(stars) ? (stars as StarRecord[]) : []
  } catch {
    return []
  }
}

/**
 * Coerce `starredBy` (which may be a single string or array) into an array.
 */
function handlesOf(s: StarRecord): string[] {
  if (Array.isArray(s.starredBy)) return s.starredBy.filter(h => typeof h === 'string' && h.length > 0)
  if (typeof s.starredBy === 'string' && s.starredBy.length > 0) return [s.starredBy]
  return []
}

/**
 * Aggregate co-starred repos across the lookback window and emit them as
 * RawNewsItem[] ready for the main pipeline's dedup / scoring / sectioning.
 */
export async function fetchCoStarredItems(projectRoot: string): Promise<RawNewsItem[]> {
  const starsDir = path.join(projectRoot, 'profile-data', STARS_SUBDIR)

  if (!fs.existsSync(starsDir)) {
    console.log('[co-starred] github-stars directory missing — skipping')
    return []
  }

  const dates = recentDateKeys(LOOKBACK_DAYS)
  const repoMap = new Map<string, Aggregate>()

  for (const date of dates) {
    const stars = loadDailyStars(starsDir, date)
    for (const s of stars) {
      if (!s.repo) continue
      const handles = handlesOf(s)
      if (handles.length === 0) continue

      let agg = repoMap.get(s.repo)
      if (!agg) {
        agg = {
          url: typeof s.url === 'string' && s.url ? s.url : `https://github.com/${s.repo}`,
          description: typeof s.description === 'string' ? s.description : '',
          stargazersCount: typeof s.stargazersCount === 'number' ? s.stargazersCount : 0,
          maxScore: 0,
          starredBy: new Set<string>(),
          latestDate: date,
        }
        repoMap.set(s.repo, agg)
      }

      // Update the aggregate in place.
      for (const h of handles) agg.starredBy.add(h)
      if (typeof s.score === 'number' && s.score > agg.maxScore) agg.maxScore = s.score
      if (typeof s.stargazersCount === 'number' && s.stargazersCount > agg.stargazersCount) {
        agg.stargazersCount = s.stargazersCount
      }
      // Keep the most-recent-seen description (non-empty wins).
      if (typeof s.description === 'string' && s.description.length > 0) {
        agg.description = s.description
      }
      // latestDate = max observed date across window
      if (date > agg.latestDate) agg.latestDate = date
    }
  }

  // Filter, sort, cap.
  const qualified = Array.from(repoMap.entries())
    .filter(([, agg]) => agg.starredBy.size >= MIN_COUNT)
    .sort(([, a], [, b]) => {
      if (b.starredBy.size !== a.starredBy.size) return b.starredBy.size - a.starredBy.size
      if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore
      return b.stargazersCount - a.stargazersCount
    })
    .slice(0, MAX_ITEMS)

  const items: RawNewsItem[] = qualified.map(([repo, agg]) => {
    const handles = Array.from(agg.starredBy).sort()
    const handlesStr = handles.slice(0, 3).join(', ')
    const leadersPrefix = `Starred by ${handles.length} leaders (${handlesStr})`
    const body = agg.description ? `: ${agg.description}` : ''
    const summary = (leadersPrefix + body).slice(0, SUMMARY_MAX)

    return {
      title: repo,
      url: agg.url,
      summary,
      sourceName: 'Co-Starred',
      sourceType: 'rss',
      publishedAt: agg.latestDate,
    }
  })

  console.log(`[co-starred] ${items.length} items (${repoMap.size} total repos in ${LOOKBACK_DAYS}d window, ≥${MIN_COUNT} leaders)`)
  return items
}
