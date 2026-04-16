// Spec Tracker — main pipeline entry point
// Fetches GitHub stats, npm downloads, and discovers emerging projects.
// Writes output to profile-data/specs/latest.json + history/YYYY-MM-DD.json

import fs from 'fs'
import path from 'path'

// Load .env
const envPath = path.join(__dirname, '..', '..', '.env')
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

import { FRAMEWORKS, SPECS_DIR, SPECS_HISTORY_DIR } from './config'
import { fetchAllGitHubStats } from './sources/github-stats'
import { fetchAllNpmStats } from './sources/npm-downloads'
import { discoverProjects } from './sources/discovery'
import { computeDeltas, computeWeeklyDiff } from './delta'
import { generateInsights } from './insights'
import type { SpecFramework, SpecSnapshot } from './types'

async function main() {
  console.log('📊 Spec Tracker — starting data collection\n')
  console.log(`📋 Tracking ${FRAMEWORKS.length} frameworks\n`)

  // Parallel fetch all data sources
  const [githubResult, npmResult, discoveryResult] = await Promise.allSettled([
    fetchAllGitHubStats(FRAMEWORKS),
    fetchAllNpmStats(FRAMEWORKS),
    discoverProjects(),
  ])

  const githubStats = githubResult.status === 'fulfilled' ? githubResult.value : new Map()
  const npmStats = npmResult.status === 'fulfilled' ? npmResult.value : new Map()
  const discovered = discoveryResult.status === 'fulfilled' ? discoveryResult.value : []

  if (githubResult.status === 'rejected') {
    console.error('❌ GitHub stats fetch failed:', githubResult.reason)
  }
  if (npmResult.status === 'rejected') {
    console.error('❌ npm stats fetch failed:', npmResult.reason)
  }
  if (discoveryResult.status === 'rejected') {
    console.error('❌ Discovery failed:', discoveryResult.reason)
  }

  // Assemble frameworks
  const frameworks: SpecFramework[] = FRAMEWORKS.map(fw => {
    const github = githubStats.get(fw.id) ?? undefined
    const npm = npmStats.get(fw.id) ?? undefined

    return {
      id: fw.id,
      name: fw.name,
      category: fw.category,
      description: fw.description,
      website: fw.website,
      github: github || undefined,
      npm: npm || undefined,
    }
  })

  const snapshot: SpecSnapshot = {
    updatedAt: new Date().toISOString(),
    frameworks,
    discovered,
  }

  // ─── Delta Calculation ─────────────────────────────────────
  // Read yesterday's history file to compute deltas
  const projectRoot = path.join(__dirname, '..', '..')
  const historyDir = path.join(projectRoot, SPECS_HISTORY_DIR)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const yesterdayPath = path.join(historyDir, `${yesterdayStr}.json`)

  let previousSnapshot: SpecSnapshot | null = null
  if (fs.existsSync(yesterdayPath)) {
    try {
      previousSnapshot = JSON.parse(fs.readFileSync(yesterdayPath, 'utf-8')) as SpecSnapshot
      console.log(`📈 Found yesterday's snapshot: ${yesterdayStr}`)
    } catch (e) {
      console.warn(`⚠️ Could not parse yesterday's snapshot: ${e}`)
    }
  } else {
    console.log('📈 No yesterday snapshot found, deltas will be null')
  }

  const deltas = computeDeltas(snapshot, previousSnapshot)
  const weeklyDiff = computeWeeklyDiff(snapshot, previousSnapshot, deltas)

  snapshot.deltas = deltas
  snapshot.weeklyDiff = weeklyDiff

  // ─── AI Trend Insights ─────────────────────────────────────
  // Call DeepSeek API for trend analysis (fault-tolerant)
  const [insightsResult] = await Promise.allSettled([generateInsights(snapshot)])
  if (insightsResult.status === 'fulfilled' && insightsResult.value) {
    snapshot.insights = insightsResult.value
    console.log('🤖 AI insights generated')
  } else {
    snapshot.insights = null
    if (insightsResult.status === 'rejected') {
      console.warn('⚠️ AI insights failed:', insightsResult.reason)
    } else {
      console.log('🤖 AI insights: none (no API key or empty response)')
    }
  }

  // Write output
  const specsDir = path.join(projectRoot, SPECS_DIR)

  if (!fs.existsSync(specsDir)) {
    fs.mkdirSync(specsDir, { recursive: true })
  }
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true })
  }

  const latestPath = path.join(specsDir, 'latest.json')
  const today = new Date().toISOString().slice(0, 10)
  const historyPath = path.join(historyDir, `${today}.json`)

  const json = JSON.stringify(snapshot, null, 2)
  fs.writeFileSync(latestPath, json, 'utf-8')
  fs.writeFileSync(historyPath, json, 'utf-8')

  // Summary
  console.log('\n📊 Summary:')
  console.log(`  GitHub: ${githubStats.size}/${FRAMEWORKS.filter(f => f.sources.githubRepo).length} repos`)
  console.log(`  npm: ${npmStats.size}/${FRAMEWORKS.filter(f => f.sources.npmPackage).length} packages`)
  console.log(`  Discovered: ${discovered.length} emerging projects`)
  console.log(`\n📁 Output:`)
  console.log(`  ${latestPath}`)
  console.log(`  ${historyPath}`)
  console.log('\n✅ Done')
}

main().catch(err => {
  console.error('❌ Spec Tracker failed:', err)
  process.exit(1)
})
