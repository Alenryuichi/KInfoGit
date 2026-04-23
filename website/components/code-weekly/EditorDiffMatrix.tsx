import type { EditorDiffMatrix as Matrix, EditorDiffRow, EditorTheme, EditorWowDelta } from '@/lib/code-weekly'

// ─── Theme meta: label + color ─────────────────────────────

const THEME_META: Record<EditorTheme, { label: string; color: string }> = {
  release:     { label: 'release',     color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  feature:     { label: 'feature',     color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  fix:         { label: 'fix',         color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  perf:        { label: 'perf',        color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  policy:      { label: 'policy',      color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  integration: { label: 'integration', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
}

// ─── WoW meta: glyph + label + color ───────────────────────

const WOW_META: Record<EditorWowDelta, { glyph: string; label: string; color: string }> = {
  first:        { glyph: '✨', label: 'new',        color: 'text-emerald-400' },
  silent:       { glyph: '⚠',  label: 'silent',     color: 'text-orange-400' },
  accelerating: { glyph: '↑',  label: 'accel',      color: 'text-emerald-400' },
  slowing:      { glyph: '↓',  label: 'slowing',    color: 'text-amber-400' },
  steady:       { glyph: '→',  label: 'steady',     color: 'text-gray-500' },
  unknown:      { glyph: '—',  label: '',           color: 'text-gray-700' },
}

// ─── Activity Dots ─────────────────────────────────────────

function ActivityDots({ n, category }: { n: 0 | 1 | 2 | 3 | 4 | 5; category: 'ide' | 'cli' }) {
  const activeColor = category === 'ide' ? 'text-emerald-400' : 'text-blue-400'
  return (
    <span
      className="font-mono text-sm tracking-tight tabular-nums"
      title={`${n} / 5 activity`}
    >
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={i < n ? activeColor : 'text-gray-700'}
        >
          {i < n ? '●' : '○'}
        </span>
      ))}
    </span>
  )
}

// ─── Theme Chips ───────────────────────────────────────────

function ThemeChips({ themes }: { themes: EditorTheme[] }) {
  if (themes.length === 0) {
    return <span className="text-[10px] font-mono text-gray-600">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {themes.map(t => {
        const meta = THEME_META[t]
        return (
          <span
            key={t}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${meta.color}`}
          >
            {meta.label}
          </span>
        )
      })}
    </div>
  )
}

// ─── WoW Badge ─────────────────────────────────────────────

function WowBadge({ wow }: { wow: EditorWowDelta }) {
  const meta = WOW_META[wow]
  return (
    <span
      className={`font-mono text-xs flex items-center gap-1 ${meta.color}`}
      title={`Week-over-week: ${wow}`}
    >
      <span>{meta.glyph}</span>
      {meta.label && <span>{meta.label}</span>}
    </span>
  )
}

// ─── Single Row ────────────────────────────────────────────

function DiffRow({ row }: { row: EditorDiffRow }) {
  return (
    <div className="py-2.5 px-3 grid grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors">
      {/* Name + version — cols 1-4 */}
      <div className="col-span-12 md:col-span-4 min-w-0">
        <span className="text-sm font-medium text-white truncate block">{row.name}</span>
        {row.version && (
          <span className="text-[10px] font-mono text-gray-500 truncate block">{row.version}</span>
        )}
      </div>

      {/* Activity dots — cols 5-6 */}
      <div className="col-span-4 md:col-span-2">
        <ActivityDots n={row.activityDots} category={row.category} />
      </div>

      {/* Themes — cols 7-10 */}
      <div className="col-span-6 md:col-span-4">
        <ThemeChips themes={row.themes} />
      </div>

      {/* WoW — cols 11-12 */}
      <div className="col-span-2 md:col-span-2 justify-self-end md:justify-self-start">
        <WowBadge wow={row.wow} />
      </div>
    </div>
  )
}

// ─── Bucket (IDE or CLI) ────────────────────────────────────

function DiffBucket({
  title,
  accent,
  rows,
}: {
  title: string
  accent: string
  rows: EditorDiffRow[]
}) {
  if (rows.length === 0) return null
  return (
    <div>
      <h3 className={`text-xs font-mono tracking-widest uppercase mb-2 ${accent}`}>{title}</h3>
      <div className="border border-white/5 rounded-xl bg-white/[0.02] divide-y divide-white/5">
        {rows.map(row => (
          <DiffRow key={row.name} row={row} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────

export function EditorDiffMatrix({ matrix }: { matrix: Matrix }) {
  const isEmpty = matrix.ide.length === 0 && matrix.cli.length === 0

  if (isEmpty) {
    return (
      <div className="text-sm text-gray-500 p-8 border border-white/5 rounded-xl bg-white/[0.02] text-center">
        No editor activity this week.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <DiffBucket title="IDE" accent="text-emerald-500/80" rows={matrix.ide} />
      <DiffBucket title="CLI / Plugin" accent="text-blue-500/80" rows={matrix.cli} />

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-gray-500 px-1">
        <span>activity:</span>
        <span className="text-emerald-400">●</span><span>IDE active</span>
        <span className="text-blue-400">●</span><span>CLI active</span>
        <span className="text-gray-700 ml-2">|</span>
        <span>WoW:</span>
        <span className="text-emerald-400">✨ new</span>
        <span className="text-orange-400">⚠ silent</span>
        <span className="text-emerald-400">↑ accel</span>
        <span className="text-amber-400">↓ slowing</span>
        <span className="text-gray-500">→ steady</span>
        {!matrix.hasPrevious && (
          <span className="text-gray-600 italic ml-2">(no previous week — WoW disabled)</span>
        )}
      </div>
    </div>
  )
}
