// AI Daily — main pipeline entry point
// Multi-source AI news collection, DeepSeek scoring, DailyDigest output.

import fs from 'fs'
import path from 'path'

// Load .env
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const projectRoot = path.resolve(__dirname, '..', '..')
const envPath = path.join(projectRoot, '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=\s*(.*)$/)
    if (match && !process.env[match[1]]) {
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[match[1]] = value
    }
  }
}

import { AI_DAILY_DIR, getTodayInShanghai } from './config'
import { fetchRssItems } from './sources/rss-feeds'
import { fetchSearchItems } from './sources/search'
import { fetchSocialItems } from './sources/social'
import { fetchHorizonItems } from './sources/hn'
import { fetchGithubTrendingItems } from './sources/github-trending'
import { fetchRedditItems } from './sources/reddit'
import { fetchCoStarredItems } from './sources/stars-co-starred'
import { scoreItems, generateDailyBrief } from './scoring'
import { MetricsCollector, computeOutputStats } from './metrics'
import type { RawNewsItem, ScoredItem, DailyDigest, NewsItem, DigestSection } from './types'

async function main() {
  console.log('📰 AI Daily — starting multi-source collection\n')

  const metrics = new MetricsCollector()

  // ─── Parallel source collection ─────────────────────────
  const [rssResult, searchResult, githubResult, horizonResult, redditResult, coStarredResult] = await Promise.allSettled([
    fetchRssItems(),
    fetchSearchItems(),
    fetchGithubTrendingItems(),
    fetchHorizonItems(projectRoot),
    fetchRedditItems(),
    fetchCoStarredItems(projectRoot),
  ])

  const rssItems = rssResult.status === 'fulfilled' ? rssResult.value : []
  const searchItems = searchResult.status === 'fulfilled' ? searchResult.value : []
  const githubItems = githubResult.status === 'fulfilled' ? githubResult.value : []
  const horizonItems = horizonResult.status === 'fulfilled' ? horizonResult.value : []
  const redditItems = redditResult.status === 'fulfilled' ? redditResult.value : []
  const coStarredItems = coStarredResult.status === 'fulfilled' ? coStarredResult.value : []
  const socialItems = fetchSocialItems(projectRoot)

  if (rssResult.status === 'rejected') console.error('❌ RSS failed:', rssResult.reason)
  if (searchResult.status === 'rejected') console.error('❌ Search failed:', searchResult.reason)
  if (githubResult.status === 'rejected') console.error('❌ GitHub failed:', githubResult.reason)
  if (horizonResult.status === 'rejected') console.error('❌ HN failed:', horizonResult.reason)
  if (redditResult.status === 'rejected') console.error('❌ Reddit failed:', redditResult.reason)
  if (coStarredResult.status === 'rejected') console.error('❌ Co-Starred failed:', coStarredResult.reason)

  const allRaw: RawNewsItem[] = [...rssItems, ...searchItems, ...socialItems, ...horizonItems, ...githubItems, ...redditItems, ...coStarredItems]
  console.log(`\n📊 Raw items: RSS=${rssItems.length} Search=${searchItems.length} Social=${socialItems.length} Horizon=${horizonItems.length} GitHub=${githubItems.length} Reddit=${redditItems.length} CoStarred=${coStarredItems.length} Total=${allRaw.length}`)

  metrics.recordSources({
    rss: rssItems.length,
    search: searchItems.length,
    social: socialItems.length,
    horizon: horizonItems.length,
    github: githubItems.length,
    reddit: redditItems.length,
    coStarred: coStarredItems.length,
  })

  // ─── Deduplication: URL normalization, then title similarity ──
  const dedupedByUrl = deduplicateByUrl(allRaw)
  const deduped = deduplicateBySimilarTitle(dedupedByUrl)
  const urlDropped = allRaw.length - dedupedByUrl.length
  const titleDropped = dedupedByUrl.length - deduped.length
  console.log(`🔗 After dedup: ${deduped.length} unique items (url=${urlDropped} title=${titleDropped} dropped)`)
  metrics.recordDedup({ urlDropped, titleDropped })

  if (deduped.length === 0) {
    console.log('\n⚠️ No items collected, skipping output')
    return
  }

  // ─── DeepSeek unified scoring ───────────────────────────
  const { items: scored, stats, anchors } = await scoreItems(deduped)
  metrics.recordScoring({
    batches: stats.totalLlmBatches,
    failed: stats.failedBatches,
    halveRetries: stats.halveRetries,
    keywordFallback: stats.keywordFallbacks,
    hnWeighted: stats.hnWeighted,
  })
  metrics.recordAnchors({
    loaded: anchors.length,
    bands: anchors.map(a => a.band),
  })

  // Filter out non-AI items
  const filtered = scored.filter(s => s.aiRelevant)
  console.log(`🔍 After AI filter: ${filtered.length}/${scored.length} items`)

  // ─── Generate daily brief ───────────────────────────────
  const dailyBrief = await generateDailyBrief(filtered)
  if (dailyBrief) console.log('🤖 Daily brief generated')

  // ─── Build DailyDigest output ───────────────────────────
  const today = getTodayInShanghai()
  const digest = buildDigest(today, filtered, dailyBrief)

  // ─── Write output ───────────────────────────────────────
  const outputDir = path.join(projectRoot, AI_DAILY_DIR)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, `${today}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(digest, null, 2) + '\n', 'utf-8')

  // ─── Persist run metrics ────────────────────────────────
  // Build per-section scored items for avg/max/count breakdown
  const sectionScored: Record<string, Array<{ score: number }>> = {}
  for (const s of digest.sections) {
    sectionScored[s.id] = s.items.map(i => ({ score: i.score }))
  }
  metrics.finalize(today, computeOutputStats(sectionScored), projectRoot)

  // ─── Summary ────────────────────────────────────────────
  console.log(`\n📊 Summary:`)
  for (const s of digest.sections) {
    console.log(`  ${s.title}: ${s.items.length} items`)
  }
  console.log(`  Total: ${digest.itemCount} items`)
  console.log(`\n📁 Output: ${outputPath}`)
  console.log('\n✅ Done')
}

// ─── Helpers ──────────────────────────────────────────────

function deduplicateByUrl(items: RawNewsItem[]): RawNewsItem[] {
  const seen = new Set<string>()
  const result: RawNewsItem[] = []

  for (const item of items) {
    const key = normalizeUrl(item.url)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Strip query params, hash, trailing slash for dedup
    return `${u.hostname}${u.pathname.replace(/\/$/, '')}`.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

/**
 * Second-pass dedup: same story re-posted on the same outlet (e.g. an
 * RSS update) or covered by a sibling outlet sharing most keywords
 * (e.g. mashable + gizmodo on the same launch). URL-based dedup above
 * misses these because the URLs differ.
 *
 * Two-tier threshold derived from adversarial testing:
 * - Same host  + Jaccard >= 0.55 → dup (same outlet re-posting)
 * - Diff hosts + Jaccard >= 0.60 → dup (cross-outlet transliteration)
 *
 * Why not lower? Cross-outlet same-story pairs cluster at Jaccard 0.50
 * in practice, but so do many unrelated short-title pairs sharing a
 * template (e.g. "AI coding tool X adds agent mode" × 2 different
 * tools). We intentionally accept some same-story leakage to guarantee
 * zero topic-level false positives. Truly similar items will still be
 * neighbors in the sorted section anyway.
 *
 * For higher recall, a future pass could use title embeddings, but
 * that introduces API cost per item.
 *
 * Keeps the first-seen item (source order RSS → Search → Social →
 * Horizon), which is usually the more authoritative feed.
 */
const SAME_HOST_THRESHOLD = 0.55
const CROSS_HOST_THRESHOLD = 0.60
const TITLE_STOPWORDS = new Set<string>([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
  'been', 'to', 'of', 'in', 'on', 'for', 'with', 'by', 'as', 'at', 'from',
  'that', 'this', 'it', 'its', 'how', 'what', 'why', 'when', 'where',
  'new', 'now', 'will', 'can', 'has', 'have', 'had', 'do', 'does', 'did',
])

function tokenizeTitle(title: string): Set<string> {
  const tokens = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')     // keep letters, digits, hyphens
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && !TITLE_STOPWORDS.has(t))
  return new Set(tokens)
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersect = 0
  for (const t of a) if (b.has(t)) intersect += 1
  const union = a.size + b.size - intersect
  return union === 0 ? 0 : intersect / union
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function deduplicateBySimilarTitle(items: RawNewsItem[]): RawNewsItem[] {
  const kept: RawNewsItem[] = []
  const keptTokens: Set<string>[] = []
  const keptHosts: string[] = []
  let droppedExamples = 0

  for (const item of items) {
    const tokens = tokenizeTitle(item.title)
    const host = hostOf(item.url)
    // Very short titles (after stopword removal) can't be reliably matched
    if (tokens.size < 3) {
      kept.push(item)
      keptTokens.push(tokens)
      keptHosts.push(host)
      continue
    }

    let dup = false
    for (let i = 0; i < keptTokens.length; i += 1) {
      const sim = jaccard(tokens, keptTokens[i])
      const threshold = host && host === keptHosts[i]
        ? SAME_HOST_THRESHOLD
        : CROSS_HOST_THRESHOLD
      if (sim >= threshold) {
        if (droppedExamples < 3) {
          console.log(`  [dedup] sim=${sim.toFixed(2)} (thr=${threshold}) dropped "${item.title.slice(0, 60)}" (kept: "${kept[i].title.slice(0, 60)}")`)
          droppedExamples += 1
        }
        dup = true
        break
      }
    }
    if (!dup) {
      kept.push(item)
      keptTokens.push(tokens)
      keptHosts.push(host)
    }
  }

  return kept
}

function buildDigest(date: string, items: ScoredItem[], dailyBrief: string | null): DailyDigest {
  // Map categories to sections
  const sectionMap: Record<string, ScoredItem[]> = {
    headlines: [],
    research: [],
    engineering: [],
  }

  for (const item of items) {
    if (item.category === 'breaking') {
      sectionMap.headlines.push(item)
    } else if (item.category === 'research') {
      sectionMap.research.push(item)
    } else {
      // release + insight → engineering
      sectionMap.engineering.push(item)
    }
  }

  // Sort each section by score desc
  for (const key of Object.keys(sectionMap)) {
    sectionMap[key].sort((a, b) => b.score - a.score)
  }

  const sections: DigestSection[] = [
    { id: 'headlines', title: 'Headlines & Launches', items: sectionMap.headlines.map(toNewsItem) },
    { id: 'research', title: 'Research & Innovation', items: sectionMap.research.map(toNewsItem) },
    { id: 'engineering', title: 'Engineering & Resources', items: sectionMap.engineering.map(toNewsItem) },
  ].filter(s => s.items.length > 0)

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)

  return {
    date,
    itemCount: totalItems,
    sections,
    aiSummary: dailyBrief,
  }
}

function toNewsItem(item: ScoredItem): NewsItem {
  return {
    title: item.title,
    summary: item.oneLiner || item.summary.slice(0, 200),
    url: item.url,
    score: item.score,
    sources: [{ name: item.sourceName }],
    tags: item.tags,
    focusTopics: item.focusTopics,
  }
}

main().catch(err => {
  console.error('❌ AI Daily failed:', err)
  process.exit(1)
})
