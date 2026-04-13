import Link from 'next/link'
import type { BlueskyPost } from '@/lib/social-feeds'

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

interface BlueskyPostCardProps {
  post: BlueskyPost
  personMap?: Record<string, string>
}

export function BlueskyPostCard({ post, personMap }: BlueskyPostCardProps) {
  const createdAt = new Date(post.createdAt)
  const formatted = createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const personId = personMap?.[`bluesky:${post.author.handle}`]

  return (
    <div className="py-5 border-b border-white/[0.04] last:border-0">
      {/* Author header */}
      <div className="flex items-center gap-3 mb-3">
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt={post.author.handle}
            className="w-9 h-9 rounded-full"
          />
        )}
        <div className="flex-1">
          {personId ? (
            <Link
              href={`/stars/people/${personId}/`}
              className="text-gray-100 font-semibold hover:text-white transition-colors leading-snug"
            >
              {post.author.displayName}
            </Link>
          ) : (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-100 font-semibold hover:text-white transition-colors leading-snug"
            >
              {post.author.displayName}
              <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <p className="text-xs text-gray-500">@{post.author.handle}</p>
        </div>
      </div>

      {/* Post content */}
      <p className="text-gray-300 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap break-words">
        {post.content}
      </p>

      {/* Engagement metrics */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span>{formatted}</span>
        <span>·</span>
        <span>❤️ {post.likeCount.toLocaleString()}</span>
        <span>🔄 {post.repostCount.toLocaleString()}</span>
        {post.replyCount > 0 && (
          <>
            <span>·</span>
            <span>💬 {post.replyCount.toLocaleString()}</span>
          </>
        )}
      </div>

      {/* AI Commentary */}
      {(post.highlights || post.worthReading) && (
        <div className="mt-3 pl-3 border-l-2 border-white/[0.06]">
          {post.highlights && (
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-gray-500 font-medium">Highlights: </span>
              {post.highlights}
            </p>
          )}
          {post.worthReading && (
            <p className="text-gray-400 text-sm leading-relaxed mt-1">
              <span className="text-gray-500 font-medium">Worth reading: </span>
              {post.worthReading}
            </p>
          )}
        </div>
      )}

      {/* Tag Badges */}
      {(post.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(post.tags ?? []).slice(0, 3).map(tag => {
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
