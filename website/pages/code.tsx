import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllCodeWeeks, type CodeWeeklySummary } from '@/lib/code-weekly'

interface CodeListProps {
  weeks: CodeWeeklySummary[]
}

export const getStaticProps: GetStaticProps<CodeListProps> = async () => {
  const weeks = getAllCodeWeeks()
  return { props: { weeks } }
}

export default function CodeList({ weeks }: CodeListProps) {
  return (
    <>
      <Head>
        <title>Code Weekly — Kylin Miao</title>
        <meta name="description" content="Weekly digest of AI Code editor ecosystem: features, benchmarks, and company blogs." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Code Weekly</h1>
          <p className="text-gray-400 text-lg mb-12">
            AI Code 编辑器生态周报<br />
            <span className="text-gray-500 text-sm">
              Tracking Cursor · Claude Code · Gemini CLI · Aider · and more · Powered by Tavily + DeepSeek
            </span>
          </p>

          {/* Week list */}
          {weeks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">暂无周报数据，请稍后再来。</p>
            </div>
          ) : (
            <div className="space-y-1">
              {weeks.map(({ week, dateRange, weekSummary, editorCount }) => (
                <Link
                  key={week}
                  href={`/code/${week}/`}
                  className="flex items-center justify-between py-4 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                        {week}
                      </span>
                      <span className="text-xs text-gray-600">{dateRange}</span>
                    </div>
                    {weekSummary && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {weekSummary}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm flex-shrink-0 ml-3">
                    {editorCount} editors →
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Benchmarks entry */}
          <div className="mt-16 pt-8 border-t border-white/[0.06]">
            <Link
              href="/code/benchmarks/"
              className="flex items-center justify-between py-4 px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors group"
            >
              <div>
                <h3 className="text-gray-200 font-medium group-hover:text-white transition-colors">
                  🏆 查看最新评测排名
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Chatbot Arena · Aider Leaderboard · 每日更新
                </p>
              </div>
              <span className="text-gray-500 text-sm">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
