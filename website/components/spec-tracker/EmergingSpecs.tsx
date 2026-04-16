import type { DiscoveredProject } from '@/lib/spec-tracker'

interface EmergingSpecsProps {
  projects: DiscoveredProject[]
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export function EmergingSpecs({ projects }: EmergingSpecsProps) {
  if (projects.length === 0) return null

  return (
    <div className="space-y-3">
      {projects.map(project => (
        <a
          key={project.fullName}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.10] transition-colors"
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-medium text-white">{project.fullName}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-yellow-400/80">
                {formatStars(project.stars)} ★
              </span>
              {project.language && (
                <span className="text-xs text-gray-500">{project.language}</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">{project.description}</p>
          {project.aiReason && (
            <p className="text-xs text-gray-500 mt-1">💡 {project.aiReason}</p>
          )}
        </a>
      ))}
    </div>
  )
}
