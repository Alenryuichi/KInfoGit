import type { SpecFramework } from '@/lib/spec-tracker'

interface RecentActivityProps {
  frameworks: SpecFramework[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function RecentActivity({ frameworks }: RecentActivityProps) {
  // Collect frameworks with release info
  const withActivity = frameworks
    .filter(fw => fw.github?.latestRelease || fw.npm?.latestVersion)
    .sort((a, b) => {
      const aDate = a.github?.latestRelease?.publishedAt ?? a.npm?.lastPublishedAt ?? ''
      const bDate = b.github?.latestRelease?.publishedAt ?? b.npm?.lastPublishedAt ?? ''
      return bDate.localeCompare(aDate)
    })
    .slice(0, 6)

  if (withActivity.length === 0) return null

  return (
    <div className="space-y-4">
      {withActivity.map(fw => {
        const release = fw.github?.latestRelease
        const npmVer = fw.npm?.latestVersion
        const date = release?.publishedAt ?? fw.npm?.lastPublishedAt

        return (
          <div
            key={fw.id}
            className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-medium text-white">{fw.name}</span>
              <div className="flex items-baseline gap-2">
                {release?.tag && (
                  <span className="text-xs font-mono text-gray-400">{release.tag}</span>
                )}
                {!release?.tag && npmVer && (
                  <span className="text-xs font-mono text-gray-400">v{npmVer}</span>
                )}
                {date && (
                  <span className="text-xs text-gray-500">{formatDate(date)}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{fw.description}</p>
          </div>
        )
      })}
    </div>
  )
}
