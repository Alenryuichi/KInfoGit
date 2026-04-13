import Link from 'next/link'
import { STAR_TOPIC_META } from '@/lib/tag-metadata'
import type { TagStat } from '@/lib/social-feeds'

interface TagCloudProps {
  tagStats: TagStat[]
  latestDate: string
}

export function TagCloud({ tagStats, latestDate }: TagCloudProps) {
  if (tagStats.length === 0) return null

  const maxCount = Math.max(...tagStats.map(t => t.count))

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-8">
      <span className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mr-1">Topics</span>
      {tagStats.map(({ tag, count }) => {
        const meta = STAR_TOPIC_META[tag]
        if (!meta) return null

        const ratio = count / maxCount
        const opacity = 0.5 + ratio * 0.5

        return (
          <Link
            key={tag}
            href={`/stars/${latestDate}/?topic=${tag}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full transition-colors hover:brightness-125 ${meta.color}`}
            style={{ opacity }}
          >
            {meta.label}
            <span className="text-[9px] opacity-60">{count}</span>
          </Link>
        )
      })}
    </div>
  )
}
