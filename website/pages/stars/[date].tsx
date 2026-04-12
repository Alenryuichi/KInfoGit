import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps, GetStaticPaths } from 'next'
import {
  getAllFeedDates,
  getFeedByDate,
  getAdjacentDates,
  type DailyFeed,
  type FeedItem,
  type StarredRepo,
  type BlueskyPost,
} from '@/lib/social-feeds'

// --- Types ---

interface StarsDetailProps {
  daily: DailyFeed
  prevDate: string | null
  nextDate: string | null
  allDates: string[]
}

// --- Data Loading ---

export const getStaticPaths: GetStaticPaths = async () => {
  const dates = getAllFeedDates()
  return {
    paths: dates.map(d => ({ params: { date: d.date } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<StarsDetailProps> = async ({ params }) => {
  const date = params?.date as string
  const daily = getFeedByDate(date)
  if (!daily) return { notFound: true }

  const { prev, next } = getAdjacentDates(date)
  const allDates = getAllFeedDates().map(d => d.date)

  return { props: { daily, prevDate: prev, nextDate: next, allDates } }
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

// --- GitHub Repo Card ---

function RepoCard({ star }: { star: StarredRepo }) {
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
          starred by <span className="text-gray-400">{star.starredBy}</span>
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
    </div>
  )
}

// --- Bluesky Post Card ---

function BlueskyPostCard({ post }: { post: BlueskyPost }) {
  const createdAt = new Date(post.createdAt)
  const formatted = createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

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
    </div>
  )
}

// --- Polymorphic Item Card ---

function ItemCard({ item }: { item: FeedItem }) {
  if (item.type === 'github') {
    return <RepoCard star={item} />
  } else if (item.type === 'bluesky') {
    return <BlueskyPostCard post={item} />
  }
  return null
}

// --- Date Navigation ---

function DateNav({
  currentDate,
  prevDate,
  nextDate,
  allDates,
}: {
  currentDate: string
  prevDate: string | null
  nextDate: string | null
  allDates: string[]
}) {
  const idx = allDates.indexOf(currentDate)
  const start = Math.max(0, idx - 2)
  const nearby = allDates.slice(start, start + 5)

  return (
    <div className="flex items-center justify-between mb-10">
      {prevDate ? (
        <Link
          href={`/stars/${prevDate}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← {prevDate}
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">← oldest</span>
      )}

      <div className="hidden sm:flex items-center gap-1.5">
        {nearby.map(d => (
          <Link
            key={d}
            href={`/stars/${d}/`}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              d === currentDate
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }`}
          >
            {d.slice(5)}
          </Link>
        ))}
      </div>

      {nextDate ? (
        <Link
          href={`/stars/${nextDate}/`}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          {nextDate} →
        </Link>
      ) : (
        <span className="text-gray-700 text-sm">latest →</span>
      )}
    </div>
  )
}

// --- Page ---

export default function StarsDetail({ daily, prevDate, nextDate, allDates }: StarsDetailProps) {
  const d = new Date(daily.date + 'T00:00:00')
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Count items by type
  const githubCount = daily.items.filter(item => item.type === 'github').length
  const blueskyCount = daily.items.filter(item => item.type === 'bluesky').length

  return (
    <>
      <Head>
        <title>Stars — {daily.date} — Kylin Miao</title>
        <meta name="description" content={`GitHub stars and Bluesky posts for ${formatted}: ${daily.items.length} items.`} />
      </Head>

      <div className="min-h-screen bg-black text-white" data-pagefind-body data-pagefind-meta="type:Stars">
        <meta data-pagefind-meta={`date:${daily.date}`} />
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back link */}
          <Link
            href="/stars/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Stars & Posts
          </Link>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Stars & Posts</h1>
          <p className="text-gray-400 mb-8">{formatted}</p>

          {/* Date nav */}
          <DateNav
            currentDate={daily.date}
            prevDate={prevDate}
            nextDate={nextDate}
            allDates={allDates}
          />

          {/* AI Daily Overview */}
          {daily.summary && (
            <div className="mb-10 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-300">Daily Overview</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">AI</span>
              </div>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                {daily.summary}
              </p>
            </div>
          )}

          {/* Item cards */}
          <div>
            {daily.items.map((item, idx) => (
              <ItemCard key={`${item.type}-${idx}`} item={item} />
            ))}
          </div>

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/[0.06] text-xs text-gray-500">
            {githubCount > 0 && <span>{githubCount} repos · </span>}
            {blueskyCount > 0 && <span>{blueskyCount} posts · </span>}
            Powered by DeepSeek
          </div>

          {/* Bottom date nav */}
          <div className="mt-10">
            <DateNav
              currentDate={daily.date}
              prevDate={prevDate}
              nextDate={nextDate}
              allDates={allDates}
            />
          </div>
        </div>
      </div>
    </>
  )
}
