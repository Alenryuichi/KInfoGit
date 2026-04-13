import Link from 'next/link'
import type { StarredRepo } from '@/lib/social-feeds'

// --- Star Topic Color Map ---

const STAR_TOPIC_META: Record<string, { label: string; color: string }> = {
  agent: { label: 'Agent', color: 'bg-violet-500/20 text-violet-300' },
  llm: { label: 'LLM', color: 'bg-blue-500/20 text-blue-300' },
  infra: { label: 'Infra', color: 'bg-amber-500/20 text-amber-300' },
  rag: { label: 'RAG', color: 'bg-emerald-500/20 text-emerald-300' },
  'multi-modal': { label: 'Multi-modal', color: 'bg-pink-500/20 text-pink-300' },
  safety: { label: 'Safety', color: 'bg-red-500/20 text-red-300' },
  'fine-tuning': { label: 'Fine-tuning', color: 'bg-orange-500/20 text-orange-300' },
  evaluation: { label: 'Evaluation', color: 'bg-cyan-500/20 text-cyan-300' },
  deployment: { label: 'Deployment', color: 'bg-gray-500/20 text-gray-300' },
  tooling: { label: 'Tooling', color: 'bg-teal-500/20 text-teal-300' },
}

// --- Language Color ---

const LANG_COLORS: Record<string, string> = {
  Python: 'bg-blue-500/20 text-blue-300',
  TypeScript: 'bg-blue-400/20 text-blue-200',
  JavaScript: 'bg-yellow-500/20 text-yellow-300',
  Rust: 'bg-orange-500/20 text-orange-300',
  Go: 'bg-cyan-500/20 text-cyan-300',
  Java: 'bg-red-500/20 text-red-300',
  'C++': 'bg-pink-500/20 text-pink-300',
  C: 'bg-gray-500/20 text-gray-300',
  Swift: 'bg-orange-400/20 text-orange-200',
  Kotlin: 'bg-purple-500/20 text-purple-300',
  Ruby: 'bg-red-400/20 text-red-200',
  Shell: 'bg-green-500/20 text-green-300',
  Jupyter: 'bg-orange-500/20 text-orange-300',
}

function langColor(language: string | null): string {
  if (!language) return 'bg-gray-500/20 text-gray-400'
  return LANG_COLORS[language] || 'bg-gray-500/20 text-gray-300'
}

interface RepoCardProps {
  star: StarredRepo
  personMap?: Record<string, string>
}

export function RepoCard({ star, personMap }: RepoCardProps) {
  const personId = personMap?.[`github:${star.starredBy}`]

  return (
    <div className="py-5 border-b border-white/[0.04] last:border-0">
      {/* Repo name + link */}
      <a
        href={star.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-100 font-semibold hover:text-white transition-colors leading-snug"
      >
        {star.repo}
        <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Meta: language, stars, starred by */}
      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
        {star.language && (
          <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${langColor(star.language)}`}>
            {star.language}
          </span>
        )}
        <span className="text-gray-500">
          ⭐ {star.stargazersCount.toLocaleString()}
        </span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-500">
          starred by{' '}
          {personId ? (
            <Link href={`/stars/people/${personId}/`} className="text-gray-400 hover:text-white transition-colors">
              {star.starredBy}
            </Link>
          ) : (
            <span className="text-gray-400">{star.starredBy}</span>
          )}
        </span>
      </div>

      {/* Description */}
      {star.description && (
        <p className="text-gray-400 text-[15px] leading-relaxed mt-2">
          {star.description}
        </p>
      )}

      {/* AI Commentary */}
      {(star.highlights || star.worthReading) && (
        <div className="mt-3 pl-3 border-l-2 border-white/[0.06]">
          {star.highlights && (
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-gray-500 font-medium">Highlights: </span>
              {star.highlights}
            </p>
          )}
          {star.worthReading && (
            <p className="text-gray-400 text-sm leading-relaxed mt-1">
              <span className="text-gray-500 font-medium">Worth reading: </span>
              {star.worthReading}
            </p>
          )}
        </div>
      )}

      {/* Topics */}
      {star.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {star.topics.slice(0, 5).map(topic => (
            <span
              key={topic}
              className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.04] text-gray-500"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Tag Badges */}
      {(star.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(star.tags ?? []).slice(0, 3).map(tag => {
            const meta = STAR_TOPIC_META[tag]
            if (!meta) return null
            return (
              <span
                key={tag}
                className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${meta.color}`}
              >
                {meta.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
