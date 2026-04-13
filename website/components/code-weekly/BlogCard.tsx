import type { BlogPost } from '@/lib/code-weekly'

interface BlogCardProps {
  blog: BlogPost
}

const COMPANY_COLORS: Record<string, string> = {
  Anthropic: 'bg-orange-500/20 text-orange-300',
  OpenAI: 'bg-emerald-500/20 text-emerald-300',
  'Google AI': 'bg-blue-500/20 text-blue-300',
  Cursor: 'bg-purple-500/20 text-purple-300',
  Vercel: 'bg-white/[0.08] text-gray-300',
}

export function BlogCard({ blog }: BlogCardProps) {
  const companyColor = COMPANY_COLORS[blog.company] || 'bg-white/[0.06] text-gray-400'

  return (
    <a
      href={blog.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors group"
    >
      {/* Company badge + date */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${companyColor}`}>
          {blog.company}
        </span>
        {blog.publishedAt && (
          <span className="text-xs text-gray-600">
            {new Date(blog.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-gray-200 font-medium group-hover:text-white transition-colors leading-snug mb-2">
        {blog.title}
        <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </h3>

      {/* Summary */}
      {blog.summary && (
        <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-3">
          {blog.summary}
        </p>
      )}

      {/* Tags */}
      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {blog.tags.map(tag => (
            <span key={tag} className="text-[10px] text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </a>
  )
}
