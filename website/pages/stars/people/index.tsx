import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllPeople, type PersonSummary } from '@/lib/people'
import { Github, MessageSquare, Youtube, FileText } from 'lucide-react'

interface PeopleIndexProps {
  people: PersonSummary[]
}

export const getStaticProps: GetStaticProps<PeopleIndexProps> = async () => {
  const people = getAllPeople()

  // Sort by signal strength: active targets first (by activity count desc),
  // then idle targets alphabetically
  people.sort((a, b) => {
    const aActive = a.activityCount > 0 ? 1 : 0
    const bActive = b.activityCount > 0 ? 1 : 0
    if (aActive !== bActive) return bActive - aActive

    // Both active: composite score = activity * 1.5 + platforms * 10
    if (aActive && bActive) {
      const aScore = a.activityCount * 1.5 + a.platformCount * 10
      const bScore = b.activityCount * 1.5 + b.platformCount * 10
      if (aScore !== bScore) return bScore - aScore
      // Tiebreak: most recent signal first
      if (a.latestActivityAt && b.latestActivityAt) {
        const cmp = b.latestActivityAt.localeCompare(a.latestActivityAt)
        if (cmp !== 0) return cmp
      }
    }

    // Idle or final tiebreak: alphabetical
    return a.name.localeCompare(b.name)
  })

  return { props: { people } }
}

export default function PeopleIndex({ people }: PeopleIndexProps) {
  return (
    <>
      <Head>
        <title>People — Stars — Kylin Miao</title>
        <meta name="description" content={`Directory of ${people.length} tracked AI leaders with cross-platform activity from GitHub, Bluesky, X, and YouTube.`} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-white relative font-mono">
        <div className="fixed inset-0 bg-[#050505] -z-10" />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-32 relative z-10">
          
          {/* Nav & Header */}
          <div className="flex items-center justify-between mb-12 text-xs text-gray-500 border-b border-white/5 pb-4">
            <Link href="/stars/" className="hover:text-orange-400 transition-colors flex items-center">
              <span className="text-orange-500/50">~/</span>stars<span className="text-orange-500/50">/</span>people <span className="text-orange-400 ml-2">/</span><span className="ml-2">ls -la</span>
            </Link>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-4 bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              <span className="text-orange-400 text-[10px] uppercase tracking-widest">System.Entity_Registry</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-6 font-sans">Active Targets</h1>
            <div className="text-xs text-gray-500 border-l-2 border-orange-500/30 pl-4 py-1.5 bg-orange-500/5">
              Tracking {people.length} high-value entities across GitHub, Bluesky, X, YouTube, and RSS.
              <br />
              <span className="text-gray-600">Sorted by DeepSeek_Heuristic_Engine v2.1 — composite signal strength.</span>
            </div>
          </div>

          {/* Terminal Table */}
          <div className="overflow-x-auto">
            <div className="flex text-[10px] text-gray-600 border-b border-white/10 pb-2 uppercase tracking-widest mb-4 w-[800px] sm:w-full">
              <div className="w-16 shrink-0">RANK</div>
              <div className="w-56 shrink-0">ENTITY_NAME</div>
              <div className="w-48 shrink-0">VECTORS</div>
              <div className="w-24 shrink-0 text-right pr-4">SIG_STR</div>
              <div className="flex-1 shrink-0">LATEST_SIGNAL</div>
            </div>

            {people.map((person, idx) => {
              const rank = String(idx + 1).padStart(3, '0')
              const signalScore = Math.round(person.activityCount * 1.5 + person.platformCount * 10)

              // Determine active platforms
              const platforms = []
              if (person.github) platforms.push({ id: 'GH', color: 'bg-gray-800 text-gray-400' })
              if (person.bluesky) platforms.push({ id: 'BSKY', color: 'bg-blue-900/30 text-blue-400' })
              if (person.x) platforms.push({ id: 'X', color: 'bg-gray-800 text-gray-300' })
              if (person.youtubeChannel) platforms.push({ id: 'YT', color: 'bg-red-900/30 text-red-400' })
              if (person.blogAuthor) platforms.push({ id: 'BLOG', color: 'bg-emerald-900/30 text-emerald-400' })

              const displayPlatforms = platforms.slice(0, 2)
              const extraPlatforms = platforms.length > 2 ? platforms.length - 2 : 0

              // Signal strength color
              const sigColor = signalScore >= 50
                ? 'text-orange-400'
                : signalScore >= 20
                  ? 'text-yellow-500'
                  : signalScore > 0
                    ? 'text-gray-400'
                    : 'text-gray-600'

              return (
                <Link
                  key={person.id}
                  href={`/stars/people/${person.id}/`}
                  className="flex items-center py-3 hover:bg-white/[0.03] transition-colors border-b border-white/5 w-[800px] sm:w-full group cursor-pointer"
                >
                  <div className="w-16 shrink-0 text-gray-500 text-xs">#{rank}</div>

                  <div className="w-56 shrink-0 flex items-center gap-3">
                    {person.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-6 h-6 rounded-sm grayscale group-hover:grayscale-0 transition-all object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-sm bg-white/10 flex items-center justify-center text-[10px] text-white">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-gray-200 group-hover:text-orange-400 font-bold font-sans truncate w-40">
                        {person.name}
                      </div>
                      <div className="text-[10px] text-gray-600 truncate w-40">
                        {person.github ? `@${person.github}` : person.bluesky ? `@${person.bluesky}` : person.id}
                      </div>
                    </div>
                  </div>

                  <div className="w-48 shrink-0 flex gap-2 items-center">
                    {displayPlatforms.map(p => (
                      <span key={p.id} className={`px-1.5 py-0.5 rounded text-[10px] ${p.color}`}>
                        {p.id}
                      </span>
                    ))}
                    {extraPlatforms > 0 && (
                      <span className="px-1.5 py-0.5 rounded border border-white/10 text-gray-500 text-[10px]">
                        +{extraPlatforms}
                      </span>
                    )}
                  </div>

                  <div className={`w-24 shrink-0 text-right pr-4 text-xs font-bold ${sigColor}`}>
                    {signalScore > 0 ? signalScore : '--'}
                  </div>

                  <div className="flex-1 shrink-0 text-xs text-gray-400 truncate pr-4 group-hover:text-gray-300 transition-colors">
                    {person.activityCount > 0
                      ? `[LOGS] ${person.activityCount} signals`
                      : '[IDLE] No recent activity'}
                  </div>
                </Link>
              )
            })}

            {people.length > 0 && (
              <div className="mt-8 text-gray-600 text-[10px] uppercase tracking-widest pt-4 border-t border-white/10">
                -- EOF --
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
