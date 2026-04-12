import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllFeedDates, type DailyFeedSummary } from '@/lib/social-feeds'

interface StarsListProps {
  dates: DailyFeedSummary[]
}

export const getStaticProps: GetStaticProps<StarsListProps> = async () => {
  const dates = getAllFeedDates()
  return { props: { dates } }
}

export default function StarsList({ dates }: StarsListProps) {
  return (
    <>
      <Head>
        <title>Stars — Kylin Miao</title>
        <meta name="description" content="Recently starred GitHub repos and Bluesky posts from AI leaders with AI-powered highlights." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Stars & Posts</h1>
          <p className="text-gray-400 text-lg mb-12">
            Recently starred GitHub repos and Bluesky posts from AI leaders.<br />
            <span className="text-gray-500 text-sm">Curated from GitHub & Bluesky · Powered by DeepSeek</span>
          </p>

          {/* Date list */}
          {dates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No stars or posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {dates.map(({ date, itemCount, githubCount, blueskyCount }) => {
                const d = new Date(date + 'T00:00:00')
                const formatted = d.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
                return (
                  <Link
                    key={date}
                    href={`/stars/${date}/`}
                    className="flex items-center justify-between py-4 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors group"
                  >
                    <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                      {formatted}
                    </span>
                    <span className="text-gray-500 text-sm flex-shrink-0 ml-3">
                      {githubCount > 0 && <span>{githubCount} repo{githubCount === 1 ? '' : 's'}</span>}
                      {githubCount > 0 && blueskyCount > 0 && <span> · </span>}
                      {blueskyCount > 0 && <span>{blueskyCount} post{blueskyCount === 1 ? '' : 's'}</span>}
                      <span> →</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
