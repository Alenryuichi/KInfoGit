// AI Daily — HN source
//
// Primary path: HN Algolia `front_page` API (live, ~30 items, no quota).
//   https://hn.algolia.com/api/v1/search?tags=front_page
//
// Fallback path: legacy Horizon markdown digest at
//   tools/horizon/repo/data/summaries/horizon-YYYY-MM-DD-en.md
// kept for resilience when HN API is unreachable.
//
// Emits RawNewsItem with sourceType='horizon' so downstream scoring,
// metrics (`sources.horizon`), and `/ai-daily/metrics` dashboard labels
// stay compatible with existing history. sourceName encodes the HN
// upvote count for readability, e.g. "HN (342)".

import fs from 'fs'
import path from 'path'
import { getTodayInShanghai } from '../config'
import type { RawNewsItem } from '../types'

const HN_FRONT_PAGE_URL = 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30'
const HN_FETCH_TIMEOUT_MS = 10_000
const HN_POINTS_SATURATION = 500     // points at which priorScore saturates to 1.0

interface AlgoliaHit {
  objectID: string
  title: string | null
  url: string | null
  story_text?: string | null
  points: number | null
  num_comments: number | null
  created_at: string | null
  author?: string
}

/**
 * Main entry. Try HN Algolia first; fall back to legacy Horizon markdown
 * if the API fails or returns an empty payload.
 */
export async function fetchHorizonItems(projectRoot: string): Promise<RawNewsItem[]> {
  const viaApi = await fetchFromAlgolia()
  if (viaApi.length > 0) {
    console.log(`[hn] ${viaApi.length} items from Algolia front_page`)
    return viaApi
  }

  console.warn('[hn] Algolia returned 0 items, falling back to Horizon markdown')
  const viaMarkdown = fetchFromMarkdown(projectRoot)
  if (viaMarkdown.length > 0) {
    console.log(`[hn] ${viaMarkdown.length} items from Horizon markdown fallback`)
  }
  return viaMarkdown
}

// ─── Primary: Algolia front_page ─────────────────────────────

async function fetchFromAlgolia(): Promise<RawNewsItem[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), HN_FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(HN_FRONT_PAGE_URL, {
      headers: { 'User-Agent': 'kinfogit-ai-daily/1.0' },
      signal: controller.signal,
    })
    if (!res.ok) {
      console.warn(`[hn] Algolia HTTP ${res.status}`)
      return []
    }
    const json = await res.json() as { hits?: AlgoliaHit[] }
    const hits = Array.isArray(json.hits) ? json.hits : []

    const items: RawNewsItem[] = []
    for (const hit of hits) {
      const title = (hit.title || '').trim()
      // `url` is null for Ask/Show/Job HN self-posts; build a canonical
      // item link in that case so downstream dedup still gets a URL.
      const url = (hit.url && hit.url.trim()) || `https://news.ycombinator.com/item?id=${hit.objectID}`
      if (!title || !url) continue

      const points = typeof hit.points === 'number' && hit.points >= 0 ? hit.points : 0
      const prior = Math.max(0, Math.min(1, points / HN_POINTS_SATURATION))

      items.push({
        title,
        url,
        summary: (hit.story_text || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 500),
        sourceName: `HN (${points})`,
        sourceType: 'horizon',
        publishedAt: hit.created_at || new Date().toISOString(),
        priorScore: prior,
      })
    }
    return items
  } catch (err) {
    console.warn('[hn] Algolia fetch failed:', err instanceof Error ? err.message : err)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Fallback: Horizon markdown ──────────────────────────────

function fetchFromMarkdown(projectRoot: string): RawNewsItem[] {
  const today = getTodayInShanghai()
  const summariesDir = path.join(projectRoot, 'tools', 'horizon', 'repo', 'data', 'summaries')
  const filePath = path.join(summariesDir, `horizon-${today}-en.md`)

  if (!fs.existsSync(filePath)) {
    console.log(`[hn] No Horizon markdown for ${today}`)
    return []
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return parseHorizonMarkdown(content)
  } catch (err) {
    console.warn('[hn] Failed to parse Horizon markdown:', err)
    return []
  }
}

function parseHorizonMarkdown(content: string): RawNewsItem[] {
  const lines = content.split('\n')
  const itemRegex = /^## \[(.+?)\]\((.+?)\)\s*⭐️\s*([\d.]+)\/10/
  const items: RawNewsItem[] = []

  let currentTitle = ''
  let currentUrl = ''
  let currentScore = 0
  let summaryLines: string[] = []

  function flushItem() {
    if (currentTitle && currentUrl) {
      const prior = Math.max(0, Math.min(1, currentScore / 10))
      items.push({
        title: currentTitle,
        url: currentUrl,
        summary: summaryLines.join(' ').trim().slice(0, 500),
        sourceName: `HN (${currentScore.toFixed(1)})`,
        sourceType: 'horizon',
        publishedAt: new Date().toISOString(),
        priorScore: prior,
      })
    }
    currentTitle = ''
    currentUrl = ''
    currentScore = 0
    summaryLines = []
  }

  for (const line of lines) {
    const match = line.match(itemRegex)
    if (match) {
      flushItem()
      currentTitle = match[1]
      currentUrl = match[2]
      currentScore = parseFloat(match[3])
      continue
    }

    if (!currentTitle) continue

    if (line.startsWith('**Tags**:') || line.startsWith('**Background**:') ||
        line.startsWith('**Discussion**:') || line.startsWith('<') ||
        line === '---' || /^\d+\.\s*\[/.test(line) || line.startsWith('> ')) {
      continue
    }

    if (/^\w+\s*·\s*.+$/.test(line) && !line.startsWith('**')) continue

    if (line.trim()) {
      summaryLines.push(line.trim())
    }
  }

  flushItem()
  return items
}
