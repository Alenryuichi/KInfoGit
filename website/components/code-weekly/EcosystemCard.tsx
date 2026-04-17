import type { EcosystemItem } from '@/lib/code-weekly'

interface EcosystemCardProps {
  item: EcosystemItem
}

// Friendly label + accent color per secondary topic. Kept in sync with
// FOCUS_TOPIC_META in pages/ai-daily.tsx so the label language matches.
const TOPIC_META: Record<string, { label: string; color: string }> = {
  'agent-harness':       { label: 'Agent Harness',       color: 'text-cyan-400/80' },
  'context-engineering': { label: 'Context Engineering', color: 'text-purple-400/80' },
  'tool-use':            { label: 'Tool Use',            color: 'text-gray-400' },
  'planning':            { label: 'Planning',            color: 'text-emerald-400/80' },
  'post-training':       { label: 'Post-Training',       color: 'text-amber-400/80' },
  'model-release':       { label: 'Model Release',       color: 'text-pink-400/80' },
  'evals':               { label: 'Evals',               color: 'text-lime-400/80' },
}

/**
 * Heuristic: a GitHub repo URL looks like https://github.com/{owner}/{repo}
 * and nothing more (no /blob, /pull, /issues). We render those differently —
 * title is "{owner}/{repo}" and a GitHub icon badge appears in the corner.
 */
function isGithubRepoUrl(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') return false
    const parts = u.pathname.split('/').filter(Boolean)
    return parts.length === 2
  } catch {
    return false
  }
}

export function EcosystemCard({ item }: EcosystemCardProps) {
  const isRepo = isGithubRepoUrl(item.url)

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-400/30 transition-colors group"
    >
      {/* Top row: source badge + score */}
      <div className="flex items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          {isRepo ? (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/[0.06] text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.06] text-gray-400">
              {item.source}
            </span>
          )}
          {item.publishedAt && (
            <span className="text-xs text-gray-600">
              {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-blue-400/80">
          <span className="text-gray-600">score</span>
          <span>{item.score.toFixed(1)}</span>
        </div>
      </div>

      {/* Title — repo URLs get the "owner/repo" treatment */}
      <h3 className="text-gray-200 font-medium group-hover:text-white transition-colors leading-snug mb-2">
        {isRepo ? item.title.split(' ')[0] : item.title}
        <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </h3>

      {/* Summary */}
      {item.summary && (
        <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2">
          {item.summary}
        </p>
      )}

      {/* Secondary topics — show up to 3 */}
      {item.secondaryTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.secondaryTopics.slice(0, 3).map(t => {
            const meta = TOPIC_META[t] ?? { label: t, color: 'text-gray-500' }
            return (
              <span key={t} className={`text-[10px] font-mono ${meta.color}`}>
                #{meta.label.toLowerCase().replace(/\s+/g, '-')}
              </span>
            )
          })}
        </div>
      )}
    </a>
  )
}
