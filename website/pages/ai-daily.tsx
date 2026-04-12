import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllDailyDates, type DailyDigestSummary } from '@/lib/ai-daily'

interface AiDailyListProps {
  dates: DailyDigestSummary[]
}

const FOCUS_TOPIC_META: Record<string, { label: string; color: string }> = {
  memory: { label: 'Memory', color: 'bg-purple-500/20 text-purple-300' },
  'self-evolution': { label: 'Self-Evolution', color: 'bg-amber-500/20 text-amber-300' },
  'multi-agent': { label: 'Multi-Agent', color: 'bg-cyan-500/20 text-cyan-300' },
  planning: { label: 'Planning', color: 'bg-emerald-500/20 text-emerald-300' },
  reflection: { label: 'Reflection', color: 'bg-rose-500/20 text-rose-300' },
  'tool-use': { label: 'Tool Use', color: 'bg-blue-500/20 text-blue-300' },
}

export const getStaticProps: GetStaticProps<AiDailyListProps> = async () => {
  const dates = getAllDailyDates()
  return { props: { dates } }
}

export default function AiDailyList({ dates }: AiDailyListProps) {
  return (
    <>
      <Head>
        <title>AI Daily — Kylin Miao</title>
        <meta name="description" content="Curated AI news, delivered daily. Sourced from HN, arXiv, Reddit, and RSS." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">AI Daily</h1>
          <p className="text-gray-400 text-lg mb-12">
            Curated AI news, delivered daily.<br />
            <span className="text-gray-500 text-sm">Sourced from HN · Reddit · RSS · GitHub · Powered by Horizon + DeepSeek</span>
          </p>

          {/* Date list */}
          {dates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No digests yet. Check back tomorrow.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {dates.map(({ date, itemCount, focusTopics }) => {
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
                    href={`/ai-daily/${date}/`}
                    className="flex items-center justify-between py-4 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="min-w-0">
                      <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                        {formatted}
                      </span>
                      {focusTopics && focusTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {focusTopics.map(topic => {
                            const meta = FOCUS_TOPIC_META[topic]
                            if (!meta) return null
                            return (
                              <span
                                key={topic}
                                className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full ${meta.color}`}
                              >
                                {meta.label}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm flex-shrink-0 ml-3">
                      {itemCount} items →
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
