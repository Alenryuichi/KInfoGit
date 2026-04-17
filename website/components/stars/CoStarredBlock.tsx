import Link from 'next/link'
import { useState } from 'react'
import type { CoStarredRepo } from '@/lib/social-feeds'
import { STAR_TOPIC_META } from '@/lib/tag-metadata'

interface Props {
  repos: CoStarredRepo[]
  personMap: Record<string, string>
  /**
   * Label shown in the header (e.g. "Co-Starred · Last 7 days" or "Cross-Refs").
   */
  title: string
  /**
   * Short subtitle shown next to the title (e.g. "repos independently starred
   * by ≥2 AI leaders in the window").
   */
  subtitle?: string
  /**
   * If provided, show a minCount filter bar (e.g. [2, 3] renders ×2 / ×3+ tabs).
   */
  filterCounts?: number[]
  /**
   * Visual style — "accent" for prominent signal cards at the top of a page,
   * "compact" for a side-column card.
   */
  variant?: 'accent' | 'compact'
  /**
   * Cap the rendered rows. `null` = show all.
   */
  limit?: number | null
}

/**
 * Renders repos starred by ≥N distinct AI leaders, with per-repo chips listing
 * each starrer (linking to their /stars/people/{slug} page when known).
 */
export default function CoStarredBlock({
  repos,
  personMap,
  title,
  subtitle,
  filterCounts,
  variant = 'accent',
  limit = null,
}: Props) {
  const [minCount, setMinCount] = useState<number>(
    filterCounts && filterCounts.length > 0 ? filterCounts[0] : 2
  )

  const filtered = repos.filter(r => r.count >= minCount)
  const shown = limit ? filtered.slice(0, limit) : filtered

  if (repos.length === 0) return null

  if (variant === 'compact') {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 bg-yellow-500 rounded-full" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
        </div>
        <div className="space-y-3 text-xs">
          {shown.map(repo => (
            <div key={repo.repo} className="py-2 border-b border-white/5 last:border-b-0">
              <div className="flex justify-between items-start">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-orange-400 transition-colors break-all"
                >
                  {repo.repo}
                </a>
                <span className="text-yellow-400 font-mono text-[10px] whitespace-nowrap ml-2">
                  ×{repo.count}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap gap-x-2">
                {repo.starredBy.map(handle => {
                  const slug = personMap[handle.toLowerCase()]
                  return slug ? (
                    <Link
                      key={handle}
                      href={`/stars/people/${slug}/`}
                      className="hover:text-gray-300 underline underline-offset-2 decoration-white/10"
                    >
                      {handle}
                    </Link>
                  ) : (
                    <span key={handle}>{handle}</span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // accent variant
  return (
    <div className="mb-12 rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-400 text-[10px] uppercase tracking-widest font-mono">◆ Signal</span>
          </div>
          <h2 className="text-lg font-bold text-white font-sans">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 font-sans">{subtitle}</p>
          )}
        </div>
        {filterCounts && filterCounts.length > 1 && (
          <div className="flex gap-2 text-[10px] font-mono">
            {filterCounts.map(c => (
              <button
                key={c}
                onClick={() => setMinCount(c)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  minCount === c
                    ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                    : 'text-gray-500 border-transparent hover:text-white'
                }`}
              >
                ×{c}{c === filterCounts[filterCounts.length - 1] ? '+' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="text-xs text-gray-500 font-mono py-4">
          No repos met the ×{minCount}{filterCounts && minCount === filterCounts[filterCounts.length - 1] ? '+' : ''} threshold in this window.
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(repo => (
            <div
              key={repo.repo}
              className="rounded-lg border border-white/5 bg-black/20 p-4 hover:border-yellow-500/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-gray-100 hover:text-yellow-300 transition-colors font-sans break-all"
                >
                  {repo.repo}
                </a>
                <div className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap">
                  <span className="text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                    ×{repo.count} starrers
                  </span>
                  {repo.stargazersCount > 0 && (
                    <span className="text-orange-400/80 bg-orange-500/10 px-1.5 py-0.5 rounded">
                      ★ {repo.stargazersCount >= 1000 ? (repo.stargazersCount / 1000).toFixed(1) + 'k' : repo.stargazersCount}
                    </span>
                  )}
                </div>
              </div>

              {repo.description && (
                <p className="text-sm text-gray-400 mb-3 font-sans">{repo.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest">
                <div className="flex flex-wrap gap-2 text-gray-500">
                  <span className="text-gray-600">by:</span>
                  {repo.starredBy.map(handle => {
                    const slug = personMap[handle.toLowerCase()]
                    return slug ? (
                      <Link
                        key={handle}
                        href={`/stars/people/${slug}/`}
                        className="text-gray-300 hover:text-yellow-300 underline underline-offset-2 decoration-white/20 hover:decoration-yellow-500/50 transition-colors"
                      >
                        {handle}
                      </Link>
                    ) : (
                      <span key={handle} className="text-gray-400">{handle}</span>
                    )
                  })}
                </div>

                {repo.tags.length > 0 && (
                  <>
                    <span className="text-gray-700">|</span>
                    <div className="flex gap-2">
                      {repo.tags.map(t => {
                        const meta = STAR_TOPIC_META[t]
                        if (meta) {
                          const colorPrefix = meta.color.split(' ')[0]
                          return <span key={t} className={colorPrefix}>[{meta.label}]</span>
                        }
                        return <span key={t} className="text-gray-500">[{t}]</span>
                      })}
                    </div>
                  </>
                )}

                {repo.firstDate !== repo.latestDate && (
                  <>
                    <span className="text-gray-700">|</span>
                    <span className="text-gray-600">{repo.firstDate} → {repo.latestDate}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {limit && filtered.length > limit && (
        <div className="mt-4 text-[10px] text-gray-500 font-mono text-right">
          +{filtered.length - limit} more hidden
        </div>
      )}
    </div>
  )
}
