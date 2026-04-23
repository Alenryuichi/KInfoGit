import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import type { GetStaticProps } from 'next'
import {
  getAllRunRecords,
  computeKpis,
  findAnomalies,
  computeTopicHealth,
  computeTopicDiscovery,
  type RunRecord,
  type MetricsKpis,
  type AnomalyAlert,
  type TopicHealthRow,
  type TopicDiscoveryResult,
  type TopicCandidate,
} from '@/lib/ai-daily-metrics'

// ─── Types ────────────────────────────────────────────────

interface MetricsPageProps {
  records: RunRecord[]
  kpis: MetricsKpis
  anomalies: AnomalyAlert[]
  topicHealth: TopicHealthRow[]
  topicDiscovery: TopicDiscoveryResult
}

// ─── Data Loading ─────────────────────────────────────────

export const getStaticProps: GetStaticProps<MetricsPageProps> = async () => {
  const records = getAllRunRecords()
  const kpis = computeKpis(records, 7)
  const anomalies = findAnomalies(records)
  const topicHealth = computeTopicHealth()
  const topicDiscovery = computeTopicDiscovery()
  return { props: { records, kpis, anomalies, topicHealth, topicDiscovery } }
}

// ─── Chart primitives (zero external deps) ──────────────────

/**
 * Inline SVG line chart for avgScore + itemCount over time.
 * Dual y-axis kept visually distinct by colour.
 */
function LineChart({ records }: { records: RunRecord[] }) {
  const width = 720
  const height = 200
  const pad = { top: 20, right: 30, bottom: 30, left: 40 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  if (records.length < 2) {
    return <div className="text-gray-500 text-sm font-mono p-6">Need ≥2 data points to chart.</div>
  }

  const itemCounts = records.map(r => r.output?.itemCount ?? 0)
  const avgScores = records.map(r => r.output?.avgScore ?? 0)
  const maxItem = Math.max(...itemCounts, 1)
  const maxScore = 10                       // fixed axis: scores always 0-10

  const xStep = innerW / (records.length - 1)
  const itemPts = itemCounts.map((v, i) => [
    pad.left + i * xStep,
    pad.top + innerH - (v / maxItem) * innerH,
  ] as const)
  const scorePts = avgScores.map((v, i) => [
    pad.left + i * xStep,
    pad.top + innerH - (v / maxScore) * innerH,
  ] as const)

  const toPath = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Axis guides */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <line
          key={t}
          x1={pad.left}
          y1={pad.top + innerH * t}
          x2={pad.left + innerW}
          y2={pad.top + innerH * t}
          stroke="#1f2937"
          strokeWidth={0.5}
        />
      ))}

      {/* itemCount line (blue) */}
      <path d={toPath(itemPts)} stroke="#60a5fa" strokeWidth={1.5} fill="none" />
      {itemPts.map(([x, y], i) => (
        <circle key={`i-${i}`} cx={x} cy={y} r={2.5} fill="#60a5fa" />
      ))}

      {/* avgScore line (amber) */}
      <path d={toPath(scorePts)} stroke="#fbbf24" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
      {scorePts.map(([x, y], i) => (
        <circle key={`s-${i}`} cx={x} cy={y} r={2.5} fill="#fbbf24" />
      ))}

      {/* Y-axis labels (item count, blue, left) */}
      <text x={pad.left - 6} y={pad.top + 4} fontSize={9} fill="#60a5fa" textAnchor="end" fontFamily="monospace">
        {maxItem}
      </text>
      <text x={pad.left - 6} y={pad.top + innerH + 3} fontSize={9} fill="#60a5fa" textAnchor="end" fontFamily="monospace">
        0
      </text>
      {/* Y-axis labels (score, amber, right) */}
      <text x={pad.left + innerW + 6} y={pad.top + 4} fontSize={9} fill="#fbbf24" textAnchor="start" fontFamily="monospace">
        10
      </text>
      <text x={pad.left + innerW + 6} y={pad.top + innerH + 3} fontSize={9} fill="#fbbf24" textAnchor="start" fontFamily="monospace">
        0
      </text>

      {/* X-axis labels (only first/last to avoid clutter) */}
      <text
        x={pad.left}
        y={height - 8}
        fontSize={9}
        fill="#6b7280"
        textAnchor="start"
        fontFamily="monospace"
      >
        {records[0].date.slice(5)}
      </text>
      <text
        x={pad.left + innerW}
        y={height - 8}
        fontSize={9}
        fill="#6b7280"
        textAnchor="end"
        fontFamily="monospace"
      >
        {records[records.length - 1].date.slice(5)}
      </text>
    </svg>
  )
}

/**
 * Stacked bar chart: per-date source contributions (rss/search/social/horizon/github).
 */
function SourceStackChart({ records }: { records: RunRecord[] }) {
  const width = 720
  const height = 160
  const pad = { top: 10, right: 10, bottom: 30, left: 40 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  if (records.length === 0) {
    return <div className="text-gray-500 text-sm font-mono p-6">No data yet.</div>
  }

  const totals = records.map(r => {
    const s = r.sources ?? {}
    return (s.rss ?? 0) + (s.search ?? 0) + (s.social ?? 0) + (s.horizon ?? 0) + (s.github ?? 0)
  })
  const maxTotal = Math.max(...totals, 1)
  const barW = innerW / records.length * 0.7
  const gap = innerW / records.length * 0.3

  const colors = {
    rss: '#60a5fa',       // blue
    search: '#34d399',    // green
    social: '#fbbf24',    // amber
    horizon: '#f472b6',   // pink
    github: '#a78bfa',    // violet
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {records.map((r, i) => {
        const s = r.sources ?? {}
        const parts = [
          { key: 'rss' as const, v: s.rss ?? 0 },
          { key: 'search' as const, v: s.search ?? 0 },
          { key: 'social' as const, v: s.social ?? 0 },
          { key: 'horizon' as const, v: s.horizon ?? 0 },
          { key: 'github' as const, v: s.github ?? 0 },
        ]
        const x = pad.left + i * (barW + gap) + gap / 2
        let yOffset = pad.top + innerH
        return (
          <g key={r.date}>
            {parts.map(p => {
              if (p.v === 0) return null
              const h = (p.v / maxTotal) * innerH
              yOffset -= h
              return (
                <rect
                  key={p.key}
                  x={x}
                  y={yOffset}
                  width={barW}
                  height={h}
                  fill={colors[p.key]}
                  opacity={0.85}
                />
              )
            })}
            <text
              x={x + barW / 2}
              y={height - 14}
              fontSize={8}
              fill="#6b7280"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {r.date.slice(5)}
            </text>
          </g>
        )
      })}
      {/* Y-axis max label */}
      <text x={pad.left - 6} y={pad.top + 4} fontSize={9} fill="#6b7280" textAnchor="end" fontFamily="monospace">
        {maxTotal}
      </text>
      <text x={pad.left - 6} y={pad.top + innerH + 3} fontSize={9} fill="#6b7280" textAnchor="end" fontFamily="monospace">
        0
      </text>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────

export default function AiDailyMetrics({ records, kpis, anomalies, topicHealth, topicDiscovery }: MetricsPageProps) {
  const hasData = records.length > 0

  return (
    <>
      <Head>
        <title>AI Daily — Metrics Dashboard</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-white relative">
        <div className="fixed inset-0 bg-[#0a0a0a] -z-10" />
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-32 pb-32 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-emerald-400 text-xs uppercase tracking-[0.2em]">
                Pipeline.Observability
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              AI Daily <span className="font-serif italic font-light text-white/60">Metrics</span>
            </h1>
            <div className="text-xs text-gray-500 font-mono">
              <Link href="/ai-daily" className="hover:text-blue-400">← back to digest</Link>
              <span className="mx-2 text-gray-700">/</span>
              <span>{records.length} run{records.length !== 1 ? 's' : ''} recorded</span>
            </div>
          </div>

          {!hasData ? (
            <div className="border border-gray-800 rounded-lg p-8 text-gray-400 font-mono text-sm">
              No run records yet. The dashboard will populate after the pipeline writes its first
              entry to{' '}
              <code className="text-blue-400">profile-data/ai-daily/_meta/YYYY-MM.json</code>.
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <section className="mb-12">
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Last {kpis.recentRuns} Runs
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <KpiCard label="Avg items/run" value={kpis.avgItemCount.toFixed(1)} tone="blue" />
                  <KpiCard label="Avg score" value={kpis.avgScore.toFixed(1)} tone="amber" />
                  <KpiCard
                    label="Failed batches"
                    value={String(kpis.totalFailedBatches)}
                    tone={kpis.totalFailedBatches >= 5 ? 'red' : 'gray'}
                  />
                  <KpiCard
                    label="Halve-retries"
                    value={String(kpis.totalHalveRetries)}
                    tone="gray"
                  />
                  <KpiCard
                    label="Keyword fallbacks"
                    value={String(kpis.totalKeywordFallbacks)}
                    tone={kpis.totalKeywordFallbacks >= 10 ? 'red' : 'gray'}
                  />
                  <KpiCard
                    label="Runs in window"
                    value={String(kpis.recentRuns)}
                    tone="gray"
                  />
                </div>
              </section>

              {/* Trend Chart */}
              <section className="mb-12">
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Items + Score Trend
                </h2>
                <div className="border border-gray-800 rounded-lg bg-gray-900/20 p-4">
                  <LineChart records={records} />
                  <div className="flex gap-6 mt-3 text-xs font-mono">
                    <span className="text-blue-400">━ item count</span>
                    <span className="text-amber-400">┅ avg score (0-10)</span>
                  </div>
                </div>
              </section>

              {/* Source Stack */}
              <section className="mb-12">
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Source Contribution
                </h2>
                <div className="border border-gray-800 rounded-lg bg-gray-900/20 p-4">
                  <SourceStackChart records={records} />
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs font-mono">
                    <span className="text-blue-400">■ rss</span>
                    <span className="text-emerald-400">■ search</span>
                    <span className="text-amber-400">■ social</span>
                    <span className="text-pink-400">■ horizon</span>
                    <span className="text-violet-400">■ github</span>
                  </div>
                </div>
              </section>

              {/* Topic Health */}
              <section className="mb-12">
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-2">
                  Topic Health (last 30 days)
                </h2>
                <p className="text-xs text-gray-500 font-mono mb-4 leading-relaxed">
                  Hit counts per controlled-vocabulary focusTopic. Used to decide which anchors
                  to keep, rename, or retire in the next iteration of{' '}
                  <code className="text-blue-400">FOCUS_TOPICS</code>.
                </p>
                <TopicHealthTable rows={topicHealth} />
              </section>

              {/* Topic Discovery (v3) */}
              <section className="mb-12">
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-2">
                  Topic Discovery (v3) — last 30 days
                </h2>
                <p className="text-xs text-gray-500 font-mono mb-4 leading-relaxed">
                  Unsupervised frequency scan of free-form <code className="text-blue-400">item.tags[]</code>{' '}
                  (not <code className="text-blue-400">focusTopics</code>). Entries already in the controlled
                  vocabulary or in the entity blacklist (openai / cursor / meta / …) are excluded.
                  Candidates listed below are signal for the next{' '}
                  <code className="text-blue-400">FOCUS_TOPICS</code> update — review at weekly cadence,
                  promote manually in <code className="text-blue-400">scripts/ai-daily/config.ts</code>.
                </p>
                <TopicDiscoveryPanel discovery={topicDiscovery} />
              </section>

              {/* Anomalies */}
              <section className="mb-12">
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Recent Anomalies
                </h2>
                {anomalies.length === 0 ? (
                  <div className="border border-gray-800 rounded-lg bg-gray-900/20 p-4 text-emerald-400 font-mono text-sm">
                    [OK] No anomalies in recorded history.
                  </div>
                ) : (
                  <ul className="border border-gray-800 rounded-lg bg-gray-900/20 divide-y divide-gray-800">
                    {anomalies.map(a => (
                      <li key={a.date} className="p-3 font-mono text-xs flex gap-4">
                        <Link href={`/ai-daily/${a.date}`} className="text-blue-400 hover:underline shrink-0">
                          {a.date}
                        </Link>
                        <span className="text-amber-400">{a.reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Run Log Table */}
              <section>
                <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Run Log ({records.length})
                </h2>
                <div className="border border-gray-800 rounded-lg bg-gray-900/20 overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left p-3 font-normal">date</th>
                        <th className="text-right p-3 font-normal">items</th>
                        <th className="text-right p-3 font-normal">avg</th>
                        <th className="text-right p-3 font-normal">batches</th>
                        <th className="text-right p-3 font-normal">fail</th>
                        <th className="text-right p-3 font-normal">retry</th>
                        <th className="text-right p-3 font-normal">kwFb</th>
                        <th className="text-right p-3 font-normal">anchors</th>
                        <th className="text-right p-3 font-normal">dur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...records].reverse().map(r => (
                        <tr key={r.date} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="p-3">
                            <Link href={`/ai-daily/${r.date}`} className="text-blue-400 hover:underline">
                              {r.date}
                            </Link>
                          </td>
                          <td className="p-3 text-right text-white">{r.output?.itemCount ?? '—'}</td>
                          <td className="p-3 text-right text-amber-400">{r.output?.avgScore?.toFixed(1) ?? '—'}</td>
                          <td className="p-3 text-right text-gray-400">{r.scoring?.batches ?? '—'}</td>
                          <td className={`p-3 text-right ${(r.scoring?.failed ?? 0) > 0 ? 'text-rose-400' : 'text-gray-600'}`}>
                            {r.scoring?.failed ?? 0}
                          </td>
                          <td className="p-3 text-right text-gray-400">{r.scoring?.halveRetries ?? 0}</td>
                          <td className={`p-3 text-right ${(r.scoring?.keywordFallback ?? 0) > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                            {r.scoring?.keywordFallback ?? 0}
                          </td>
                          <td className="p-3 text-right text-gray-400">{r.anchors?.loaded ?? 0}</td>
                          <td className="p-3 text-right text-gray-500">
                            {r.durationMs != null ? `${Math.round(r.durationMs / 1000)}s` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── KPI Card ──────────────────────────────────────────────

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'blue' | 'amber' | 'red' | 'gray'
}) {
  const toneMap = {
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    red: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
    gray: 'text-gray-300 border-gray-700 bg-gray-900/20',
  } as const
  return (
    <div className={`border rounded-lg p-4 ${toneMap[tone]}`}>
      <div className="text-xs uppercase tracking-wider opacity-70 mb-2 font-mono">{label}</div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </div>
  )
}

// ─── Topic Health Table ────────────────────────────────────

function TopicHealthTable({ rows }: { rows: TopicHealthRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-gray-800 rounded-lg p-6 text-gray-500 font-mono text-sm">
        No digest data available.
      </div>
    )
  }

  const maxHits = Math.max(...rows.map(r => r.hits30d), 1)

  const statusMeta: Record<TopicHealthRow['status'], { label: string; color: string }> = {
    healthy: { label: 'healthy', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    watch:   { label: 'watch',   color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    stale:   { label: 'stale',   color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    dead:    { label: 'dead',    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    legacy:  { label: 'legacy',  color: 'text-gray-500 bg-gray-700/20 border-gray-600/40' },
  }

  // Find index of first legacy row so we can insert a visual divider.
  const firstLegacyIdx = rows.findIndex(r => r.isLegacy)

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/20 divide-y divide-gray-800">
      {rows.map((row, idx) => {
        const barPct = (row.hits30d / maxHits) * 100
        const meta = statusMeta[row.status]
        const showLegacyDivider = idx === firstLegacyIdx && firstLegacyIdx > 0
        return (
          <React.Fragment key={row.topic}>
            {showLegacyDivider && (
              <div className="px-4 py-2 bg-gray-900/40 text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                ── retired anchors (v1, kept for historical display) ──
              </div>
            )}
            <div className={`p-4 ${row.isLegacy ? 'opacity-60' : ''}`}>
              {/* Row header: topic name + bar + numbers */}
              <div className="flex items-center gap-4 mb-2">
                <div className="font-mono text-sm text-white shrink-0 w-36">{row.topic}</div>
                <div className={`px-2 py-0.5 border rounded text-[10px] font-mono uppercase tracking-wider shrink-0 ${meta.color}`}>
                  {meta.label}
                </div>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      row.status === 'healthy' ? 'bg-emerald-500' :
                      row.status === 'watch'   ? 'bg-amber-500' :
                      row.status === 'stale'   ? 'bg-orange-500' :
                      row.status === 'legacy'  ? 'bg-gray-600' : 'bg-rose-500/50'
                    }`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="font-mono text-xs text-gray-400 shrink-0 flex gap-3">
                  <span title="hits in last 7 days"><span className="text-gray-600">7d</span> {row.hits7d}</span>
                  <span title="hits in last 14 days"><span className="text-gray-600">14d</span> {row.hits14d}</span>
                  <span className="text-white" title="hits in last 30 days"><span className="text-gray-600">30d</span> {row.hits30d}</span>
                </div>
              </div>

              {/* Examples */}
              {row.recentExamples.length > 0 ? (
                <ul className="ml-40 space-y-1 mt-2">
                  {row.recentExamples.map((ex, i) => (
                    <li key={i} className="text-xs font-mono text-gray-400 flex gap-3">
                      <Link href={`/ai-daily/${ex.date}`} className="text-gray-600 hover:text-blue-400 shrink-0">
                        {ex.date}
                      </Link>
                      <span className="text-amber-400/70 shrink-0">{ex.score.toFixed(1)}</span>
                      <span className="text-gray-500 truncate">{ex.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="ml-40 text-xs font-mono text-gray-600 italic mt-1">
                  no examples in last 30 days
                </div>
              )}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Topic Discovery Panel ─────────────────────────────────

function TopicDiscoveryPanel({ discovery }: { discovery: TopicDiscoveryResult }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CandidateBucket
        title="Rising"
        glyph="🚀"
        accent="text-emerald-400"
        border="border-emerald-500/30"
        description="heavy recent-week signal"
        candidates={discovery.rising}
      />
      <CandidateBucket
        title="Persistent"
        glyph="📈"
        accent="text-blue-400"
        border="border-blue-500/30"
        description="steady across 30 days"
        candidates={discovery.persistent}
      />
      <CandidateBucket
        title="Sporadic"
        glyph="💫"
        accent="text-gray-400"
        border="border-gray-600/40"
        description="low-medium frequency, watch"
        candidates={discovery.sporadic}
      />
    </div>
  )
}

function CandidateBucket({
  title,
  glyph,
  accent,
  border,
  description,
  candidates,
}: {
  title: string
  glyph: string
  accent: string
  border: string
  description: string
  candidates: TopicCandidate[]
}) {
  return (
    <div className={`border ${border} rounded-lg bg-gray-900/20 flex flex-col`}>
      <div className="p-3 border-b border-gray-800 flex items-baseline justify-between">
        <div>
          <span className="mr-2">{glyph}</span>
          <span className={`font-mono text-sm uppercase tracking-wider ${accent}`}>{title}</span>
        </div>
        <span className="text-[10px] font-mono text-gray-600">{description}</span>
      </div>
      {candidates.length === 0 ? (
        <div className="p-4 text-xs font-mono text-gray-600 italic">
          No candidates in this tier yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {candidates.map(c => (
            <li key={c.tag} className="p-3 space-y-1.5">
              {/* tag + counts row */}
              <div className="flex items-center gap-2">
                <code className={`font-mono text-xs ${accent} truncate`}>{c.tag}</code>
                <div className="flex-1" />
                <span
                  className="font-mono text-[10px] text-gray-400 tabular-nums shrink-0"
                  title={`7d / 14d / 30d hit counts · ${Math.round(c.coverage30d * 30)} of 30 days`}
                >
                  <span className="text-white">{c.hits7d}</span>
                  <span className="text-gray-600 mx-0.5">/</span>
                  <span>{c.hits14d}</span>
                  <span className="text-gray-600 mx-0.5">/</span>
                  <span>{c.hits30d}</span>
                </span>
              </div>
              {/* first example as evidence */}
              {c.recentExamples.length > 0 && (
                <div className="text-[10px] font-mono text-gray-500 flex gap-2 truncate">
                  <Link
                    href={`/ai-daily/${c.recentExamples[0].date}`}
                    className="text-gray-600 hover:text-blue-400 shrink-0"
                  >
                    {c.recentExamples[0].date}
                  </Link>
                  <span className="text-amber-400/70 shrink-0">
                    {c.recentExamples[0].score.toFixed(1)}
                  </span>
                  <span className="truncate">{c.recentExamples[0].title}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
