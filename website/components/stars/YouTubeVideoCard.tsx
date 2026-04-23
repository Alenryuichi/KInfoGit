import Link from 'next/link'
import type { YouTubeVideo } from '@/lib/social-feeds'

interface YouTubeVideoCardProps {
  video: YouTubeVideo
  personMap?: Record<string, string>
}

export function YouTubeVideoCard({ video, personMap }: YouTubeVideoCardProps) {
  const publishedAt = new Date(video.publishedAt)
  const formatted = publishedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedViews = video.viewCount > 0
    ? video.viewCount.toLocaleString()
    : null

  const personId = personMap?.[`youtube:${video.channelTitle.toLowerCase()}`]

  return (
    <div className="py-5 border-b border-white/[0.04] last:border-0">
      {/* Thumbnail + Title + Meta */}
      <div className="flex gap-4">
        {video.thumbnail && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-40 sm:w-48 aspect-video rounded-lg overflow-hidden bg-white/[0.04] group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube i.ytimg.com thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            />
          </a>
        )}
        <div className="flex-1 min-w-0">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <h3 className="text-gray-100 font-semibold text-[15px] leading-snug group-hover:text-white transition-colors line-clamp-2">
              {video.title}
              <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </h3>
          </a>
          <p className="text-sm text-gray-400 mt-1">
            {personId ? (
              <Link
                href={`/stars/people/${personId}/`}
                className="hover:text-red-400 transition-colors"
              >
                {video.channelTitle}
              </Link>
            ) : (
              video.channelTitle
            )}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <span>{formatted}</span>
            {formattedViews && (
              <>
                <span>·</span>
                <span>{formattedViews} views</span>
              </>
            )}
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-medium">
              YouTube
            </span>
          </div>
        </div>
      </div>

      {/* AI Commentary */}
      {(video.highlights || video.worthReading) && (
        <div className="mt-3 pl-3 border-l-2 border-white/[0.06]">
          {video.highlights && (
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-gray-500 font-medium">Highlights: </span>
              {video.highlights}
            </p>
          )}
          {video.worthReading && (
            <p className="text-gray-400 text-sm leading-relaxed mt-1">
              <span className="text-gray-500 font-medium">Worth watching: </span>
              {video.worthReading}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
