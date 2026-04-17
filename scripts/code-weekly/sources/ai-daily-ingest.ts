// AI Daily → Code Weekly ingest.
//
// Why this exists: AI Daily (scripts/ai-daily) maintains its own DeepSeek-
// scored item pool with a `focusTopics` taxonomy. The `coding-agents`
// topic covers Cursor/Claude Code/Codex + their ecosystem (MCP servers,
// memory layers, Claude Code skills, etc.) — none of which are reachable
// by Code Weekly's own sources (GitHub Releases for the 10 tracked
// editors + Tavily/Bailian search + company RSS).
//
// Rather than re-run the whole AI Daily pipeline here, we harvest items
// already scored+tagged from the daily digests on disk. This keeps the
// two pipelines loosely coupled (AI Daily can fail without breaking Code
// Weekly) and avoids spending DeepSeek tokens twice.
//
// Data flow:
//   profile-data/ai-daily/YYYY-MM-DD.json
//     → per-day digests; each item has: title, url, summary (translated),
//       score (0..10), focusTopics[], sources[], publishedAt (optional)
//   → filter into the WeekBounds window
//   → keep only items tagged 'coding-agents' with score ≥ MIN_SCORE
//   → dedup by canonicalized URL (strip trailing slash + query-string)
//   → return as EcosystemItem[] sorted by score desc
//
// Contract:
//   - Read-only wrt AI Daily data. Never mutate the digest JSONs.
//   - Fail-soft: a missing or malformed file logs a warning and is skipped.
//   - If profile-data/ai-daily/ doesn't exist at all, returns [].

import fs from 'fs'
import path from 'path'
import type { WeekBounds } from '../config'

export interface EcosystemItem {
  /** Item title, unchanged from AI Daily (often bilingual). */
  title: string
  /** Canonical URL. */
  url: string
  /** Short summary (AI Daily's translated one-liner). */
  summary: string
  /** DeepSeek score, 0..10. */
  score: number
  /** AI Daily source display name (e.g. "GitHub trending", "Pragmatic Engineer"). */
  source: string
  /** Original publish date if AI Daily had one; otherwise the digest date. */
  publishedAt: string
  /** Focus topics other than 'coding-agents' that co-occurred on this item. */
  secondaryTopics: string[]
}

/** Minimum DeepSeek score for an item to cross over. */
const MIN_SCORE = 6.0

/** Maximum number of items surfaced per week; trims noise if a week is unusually full. */
const MAX_ITEMS = 20

interface DigestItem {
  title?: string
  url?: string
  summary?: string
  score?: number
  focusTopics?: unknown
  sources?: Array<{ name?: string }>
  publishedAt?: string
}

interface DigestSection {
  items?: DigestItem[]
}

interface Digest {
  sections?: DigestSection[]
  date?: string
}

function canonicalizeUrl(raw: string): string {
  if (!raw) return ''
  try {
    const u = new URL(raw)
    u.hash = ''
    u.search = ''
    let out = u.toString()
    if (out.endsWith('/')) out = out.slice(0, -1)
    return out
  } catch {
    return raw.trim()
  }
}

/**
 * Resolve the AI Daily digest directory. Supports running from project
 * root OR from website/ (where npx tsx is usually invoked).
 */
function resolveAiDailyDir(projectRoot: string): string | null {
  const candidate = path.join(projectRoot, 'profile-data', 'ai-daily')
  return fs.existsSync(candidate) ? candidate : null
}

/**
 * Enumerate digest files whose filename date falls inside (or one day on
 * either side of) the target week window. We grab one day on either side
 * as cheap insurance against timezone-shift edge cases — the per-item
 * bounds filter downstream will still be exact.
 */
function listCandidateDigestFiles(dir: string, bounds: WeekBounds): string[] {
  const files = fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  const startMs = bounds.start.getTime() - 86_400_000
  const endMs = bounds.end.getTime() + 86_400_000
  return files
    .filter(f => {
      const t = new Date(f.slice(0, 10) + 'T00:00:00Z').getTime()
      return t >= startMs && t < endMs
    })
    .map(f => path.join(dir, f))
    .sort()
}

export interface IngestOptions {
  /** Override MIN_SCORE. */
  minScore?: number
  /** Override MAX_ITEMS. */
  maxItems?: number
  /** Extra URLs to exclude (e.g. ones already in Code Weekly editors/blogs). */
  excludeUrls?: Set<string>
}

export function ingestAiDailyEcosystem(
  projectRoot: string,
  bounds: WeekBounds,
  opts: IngestOptions = {},
): EcosystemItem[] {
  const minScore = opts.minScore ?? MIN_SCORE
  const maxItems = opts.maxItems ?? MAX_ITEMS
  const exclude = opts.excludeUrls ?? new Set<string>()

  const dir = resolveAiDailyDir(projectRoot)
  if (!dir) {
    console.log('[ai-daily-ingest] no AI Daily dir found — skipping ecosystem layer')
    return []
  }

  const files = listCandidateDigestFiles(dir, bounds)
  if (files.length === 0) {
    console.log(`[ai-daily-ingest] no AI Daily digests overlap ${bounds.weekLabel}`)
    return []
  }

  const seen = new Set<string>()
  const collected: EcosystemItem[] = []
  let scanned = 0
  let passedTopic = 0
  let passedScore = 0
  let droppedByBounds = 0
  let droppedByExclude = 0
  let droppedByDedup = 0

  for (const file of files) {
    let digest: Digest
    try {
      digest = JSON.parse(fs.readFileSync(file, 'utf-8')) as Digest
    } catch (err) {
      console.warn(`[ai-daily-ingest] skipping malformed ${path.basename(file)}: ${(err as Error).message}`)
      continue
    }

    const digestDate = digest.date || path.basename(file, '.json')

    for (const section of digest.sections ?? []) {
      for (const item of section.items ?? []) {
        scanned++
        const topics = Array.isArray(item.focusTopics)
          ? item.focusTopics.filter((t): t is string => typeof t === 'string')
          : []
        if (!topics.includes('coding-agents')) continue
        passedTopic++

        const score = typeof item.score === 'number' ? item.score : 0
        if (score < minScore) continue
        passedScore++

        // Strict bounds filter. publishedAt may be missing on items
        // sourced from GitHub trending or social; fall back to the
        // digest date (filename), which is always inside the week
        // plus-or-minus-one-day window we pre-filtered to.
        const rawDate = item.publishedAt && typeof item.publishedAt === 'string'
          ? item.publishedAt
          : digestDate
        const dateMs = new Date(rawDate).getTime()
        const effective = isNaN(dateMs)
          ? new Date(digestDate + 'T12:00:00Z').getTime() // noon UTC ≈ safe mid-day anchor
          : dateMs
        if (effective < bounds.start.getTime() || effective >= bounds.end.getTime()) {
          droppedByBounds++
          continue
        }

        const title = typeof item.title === 'string' ? item.title.trim() : ''
        const url = typeof item.url === 'string' ? canonicalizeUrl(item.url) : ''
        if (!title || !url) continue

        if (exclude.has(url)) {
          droppedByExclude++
          continue
        }
        if (seen.has(url)) {
          droppedByDedup++
          continue
        }
        seen.add(url)

        const summary = typeof item.summary === 'string' ? item.summary.slice(0, 400) : ''
        const source = item.sources?.[0]?.name?.toString() ?? 'AI Daily'
        const secondaryTopics = topics.filter(t => t !== 'coding-agents')

        collected.push({
          title,
          url,
          summary,
          score,
          source,
          publishedAt: rawDate,
          secondaryTopics,
        })
      }
    }
  }

  // Sort by score desc, then by publishedAt desc as tiebreaker
  collected.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  const trimmed = collected.slice(0, maxItems)

  console.log(
    `[ai-daily-ingest] scanned=${scanned} coding-agents-tagged=${passedTopic} ` +
    `scored≥${minScore}=${passedScore} bounds-dropped=${droppedByBounds} ` +
    `exclude-dropped=${droppedByExclude} dedup-dropped=${droppedByDedup} ` +
    `→ kept=${trimmed.length}${collected.length > trimmed.length ? ` (of ${collected.length})` : ''}`
  )

  return trimmed
}
