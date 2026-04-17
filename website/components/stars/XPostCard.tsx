import Link from 'next/link'
import type { XPost } from '@/lib/social-feeds'
import { STAR_TOPIC_META } from '@/lib/tag-metadata'

interface XPostCardProps {
  post: XPost
  personMap?: Record<string, string>
}

export function XPostCard({ post, personMap }: XPostCardProps) {
  const createdAt = new Date(post.createdAt)
  const formatted = createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const personId = personMap?.[`x:${post.author.handle}`]

  return (
    <div className="py-5 border-b border-white/[0.04] last:border-0">
      {/* Author header */}
      <div className="flex items-center gap-3 mb-3">
        {post.author.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
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
          <p className="text-xs text-gray-500">
            <svg className="inline-block w-3 h-3 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @{post.author.handle}
          </p>
        </div>
      </div>

      {/* Post content */}
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-gray-300 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap break-words hover:text-gray-200 transition-colors"
      >
        {post.content}
      </a>

      {/* Engagement metrics */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
          {formatted}
        </a>
        {(post.likeCount > 0 || post.retweetCount > 0 || post.replyCount > 0) && (
          <>
            <span>·</span>
            {post.likeCount > 0 && <span>❤️ {post.likeCount.toLocaleString()}</span>}
            {post.retweetCount > 0 && <span>🔄 {post.retweetCount.toLocaleString()}</span>}
            {post.replyCount > 0 && <span>💬 {post.replyCount.toLocaleString()}</span>}
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
