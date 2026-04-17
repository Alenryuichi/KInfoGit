// AI Daily — metrics loader for the dashboard page
//
// Reads profile-data/ai-daily/_meta/*.json files (monthly arrays of run
// records) and flattens them into a single chronologically-ordered list
// for rendering. Never throws; missing or corrupt files are skipped.

import fs from 'fs'
import path from 'path'

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
  // Match the double-path fallback from lib/ai-daily.ts to handle both
  // dev (cwd=website/) and build contexts (cwd=repo root).
  const a = path.join(process.cwd(), '..', 'profile-data', 'ai-daily', '_meta')
  if (fs.existsSync(a)) return a
  const b = path.join(process.cwd(), 'profile-data', 'ai-daily', '_meta')
  if (fs.existsSync(b)) return b
  return a
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
  const a = path.join(process.cwd(), '..', 'profile-data', 'ai-daily')
  if (fs.existsSync(a)) return a
  const b = path.join(process.cwd(), 'profile-data', 'ai-daily')
  if (fs.existsSync(b)) return b
  return a
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
