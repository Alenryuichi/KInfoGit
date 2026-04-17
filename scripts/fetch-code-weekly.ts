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

import { EDITORS, CODE_WEEKLY_DIR, getWeekBoundsInShanghai } from './code-weekly/config'
import { fetchGitHubReleases } from './code-weekly/sources/github-releases'
import { fetchRssFeeds } from './code-weekly/sources/rss-feeds'
import { fetchTavilyForEditors } from './code-weekly/sources/tavily-search'
import { fetchBailianForEditors } from './code-weekly/sources/bailian-search'
import { fetchNpmReleases } from './code-weekly/sources/npm-registry'
import { fetchArenaRankings } from './code-weekly/sources/arena-rankings'
import { fetchAiderLeaderboard } from './code-weekly/sources/aider-leaderboard'
import { fetchSweBench } from './code-weekly/sources/swe-bench'
import { fetchLiveCodeBench } from './code-weekly/sources/livecodebench'
import { fetchChangelogEntries } from './code-weekly/sources/changelog-page'
import { ingestAiDailyEcosystem } from './code-weekly/sources/ai-daily-ingest'
import { summarizeWeekly, collectUrlsFromRaw } from './code-weekly/summarizer'

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('🚀 Code Weekly — starting data collection...\n')
  // Use yesterday's instant as the reference — the cron runs Monday early
  // morning (Asia/Shanghai) and should generate the report for the week
  // that just ended (i.e. yesterday falls into Sun of last week).
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const bounds = getWeekBoundsInShanghai(yesterday)
  const { weekLabel: week, dateRange } = bounds

  console.log(`📅 Week: ${week} (${dateRange})`)
  console.log(`   bounds: [${bounds.start.toISOString()}, ${bounds.end.toISOString()})\n`)

  // Build search queries from editor config
  const tavilyEditors = EDITORS
    .filter(e => e.sources.tavilyQuery)
    .map(e => ({ name: e.name, query: e.sources.tavilyQuery! }))

  const bailianEditors = EDITORS
    .filter(e => e.sources.bailianQuery)
    .map(e => ({ name: e.name, query: e.sources.bailianQuery! }))

  const npmPackages = EDITORS
    .filter(e => e.sources.npmPackage)
    .map(e => ({ editor: e.name, pkg: e.sources.npmPackage! }))

  // Parallel data collection with Promise.allSettled
  console.log('📡 Fetching from all sources...')
  const [githubResult, rssResult, tavilyResult, bailianResult, npmResult, arenaResult, aiderResult, sweResult, lcbResult, changelogResult] = await Promise.allSettled([
    fetchGitHubReleases(bounds),
    fetchRssFeeds(bounds),
    fetchTavilyForEditors(tavilyEditors),
    fetchBailianForEditors(bailianEditors),
    fetchNpmReleases(npmPackages, bounds),
    fetchArenaRankings(),
    fetchAiderLeaderboard(),
    fetchSweBench(),
    fetchLiveCodeBench(),
    fetchChangelogEntries(bounds),
  ])

  const githubReleases = githubResult.status === 'fulfilled' ? githubResult.value : []
  const rssArticles = rssResult.status === 'fulfilled' ? rssResult.value : []
  const tavilyResults = tavilyResult.status === 'fulfilled' ? tavilyResult.value : []
  const bailianResults = bailianResult.status === 'fulfilled' ? bailianResult.value : []
  const npmReleases = npmResult.status === 'fulfilled' ? npmResult.value : []
  const changelogEntries = changelogResult.status === 'fulfilled' ? changelogResult.value : []
  const arenaRankings = arenaResult.status === 'fulfilled' ? arenaResult.value : []
  const aiderLeaderboard = aiderResult.status === 'fulfilled' ? aiderResult.value : []
  const sweBench = sweResult.status === 'fulfilled' ? sweResult.value : []
  const liveCodeBench = lcbResult.status === 'fulfilled' ? lcbResult.value : []

  // Log failures explicitly
  const sources = [
    ['GitHub Releases', githubResult],
    ['RSS', rssResult],
    ['Tavily', tavilyResult],
    ['Bailian', bailianResult],
    ['npm', npmResult],
    ['Changelog', changelogResult],
    ['Arena', arenaResult],
    ['Aider', aiderResult],
    ['SWE-bench', sweResult],
    ['LiveCodeBench', lcbResult],
  ] as const
  let failCount = 0
  for (const [name, result] of sources) {
    if (result.status === 'rejected') {
      console.error(`  ❌ ${name} failed: ${(result.reason as Error)?.message || result.reason}`)
      failCount++
    }
  }
  if (failCount > 0) {
    console.warn(`  ⚠️ ${failCount} source(s) failed`)
  }

  // ─── Defensive re-filter against week bounds ────────────
  // Sources should already filter by bounds internally, but a belt-and-
  // braces pass here guarantees no dated item leaks in (e.g. if an API
  // starts returning timezone-shifted timestamps after a schema change).
  // An item is kept if EITHER:
  //   (a) its publishedAt parses cleanly AND falls inside the window, or
  //   (b) its publishedAt is missing or unparseable.
  // Case (b) is a deliberate choice: Tavily/Bailian search results don't
  // carry reliable dates, and the LLM summarizer is the last line of
  // defense for those. This policy is documented so future-me doesn't
  // mistake the NaN fallthrough for a bug.
  const inBounds = (iso: string | undefined | null): boolean => {
    if (!iso) return true                           // no date → allow (see policy above)
    const t = Date.parse(iso)
    if (isNaN(t)) return true                       // unparseable → allow
    return t >= bounds.start.getTime() && t < bounds.end.getTime()
  }
  const leakFilter = <T extends { publishedAt?: string }>(arr: T[], label: string): T[] => {
    const kept: T[] = []
    let dropped = 0
    for (const item of arr) {
      if (inBounds(item.publishedAt)) kept.push(item)
      else dropped++
    }
    if (dropped > 0) {
      console.warn(`  🔒 ${label}: dropped ${dropped} out-of-bounds item(s) at second-pass filter`)
    }
    return kept
  }

  const boundedGithubReleases = leakFilter(githubReleases, 'github-releases')
  const boundedRssArticles = leakFilter(rssArticles, 'rss-feeds')
  const boundedNpmReleases = leakFilter(npmReleases, 'npm-registry')
  const boundedChangelogEntries = leakFilter(changelogEntries, 'changelog')

  console.log(`  GitHub Releases: ${boundedGithubReleases.length}`)
  console.log(`  RSS Articles: ${boundedRssArticles.length}`)
  console.log(`  Tavily Results: ${tavilyResults.length}`)
  console.log(`  Bailian Results: ${bailianResults.length}`)
  console.log(`  npm Releases: ${boundedNpmReleases.length}`)
  console.log(`  Changelog Entries: ${boundedChangelogEntries.length}`)
  console.log(`  Arena Rankings: ${arenaRankings.length}`)
  console.log(`  Aider Entries: ${aiderLeaderboard.length}`)
  console.log(`  SWE-bench: ${sweBench.length}`)
  console.log(`  LiveCodeBench: ${liveCodeBench.length}`)

  // AI Summarization
  console.log('\n🤖 Summarizing with DeepSeek...')
  const rawData = {
    githubReleases: boundedGithubReleases,
    rssArticles: boundedRssArticles,
    tavilyResults,
    bailianResults,
    npmReleases: boundedNpmReleases,
    changelogEntries: boundedChangelogEntries,
  }
  const summary = await summarizeWeekly(rawData)

  // Normalize publishedAt on LLM-shaped blog entries. DeepSeek often
  // rewrites our ISO dates into bare "YYYY-MM-DD" or other formats when
  // transcribing them — harmless for humans, but callers downstream
  // (frontend sorting, staleness calc) expect full ISO 8601. Date.parse
  // accepts both, so this is a one-liner. Unparseable strings are left
  // alone to preserve the LLM's original output (better than silently
  // emptying them).
  for (const blog of summary.blogs) {
    if (!blog.publishedAt) continue
    const t = Date.parse(blog.publishedAt)
    if (!isNaN(t)) blog.publishedAt = new Date(t).toISOString()
  }

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

  // ─── Ecosystem layer: AI Daily coding-agents cross-over ─
  // Harvest high-signal `coding-agents` items from AI Daily digests
  // that already ran this week. The dedup set is seeded with every URL
  // we're already surfacing (editor sourceUrl + blog url) so we never
  // repeat an item the user just read three cards up.
  const projectRoot = path.join(__dirname, '..')
  const usedUrls = new Set<string>()
  for (const e of mergedEditors) {
    if (e.sourceUrl) usedUrls.add(e.sourceUrl)
  }
  for (const b of summary.blogs) {
    if (b.url) usedUrls.add(b.url)
  }
  // ingestAiDailyEcosystem is sync + fail-soft → safe to call unconditionally
  const ecosystem = ingestAiDailyEcosystem(projectRoot, bounds, { excludeUrls: usedUrls })

  // Build final output
  const output = {
    week,
    dateRange,
    generatedAt: now.toISOString(),
    editors: mergedEditors,
    benchmarks: {
      arenaRanking: arenaRankings.map((e, i) => ({ ...e, rank: e.rank || i + 1, delta: null })),
      aiderLeaderboard: aiderLeaderboard.map(e => ({ ...e, delta: null })),
      sweBench: sweBench.length > 0 ? sweBench : undefined,
      liveCodeBench: liveCodeBench.length > 0 ? liveCodeBench : undefined,
      notable: '',
    },
    blogs: summary.blogs,
    ecosystem,
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
  console.log(`  Ecosystem items (AI Daily cross-over): ${output.ecosystem.length}`)
  console.log(`  Week summary: ${output.weekSummary.slice(0, 80)}...`)
}

main().catch(err => {
  console.error('❌ Code Weekly failed:', err)
  process.exit(1)
})
