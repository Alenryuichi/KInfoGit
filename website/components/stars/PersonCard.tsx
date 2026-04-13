import Link from 'next/link'
import type { PersonSummary } from '@/lib/people'

interface PersonCardProps {
  person: PersonSummary
}

export function PersonCard({ person }: PersonCardProps) {
  return (
    <Link
      href={`/stars/people/${person.id}/`}
      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        {person.avatar ? (
          <img
            src={person.avatar}
            alt={person.name}
            className="w-10 h-10 rounded-full bg-white/[0.04]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-500 text-sm font-medium">
            {person.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-100 font-semibold text-sm truncate">{person.name}</h3>
          {person.bio && (
            <p className="text-gray-500 text-xs truncate">{person.bio}</p>
          )}
        </div>
      </div>

      {/* Platform badges */}
      <div className="flex flex-wrap gap-1.5">
        {person.github && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-white/[0.04] text-gray-500">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </span>
        )}
        {person.bluesky && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-white/[0.04] text-gray-500">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.574 6.27.581 1.81 2.813 3.268 4.904 2.86-3.522.603-6.649 2.436-2.868 8.32 8.46 3.317 12.066-.625 13.39-3.222C17.324 15.558 18 12.328 18 12.328c.794.423 1.983.698 2.81.698 1.19 0 1.575-.21 2.19-.698.55-.437 1-1.39 1-2.328 0-.862-.18-1.273-.657-1.762C22.67 7.548 20.478 6.478 18 6.478c-1.988 0-4.152 1.488-6 4.322z" />
            </svg>
            Bluesky
          </span>
        )}
        {person.youtubeChannel && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/10 text-red-400">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </span>
        )}
        {person.blogAuthor && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Blog
          </span>
        )}
      </div>

      {/* Activity count */}
      {person.activityCount > 0 && (
        <p className="text-[10px] text-gray-600 mt-2">
          {person.activityCount} recent {person.activityCount === 1 ? 'item' : 'items'}
        </p>
      )}
    </Link>
  )
}
