import type { SpecFramework, FrameworkDelta } from '@/lib/spec-tracker'

interface FrameworkTableProps {
  frameworks: SpecFramework[]
  deltas?: FrameworkDelta[]
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

const CATEGORY_LABELS: Record<string, string> = {
  toolkit: 'Toolkit',
  'agent-framework': 'Agent FW',
  ide: 'IDE',
  platform: 'Platform',
  rules: 'Rules',
}

export function FrameworkTable({ frameworks, deltas }: FrameworkTableProps) {
  const sorted = [...frameworks].sort(
    (a, b) => (b.github?.stars ?? 0) - (a.github?.stars ?? 0),
  )
  const deltaMap = new Map(deltas?.map(d => [d.frameworkId, d]) ?? [])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left py-2 pr-4 text-gray-500 font-medium">Name</th>
            <th className="text-right py-2 px-3 text-gray-500 font-medium">★</th>
            <th className="text-right py-2 px-3 text-gray-500 font-medium">npm/wk</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium hidden sm:table-cell">Type</th>
            <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Version</th>
            <th className="text-right py-2 pl-3 text-gray-500 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(fw => {
            const stars = fw.github?.stars
            const downloads = fw.npm?.weeklyDownloads
            const version = fw.github?.latestRelease?.tag ?? fw.npm?.latestVersion
            const lastUpdate = fw.github?.pushedAt ?? fw.npm?.lastPublishedAt

            return (
              <tr key={fw.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-2.5 pr-4">
                  {fw.website ? (
                    <a
                      href={fw.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-colors font-medium"
                    >
                      {fw.name}
                    </a>
                  ) : (
                    <span className="text-white font-medium">{fw.name}</span>
                  )}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-gray-300">
                  {stars != null ? formatStars(stars) : '—'}
                </td>
                <td className="text-right py-2.5 px-3 font-mono text-gray-300">
                  {downloads != null ? formatDownloads(downloads) : '—'}
                  {(() => {
                    const nd = deltaMap.get(fw.id)?.npmDelta
                    if (nd != null && nd !== 0) {
                      return (
                        <span
                          className="ml-1 text-[10px]"
                          style={{ color: nd > 0 ? '#22C55E' : '#EF4444' }}
                        >
                          {nd > 0 ? '▲' : '▼'}
                        </span>
                      )
                    }
                    return null
                  })()}
                </td>
                <td className="py-2.5 px-3 text-gray-500 hidden sm:table-cell">
                  {CATEGORY_LABELS[fw.category] ?? fw.category}
                </td>
                <td className="py-2.5 px-3 text-gray-400 font-mono text-xs hidden md:table-cell">
                  {version ?? '—'}
                </td>
                <td className="text-right py-2.5 pl-3 text-gray-500">
                  {lastUpdate ? formatDate(lastUpdate) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
