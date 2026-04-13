// Code Weekly — main entry point
// Orchestrates all data sources, merges results, calls summarizer, writes JSON
import fs from 'fs'
import path from 'path'

// Load .env from project root
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=\s*(.*)$/)
    if (match && !process.env[match[1]]) {
      let value = match[2].trim()
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[match[1]] = value
    }
  }
}

import { EDITORS, CODE_WEEKLY_DIR } from './code-weekly/config'
import { fetchGitHubReleases } from './code-weekly/sources/github-releases'
import { fetchRssFeeds } from './code-weekly/sources/rss-feeds'
import { fetchTavilyForEditors } from './code-weekly/sources/tavily-search'
import { fetchBailianForEditors } from './code-weekly/sources/bailian-search'
import { fetchArenaRankings } from './code-weekly/sources/arena-rankings'
import { fetchAiderLeaderboard } from './code-weekly/sources/aider-leaderboard'
import { summarizeWeekly, collectUrlsFromRaw } from './code-weekly/summarizer'

// ─── ISO Week Helpers ──────────────────────────────────────

function getISOWeek(date: Date): string {
  // MDN-recommended UTC-based algorithm
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

function getWeekDateRange(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (dt: Date) => dt.toISOString().slice(0, 10)
  return `${fmt(monday)} — ${fmt(sunday)}`
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('🚀 Code Weekly — starting data collection...\n')
  // Use yesterday's date to determine the week — the script runs on Monday
  // and should generate the report for the previous week (Mon–Sun).
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const week = getISOWeek(yesterday)
  const dateRange = getWeekDateRange(yesterday)

  console.log(`📅 Week: ${week} (${dateRange})\n`)

  // Build search queries from editor config
  const tavilyEditors = EDITORS
    .filter(e => e.sources.tavilyQuery)
    .map(e => ({ name: e.name, query: e.sources.tavilyQuery! }))

  const bailianEditors = EDITORS
    .filter(e => e.sources.bailianQuery)
    .map(e => ({ name: e.name, query: e.sources.bailianQuery! }))

  // Parallel data collection with Promise.allSettled
  console.log('📡 Fetching from all sources...')
  const [githubResult, rssResult, tavilyResult, bailianResult, arenaResult, aiderResult] = await Promise.allSettled([
    fetchGitHubReleases(),
    fetchRssFeeds(),
    fetchTavilyForEditors(tavilyEditors),
    fetchBailianForEditors(bailianEditors),
    fetchArenaRankings(),
    fetchAiderLeaderboard(),
  ])

  const githubReleases = githubResult.status === 'fulfilled' ? githubResult.value : []
  const rssArticles = rssResult.status === 'fulfilled' ? rssResult.value : []
  const tavilyResults = tavilyResult.status === 'fulfilled' ? tavilyResult.value : []
  const bailianResults = bailianResult.status === 'fulfilled' ? bailianResult.value : []
  const arenaRankings = arenaResult.status === 'fulfilled' ? arenaResult.value : []
  const aiderLeaderboard = aiderResult.status === 'fulfilled' ? aiderResult.value : []

  console.log(`  GitHub Releases: ${githubReleases.length}`)
  console.log(`  RSS Articles: ${rssArticles.length}`)
  console.log(`  Tavily Results: ${tavilyResults.length}`)
  console.log(`  Bailian Results: ${bailianResults.length}`)
  console.log(`  Arena Rankings: ${arenaRankings.length}`)
  console.log(`  Aider Entries: ${aiderLeaderboard.length}`)

  // AI Summarization
  console.log('\n🤖 Summarizing with DeepSeek...')
  const rawData = {
    githubReleases,
    rssArticles,
    tavilyResults,
    bailianResults,
  }
  const summary = await summarizeWeekly(rawData)

  // Post-process: strip fabricated URLs that weren't in raw data
  const { allUrls } = collectUrlsFromRaw(rawData)
  let strippedUrlCount = 0
  for (const editor of summary.editors) {
    if (editor.sourceUrl && !allUrls.has(editor.sourceUrl)) {
      console.warn(`  ⚠️ Stripped fabricated sourceUrl for ${editor.name}: ${editor.sourceUrl}`)
      editor.sourceUrl = ''
      strippedUrlCount++
    }
  }
  for (const blog of summary.blogs) {
    if (blog.url && !allUrls.has(blog.url)) {
      console.warn(`  ⚠️ Stripped fabricated blog url: ${blog.url}`)
      blog.url = ''
      strippedUrlCount++
    }
  }
  if (strippedUrlCount > 0) {
    console.log(`  🧹 Stripped ${strippedUrlCount} fabricated URL(s)`)
  }

  // Build category lookup from config
  const categoryMap = new Map(EDITORS.map(e => [e.name, e.category]))

  // Post-process: merge duplicate editors + fix categories from config
  const editorMap = new Map<string, typeof summary.editors[0]>()
  for (const editor of summary.editors) {
    const existing = editorMap.get(editor.name)
    if (existing) {
      // Merge highlights (deduplicate)
      const allHighlights = [...existing.highlights, ...editor.highlights]
      existing.highlights = [...new Set(allHighlights)]
      // Keep version if set
      if (editor.version && !existing.version) existing.version = editor.version
      // Merge AI summary
      if (editor.aiSummary && !existing.aiSummary) existing.aiSummary = editor.aiSummary
    } else {
      editorMap.set(editor.name, { ...editor })
    }
  }

  // Fix categories from config (DeepSeek may misclassify)
  const mergedEditors = Array.from(editorMap.values()).map(e => ({
    ...e,
    category: categoryMap.get(e.name) || e.category,
  }))

  // Build final output
  const output = {
    week,
    dateRange,
    generatedAt: now.toISOString(),
    editors: mergedEditors,
    benchmarks: {
      arenaRanking: arenaRankings.map((e, i) => ({ ...e, rank: e.rank || i + 1, delta: null })),
      aiderLeaderboard: aiderLeaderboard.map(e => ({ ...e, delta: null })),
      notable: '',
    },
    blogs: summary.blogs,
    weekSummary: summary.weekSummary,
  }

  // Write JSON
  const outDir = path.join(__dirname, '..', CODE_WEEKLY_DIR)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const outPath = path.join(outDir, `${week}.json`)
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\n✅ Written: ${outPath}`)

  // Stats
  console.log(`\n📊 Summary:`)
  console.log(`  Editors tracked: ${output.editors.length}`)
  console.log(`  Blog articles: ${output.blogs.length}`)
  console.log(`  Week summary: ${output.weekSummary.slice(0, 80)}...`)
}

main().catch(err => {
  console.error('❌ Code Weekly failed:', err)
  process.exit(1)
})
