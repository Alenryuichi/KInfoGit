// AI Daily — metrics loader for the dashboard page
//
// Reads profile-data/ai-daily/_meta/*.json files (monthly arrays of run
// records) and flattens them into a single chronologically-ordered list
// for rendering. Never throws; missing or corrupt files are skipped.

import fs from 'fs'
import path from 'path'
import { resolveProfileDataPath } from './profile-data-paths'

// Controlled vocabulary — must stay in sync with scripts/ai-daily/config.ts
// FOCUS_TOPICS. Duplicated here rather than imported to keep the website/
// package build self-contained (no dependency on ../scripts/*).
//
// TOPIC_VOCAB = active anchors that new digests can still be tagged with.
// LEGACY_TOPIC_VOCAB = retired anchors kept so historical digests still
//   render, and so the Topic Health dashboard can show their decay curve.
export const TOPIC_VOCAB = [
  'coding-agents', 'context-engineering', 'agent-harness',
  'planning', 'tool-use', 'post-training',
  'model-release', 'evals',
] as const
export const LEGACY_TOPIC_VOCAB = [
  'memory', 'self-evolution', 'multi-agent', 'reflection',
] as const
export type TopicName = typeof TOPIC_VOCAB[number]
export type LegacyTopicName = typeof LEGACY_TOPIC_VOCAB[number]

// Topic Discovery — hardcoded blacklist of entity tags.
//
// Companies / products / model brands should NEVER be promoted into
// focusTopics because focusTopics anchor *themes* ("coding-agents",
// "tool-use"), not entities. A lab shipping a feature is caused by a
// theme, not a theme itself. This list is small and visible; extend
// it in-place when a new vendor blows up. If it grows past ~30 entries
// we'll factor it out into its own file.
export const ENTITY_TAG_BLACKLIST = new Set<string>([
  // AI labs / model orgs
  'openai', 'anthropic', 'google', 'deepmind', 'meta',
  'microsoft', 'xai', 'mistral', 'cohere', 'databricks',
  // products / tools (nouns, not themes)
  'claude', 'chatgpt', 'gemini', 'grok', 'cursor',
  'copilot', 'claude-code', 'windsurf', 'aider',
  // orgs / non-AI companies that appear a lot but aren't topics
  'spacex', 'nvidia', 'apple', 'amazon',
])

// NOTE: schema kept loose (all fields optional) so a legacy record
// missing a newer field doesn't blow up rendering.
export interface RunRecord {
  date: string
  timestamp?: string
  durationMs?: number
  sources?: {
    rss?: number
    search?: number
    social?: number
    horizon?: number
    github?: number
  }
  dedup?: {
    urlDropped?: number
    titleDropped?: number
  }
  scoring?: {
    batches?: number
    failed?: number
    halveRetries?: number
    keywordFallback?: number
    hnWeighted?: number
  }
  anchors?: {
    loaded?: number
    bands?: string[]
  }
  output?: {
    itemCount?: number
    avgScore?: number
    maxScore?: number
    sectionCounts?: Record<string, number>
  }
}

function getMetaDir(): string {
  return resolveProfileDataPath('ai-daily', '_meta')
}

/**
 * Load all run records across all monthly files, sorted by date ASC.
 * Returns [] if the _meta directory doesn't exist yet (cold repo).
 */
export function getAllRunRecords(): RunRecord[] {
  const dir = getMetaDir()
  if (!fs.existsSync(dir)) return []

  let files: string[] = []
  try {
    files = fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}\.json$/.test(f))
      .sort()
  } catch {
    return []
  }

  const records: RunRecord[] = []
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        for (const r of parsed) {
          if (r && typeof r === 'object' && typeof r.date === 'string') {
            records.push(r as RunRecord)
          }
        }
      }
    } catch {
      continue
    }
  }

  records.sort((a, b) => a.date.localeCompare(b.date))
  return records
}

export interface MetricsKpis {
  /** Number of runs in the last 7 days (including today). */
  recentRuns: number
  /** Average item count across recent runs. */
  avgItemCount: number
  /** Total failed batches across recent runs. */
  totalFailedBatches: number
  /** Total halve-retries across recent runs. */
  totalHalveRetries: number
  /** Average avgScore across recent runs. */
  avgScore: number
  /** Total keyword fallbacks (bad signal — LLM went down). */
  totalKeywordFallbacks: number
}

/** Compute headline KPIs from the last N records. */
export function computeKpis(records: RunRecord[], windowSize = 7): MetricsKpis {
  const recent = records.slice(-windowSize)
  if (recent.length === 0) {
    return {
      recentRuns: 0, avgItemCount: 0, totalFailedBatches: 0,
      totalHalveRetries: 0, avgScore: 0, totalKeywordFallbacks: 0,
    }
  }
  let sumItems = 0
  let sumScore = 0
  let failedSum = 0
  let halveSum = 0
  let fallbackSum = 0
  for (const r of recent) {
    sumItems += r.output?.itemCount ?? 0
    sumScore += r.output?.avgScore ?? 0
    failedSum += r.scoring?.failed ?? 0
    halveSum += r.scoring?.halveRetries ?? 0
    fallbackSum += r.scoring?.keywordFallback ?? 0
  }
  return {
    recentRuns: recent.length,
    avgItemCount: Math.round((sumItems / recent.length) * 10) / 10,
    totalFailedBatches: failedSum,
    totalHalveRetries: halveSum,
    avgScore: Math.round((sumScore / recent.length) * 10) / 10,
    totalKeywordFallbacks: fallbackSum,
  }
}

export interface AnomalyAlert {
  date: string
  reason: string
}

/** Flag runs with suspicious metrics for the alerts panel. */
export function findAnomalies(records: RunRecord[]): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = []
  for (const r of records) {
    const reasons: string[] = []
    if ((r.output?.itemCount ?? 0) < 10) reasons.push(`low item count (${r.output?.itemCount ?? 0})`)
    if ((r.scoring?.failed ?? 0) >= 3) reasons.push(`${r.scoring?.failed} failed batches`)
    if ((r.scoring?.keywordFallback ?? 0) >= 5) reasons.push(`${r.scoring?.keywordFallback} keyword fallbacks`)
    if ((r.sources?.rss ?? 0) === 0 && (r.sources?.search ?? 0) === 0) {
      // Intentionally only check rss + search here — they're the broad
      // cross-domain sources. github/horizon are narrow vertical feeds
      // that can legitimately be 0 on a slow day (e.g. holidays) without
      // indicating a pipeline problem.
      reasons.push('no RSS or search items')
    }
    if (reasons.length > 0) {
      alerts.push({ date: r.date, reason: reasons.join(', ') })
    }
  }
  // Most recent first, cap at 10
  return alerts.reverse().slice(0, 10)
}

// ─── Topic Health ─────────────────────────────────────────
//
// Scans per-day digest JSONs (not the _meta runs log) because focusTopics
// live inside each NewsItem. For each topic in TOPIC_VOCAB, counts how
// many items mentioned it in the last N days and surfaces a few recent
// examples so the reader can sanity-check whether the topic is still
// semantically alive or dead.
//
// This is READ-ONLY: it does not mutate the vocabulary, retag items, or
// propose changes. That's Step 2 once you've decided what to keep.

export interface TopicExample {
  date: string
  title: string
  score: number
}

export interface TopicHealthRow {
  topic: string
  hits7d: number
  hits14d: number
  hits30d: number
  totalHits: number
  /** Fraction of days in the last 30d window that had at least one hit. */
  coverage30d: number
  /** up to 3 recent example items, newest first. */
  recentExamples: TopicExample[]
  /** Heuristic classification for the UI. */
  status: 'healthy' | 'watch' | 'stale' | 'dead' | 'legacy'
  /** True if the topic is a retired v1 anchor (not currently tagged). */
  isLegacy: boolean
}

function getDigestDir(): string {
  return resolveProfileDataPath('ai-daily')
}

interface RawDigestItem {
  title?: string
  score?: number
  focusTopics?: unknown
}

interface RawDigestFile {
  date?: string
  sections?: Array<{ items?: RawDigestItem[] }>
}

/**
 * Return YYYY-MM-DD strings for the last `days` calendar days ending today
 * (inclusive), in Asia/Shanghai to match the pipeline's date key.
 */
function recentDateKeys(days: number): Set<string> {
  const keys = new Set<string>()
  const now = new Date()
  for (let i = 0; i < days; i += 1) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
    keys.add(key)
  }
  return keys
}

/**
 * For each topic (active + legacy), count occurrences in the per-day
 * digest files over 7/14/30-day rolling windows, collect up to 3 recent
 * examples, and classify the topic's status:
 *
 *   active topic (v2 anchors):
 *     dead    — 0 hits in 30d
 *     stale   — <3 hits in 30d   (candidate for retirement/renaming)
 *     watch   — <6 hits in 30d
 *     healthy — >=6 hits in 30d
 *   legacy topic (v1 retired anchors): always status='legacy', kept so
 *     the user can watch the crossover as old tags drain from the feed.
 *
 * Rows are sorted active-first (healthy → watch → stale → dead), then
 * legacy topics at the bottom (newest hits first inside each group).
 */
export function computeTopicHealth(): TopicHealthRow[] {
  const dir = getDigestDir()
  const allTopics: readonly string[] = [...TOPIC_VOCAB, ...LEGACY_TOPIC_VOCAB]
  const legacySet = new Set<string>(LEGACY_TOPIC_VOCAB)

  if (!fs.existsSync(dir)) {
    return allTopics.map(topic => emptyRow(topic, legacySet.has(topic)))
  }

  const keys7 = recentDateKeys(7)
  const keys14 = recentDateKeys(14)
  const keys30 = recentDateKeys(30)

  const perTopicHits: Record<string, { d7: number; d14: number; d30: number; daysSeen: Set<string> }> = {}
  const perTopicExamples: Record<string, TopicExample[]> = {}
  for (const t of allTopics) {
    perTopicHits[t] = { d7: 0, d14: 0, d30: 0, daysSeen: new Set() }
    perTopicExamples[t] = []
  }

  let files: string[] = []
  try {
    files = fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  } catch {
    return allTopics.map(topic => emptyRow(topic, legacySet.has(topic)))
  }

  // Read newest-first so example arrays naturally end up newest-first
  files.sort().reverse()

  for (const file of files) {
    const date = file.replace(/\.json$/, '')
    if (!keys30.has(date)) continue  // older than 30d → skip entirely

    let digest: RawDigestFile
    try {
      digest = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as RawDigestFile
    } catch {
      continue
    }

    for (const section of digest.sections ?? []) {
      for (const item of section.items ?? []) {
        const topics = Array.isArray(item.focusTopics) ? item.focusTopics : []
        for (const rawT of topics) {
          if (typeof rawT !== 'string') continue
          const t = rawT.toLowerCase()
          if (!perTopicHits[t]) continue  // unknown topic (future-proof)

          const bucket = perTopicHits[t]
          if (keys7.has(date)) bucket.d7 += 1
          if (keys14.has(date)) bucket.d14 += 1
          bucket.d30 += 1
          bucket.daysSeen.add(date)

          const examples = perTopicExamples[t]
          if (examples.length < 3) {
            examples.push({
              date,
              title: typeof item.title === 'string' ? item.title : '',
              score: typeof item.score === 'number' ? item.score : 0,
            })
          }
        }
      }
    }
  }

  const rows: TopicHealthRow[] = allTopics.map(topic => {
    const h = perTopicHits[topic]
    const isLegacy = legacySet.has(topic)
    const coverage = h.daysSeen.size / 30
    let status: TopicHealthRow['status']
    if (isLegacy) {
      status = 'legacy'
    } else if (h.d30 === 0) status = 'dead'
    else if (h.d30 < 3) status = 'stale'
    else if (h.d30 < 6) status = 'watch'
    else status = 'healthy'
    return {
      topic,
      hits7d: h.d7,
      hits14d: h.d14,
      hits30d: h.d30,
      totalHits: h.d30,
      coverage30d: Math.round(coverage * 100) / 100,
      recentExamples: perTopicExamples[topic],
      status,
      isLegacy,
    }
  })

  // Sort: healthy → watch → stale → dead → legacy; within tier, hits30d DESC
  const tierOrder = { healthy: 0, watch: 1, stale: 2, dead: 3, legacy: 4 }
  rows.sort((a, b) => {
    const t = tierOrder[a.status] - tierOrder[b.status]
    if (t !== 0) return t
    return b.hits30d - a.hits30d
  })
  return rows
}

function emptyRow(topic: string, isLegacy: boolean): TopicHealthRow {
  return {
    topic, hits7d: 0, hits14d: 0, hits30d: 0, totalHits: 0,
    coverage30d: 0, recentExamples: [],
    status: isLegacy ? 'legacy' : 'dead',
    isLegacy,
  }
}

// ─── Topic Discovery (v3) ─────────────────────────────────
//
// Reverse direction of Topic Health:
//   - Topic Health:    "are our controlled-vocab anchors still firing?"
//   - Topic Discovery: "which free-form tags are rising past the vocab?"
//
// Scans `item.tags[]` (the LLM-generated free annotation) — NOT
// `item.focusTopics[]` (the controlled vocabulary, already covered by
// Topic Health). Filters out vocab anchors and a hardcoded entity
// blacklist, then classifies each surviving tag into one of three
// buckets so an editor can scan at a weekly cadence and decide whether
// to promote anything into FOCUS_TOPICS.
//
// This is READ-ONLY and human-facing. It does NOT mutate vocab, does
// NOT open PRs, does NOT persist discovery state across runs. The 7/14/30
// hit counts already encode acceleration; week-over-week diff would
// require snapshotting and isn't worth it for a human-in-the-loop panel.

export interface TopicCandidate {
  tag: string
  hits7d: number
  hits14d: number
  hits30d: number
  /** Fraction of days in the last 30d window that had at least one hit. */
  coverage30d: number
  classification: 'rising' | 'persistent' | 'sporadic'
  /** up to 3 recent example items, newest first. */
  recentExamples: TopicExample[]
}

export interface TopicDiscoveryResult {
  /** Tags hot in the last week relative to 30d total — promote candidates. */
  rising: TopicCandidate[]
  /** Tags steady over 30d with broad day coverage — strong real themes. */
  persistent: TopicCandidate[]
  /** Tags with some frequency (>=3) that fit neither rising nor persistent. */
  sporadic: TopicCandidate[]
}

/** Max entries shown per bucket — the long tail is noise. */
const DISCOVERY_BUCKET_CAP = 10

/** Minimum total hits required to even appear in the dashboard. */
const DISCOVERY_MIN_HITS_30D = 3

/**
 * Scan 30 days of per-day digest files for free-form tag frequencies,
 * filter out controlled vocabulary and entity names, and classify the
 * survivors into rising / persistent / sporadic buckets.
 *
 * Runs only at build time. Returns a fully-serializable result safe to
 * pass to a Next.js page via getStaticProps.
 */
export function computeTopicDiscovery(): TopicDiscoveryResult {
  const emptyResult: TopicDiscoveryResult = { rising: [], persistent: [], sporadic: [] }

  const dir = getDigestDir()
  if (!fs.existsSync(dir)) return emptyResult

  const keys7 = recentDateKeys(7)
  const keys14 = recentDateKeys(14)
  const keys30 = recentDateKeys(30)

  const vocabSet = new Set<string>([...TOPIC_VOCAB, ...LEGACY_TOPIC_VOCAB])

  // Per-tag counters. We also track a Set of dates for coverage30d.
  const hits: Record<string, { d7: number; d14: number; d30: number; daysSeen: Set<string> }> = {}
  const examples: Record<string, TopicExample[]> = {}

  let files: string[] = []
  try {
    files = fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  } catch {
    return emptyResult
  }

  // Read newest-first so example arrays end up newest-first naturally.
  files.sort().reverse()

  for (const file of files) {
    const date = file.replace(/\.json$/, '')
    if (!keys30.has(date)) continue

    let digest: RawDigestFile
    try {
      digest = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as RawDigestFile
    } catch {
      continue
    }

    for (const section of digest.sections ?? []) {
      for (const item of section.items ?? []) {
        // Free-form tags live under `tags`, not `focusTopics`. The raw
        // schema in RawDigestItem only declared focusTopics — access
        // `.tags` via an untyped lookup to keep backwards compat with
        // older files that might omit it.
        const rawTags = (item as { tags?: unknown }).tags
        if (!Array.isArray(rawTags)) continue

        for (const rawT of rawTags) {
          if (typeof rawT !== 'string') continue
          // Normalize: lowercase, trim, and collapse internal whitespace
          // into dashes so "machine learning" and "machine-learning"
          // merge into a single candidate. The LLM is inconsistent about
          // this even within the same digest; we pay the merge cost once
          // here rather than forcing the prompt to enforce it.
          const tag = rawT.toLowerCase().trim().replace(/\s+/g, '-')
          if (!tag) continue
          if (vocabSet.has(tag)) continue
          if (ENTITY_TAG_BLACKLIST.has(tag)) continue

          if (!hits[tag]) {
            hits[tag] = { d7: 0, d14: 0, d30: 0, daysSeen: new Set() }
            examples[tag] = []
          }
          const bucket = hits[tag]
          if (keys7.has(date)) bucket.d7 += 1
          if (keys14.has(date)) bucket.d14 += 1
          bucket.d30 += 1
          bucket.daysSeen.add(date)

          const exArr = examples[tag]
          if (exArr.length < 3) {
            exArr.push({
              date,
              title: typeof item.title === 'string' ? item.title : '',
              score: typeof item.score === 'number' ? item.score : 0,
            })
          }
        }
      }
    }
  }

  // Build candidate list for every tag meeting minimum threshold.
  const candidates: TopicCandidate[] = []
  for (const [tag, h] of Object.entries(hits)) {
    if (h.d30 < DISCOVERY_MIN_HITS_30D) continue

    const coverage30d = Math.round((h.daysSeen.size / 30) * 100) / 100

    // Classification order matters: rising wins over persistent when both
    // would fire (rare — requires heavy recent week AND broad coverage).
    let classification: TopicCandidate['classification']
    if (h.d7 >= 5 && h.d7 >= h.d30 * 0.4) {
      classification = 'rising'
    } else if (h.d30 >= 10 && coverage30d >= 0.3) {
      classification = 'persistent'
    } else {
      classification = 'sporadic'
    }

    candidates.push({
      tag,
      hits7d: h.d7,
      hits14d: h.d14,
      hits30d: h.d30,
      coverage30d,
      classification,
      recentExamples: examples[tag],
    })
  }

  // Split by bucket, sort each by hits30d DESC, cap at DISCOVERY_BUCKET_CAP.
  const cmpHits30 = (a: TopicCandidate, b: TopicCandidate) => b.hits30d - a.hits30d
  const rising = candidates
    .filter(c => c.classification === 'rising')
    .sort(cmpHits30)
    .slice(0, DISCOVERY_BUCKET_CAP)
  const persistent = candidates
    .filter(c => c.classification === 'persistent')
    .sort(cmpHits30)
    .slice(0, DISCOVERY_BUCKET_CAP)
  const sporadic = candidates
    .filter(c => c.classification === 'sporadic')
    .sort(cmpHits30)
    .slice(0, DISCOVERY_BUCKET_CAP)

  return { rising, persistent, sporadic }
}
