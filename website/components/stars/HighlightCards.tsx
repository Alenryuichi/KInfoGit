import Link from 'next/link'
import type { HighlightItem } from '@/lib/social-feeds'

// Source icons
function SourceIcon({ type }: { type: string }) {
  if (type === 'github') {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    )
  }
  if (type === 'bluesky') {
    return <span className="text-xs">🦋</span>
  }
  if (type === 'youtube') {
    return <span className="text-xs">▶️</span>
  }
  if (type === 'blog') {
    return <span className="text-xs">📝</span>
  }
  return null
}

function getTitle(item: HighlightItem): string {
  const { item: feedItem } = item
  if (feedItem.type === 'github') return feedItem.repo
  if (feedItem.type === 'bluesky') return feedItem.content.slice(0, 80) + (feedItem.content.length > 80 ? '…' : '')
  if (feedItem.type === 'youtube') return feedItem.title
  if (feedItem.type === 'blog') return feedItem.title
  return ''
}

function getSubtitle(item: HighlightItem): string {
  const { item: feedItem } = item
  if (feedItem.type === 'github') return `⭐ ${feedItem.stargazersCount.toLocaleString()} · ${feedItem.starredBy}`
  if (feedItem.type === 'bluesky') return `❤️ ${feedItem.likeCount.toLocaleString()} · @${feedItem.author.handle}`
  if (feedItem.type === 'youtube') return `${feedItem.viewCount?.toLocaleString() || '0'} views · ${feedItem.channelTitle}`
  if (feedItem.type === 'blog') return feedItem.author
  return ''
}

function getHighlightsText(item: HighlightItem): string {
  const { item: feedItem } = item
  if ('highlights' in feedItem && feedItem.highlights) return feedItem.highlights
  if (feedItem.type === 'github' && feedItem.description) return feedItem.description
  if (feedItem.type === 'blog' && feedItem.summary) return feedItem.summary
  return ''
}

interface HighlightCardsProps {
  highlights: HighlightItem[]
}

export function HighlightCards({ highlights }: HighlightCardsProps) {
  if (highlights.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Top Highlights
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {highlights.map((hl, idx) => (
          <Link
            key={idx}
            href={`/stars/${hl.date}/`}
            className="flex-shrink-0 w-64 snap-start rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2">
              <SourceIcon type={hl.item.type} />
              <span className="text-[10px] text-gray-500 uppercase font-medium">{hl.item.type}</span>
            </div>
            <p className="text-gray-200 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors mb-1.5">
              {getTitle(hl)}
            </p>
            <p className="text-gray-500 text-xs mb-2">{getSubtitle(hl)}</p>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
              {getHighlightsText(hl)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
