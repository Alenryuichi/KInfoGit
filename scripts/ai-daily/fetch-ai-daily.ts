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

  // ─── Deduplication by URL ───────────────────────────────
  const deduped = deduplicateByUrl(allRaw)
  console.log(`🔗 After dedup: ${deduped.length} unique items`)

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
    tags: [],
    focusTopics: [],
  }
}

main().catch(err => {
  console.error('❌ AI Daily failed:', err)
  process.exit(1)
})
