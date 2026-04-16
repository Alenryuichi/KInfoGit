import type { WeeklyDiff as WeeklyDiffType, SpecFramework } from '@/lib/spec-tracker'

interface WeeklyDiffProps {
  weeklyDiff: WeeklyDiffType | null | undefined
  frameworks: SpecFramework[]
}

export function WeeklyDiff({ weeklyDiff, frameworks }: WeeklyDiffProps) {
  if (!weeklyDiff) return null

  const { topGainer, newDiscovered, exitedDiscovered } = weeklyDiff
  const isEmpty = !topGainer && newDiscovered.length === 0 && exitedDiscovered.length === 0
  if (isEmpty) return null

  const fwNames = new Map(frameworks.map(fw => [fw.id, fw.name]))

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="space-y-3">
        {topGainer && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 shrink-0">最大涨幅</span>
            <span className="text-sm font-medium text-white">
              {fwNames.get(topGainer.frameworkId) ?? topGainer.frameworkId}
            </span>
            <span className="text-sm font-mono text-green-400">
              +{topGainer.delta}★
            </span>
          </div>
        )}
        {newDiscovered.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-500 shrink-0 pt-0.5">本周新进</span>
            <div className="flex flex-wrap gap-1.5">
              {newDiscovered.map(name => (
                <a
                  key={name}
                  href={`https://github.com/${name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        )}
        {exitedDiscovered.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-500 shrink-0 pt-0.5">本周退出</span>
            <div className="flex flex-wrap gap-1.5">
              {exitedDiscovered.map(name => (
                <span
                  key={name}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-500"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
