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
import { fetchHorizonItems } from './sources/horizon'
import { scoreItems, generateDailyBrief } from './scoring'
import type { RawNewsItem, ScoredItem, DailyDigest, NewsItem, DigestSection } from './types'

async function main() {
  console.log('📰 AI Daily — starting multi-source collection\n')

  // ─── Parallel source collection ─────────────────────────
  const [rssResult, searchResult] = await Promise.allSettled([
    fetchRssItems(),
    fetchSearchItems(),
  ])

  const rssItems = rssResult.status === 'fulfilled' ? rssResult.value : []
  const searchItems = searchResult.status === 'fulfilled' ? searchResult.value : []
  const socialItems = fetchSocialItems(projectRoot)
  const horizonItems = fetchHorizonItems(projectRoot)

  if (rssResult.status === 'rejected') console.error('❌ RSS failed:', rssResult.reason)
  if (searchResult.status === 'rejected') console.error('❌ Search failed:', searchResult.reason)

  const allRaw: RawNewsItem[] = [...rssItems, ...searchItems, ...socialItems, ...horizonItems]
  console.log(`\n📊 Raw items: RSS=${rssItems.length} Search=${searchItems.length} Social=${socialItems.length} Horizon=${horizonItems.length} Total=${allRaw.length}`)

  // ─── Deduplication: URL normalization, then title similarity ──
  const dedupedByUrl = deduplicateByUrl(allRaw)
  const deduped = deduplicateBySimilarTitle(dedupedByUrl)
  const urlDropped = allRaw.length - dedupedByUrl.length
  const titleDropped = dedupedByUrl.length - deduped.length
  console.log(`🔗 After dedup: ${deduped.length} unique items (url=${urlDropped} title=${titleDropped} dropped)`)

  if (deduped.length === 0) {
    console.log('\n⚠️ No items collected, skipping output')
    return
  }

  // ─── DeepSeek unified scoring ───────────────────────────
  const scored = await scoreItems(deduped)

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
 * Second-pass dedup: same story reported by different outlets (e.g.
 * "Claude Opus 4.7 launched" on mashable.com and gizmodo.com) share a
 * normalized title token set but have different URLs, so the URL-based
 * pass above misses them. We compute Jaccard similarity on the bag of
 * normalized content words and drop later items whose similarity to
 * any kept item exceeds JACCARD_THRESHOLD.
 *
 * Keeps the first-seen item (source order = RSS → Search → Social →
 * Horizon), which is usually the more authoritative feed.
 */
const JACCARD_THRESHOLD = 0.7
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

function deduplicateBySimilarTitle(items: RawNewsItem[]): RawNewsItem[] {
  const kept: RawNewsItem[] = []
  const keptTokens: Set<string>[] = []
  let droppedExamples = 0

  for (const item of items) {
    const tokens = tokenizeTitle(item.title)
    // Very short titles (after stopword removal) can't be reliably matched
    if (tokens.size < 3) {
      kept.push(item)
      keptTokens.push(tokens)
      continue
    }

    let dup = false
    for (let i = 0; i < keptTokens.length; i += 1) {
      const sim = jaccard(tokens, keptTokens[i])
      if (sim >= JACCARD_THRESHOLD) {
        if (droppedExamples < 3) {
          console.log(`  [dedup] sim=${sim.toFixed(2)} dropped "${item.title.slice(0, 60)}" (kept: "${kept[i].title.slice(0, 60)}")`)
          droppedExamples += 1
        }
        dup = true
        break
      }
    }
    if (!dup) {
      kept.push(item)
      keptTokens.push(tokens)
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
