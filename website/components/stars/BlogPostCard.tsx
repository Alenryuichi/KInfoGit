import Link from 'next/link'
import type { BlogPost } from '@/lib/social-feeds'

interface BlogPostCardProps {
  post: BlogPost
  personMap?: Record<string, string>
}

export function BlogPostCard({ post, personMap }: BlogPostCardProps) {
  const personId = personMap?.[`blog:${post.author.toLowerCase()}`]

  return (
    <div className="py-5 border-b border-white/[0.04] last:border-0">
      {/* Title + Author */}
      <div className="mb-3">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-100 font-semibold hover:text-white transition-colors leading-snug"
        >
          {post.title}
          <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <p className="text-xs text-gray-500 mt-1">
          {personId ? (
            <Link
              href={`/stars/people/${personId}/`}
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              {post.author}
            </Link>
          ) : (
            <span className="text-gray-400">{post.author}</span>
          )}
          {post.publishedAt && (
            <>
              <span className="mx-1.5">·</span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </>
          )}
        </p>
      </div>

      {/* Summary */}
      {post.summary && (
        <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
          {post.summary}
        </p>
      )}

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

      {/* Blog badge */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-500/20 text-indigo-300">
          Blog
        </span>
      </div>
    </div>
  )
}
