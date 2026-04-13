import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Star, GitFork, Clock, GitMerge, GitPullRequestDraft } from 'lucide-react'
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar'

const GITHUB_USERNAME = 'Alenryuichi'

// Custom theme matching the site's dark emerald terminal theme
const customTheme: ThemeInput = {
  dark: ['#0a0a0a', '#064e3b', '#047857', '#10b981', '#34d399'],
}

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  pushed_at: string
}

interface GitHubPR {
  id: number
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  merged_at: string | null
  repository_url: string
  user: {
    login: string
  }
}

interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface GitHubActivityProps {
  className?: string
  initialRepos?: GitHubRepo[]
  initialPRs?: GitHubPR[]
  contributionData?: ContributionDay[]
}

// Language color mapping
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#F05138',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mos ago`
  return `${Math.floor(diffDays / 365)} yrs ago`
}

// Extract repo name from repository_url
function getRepoName(repositoryUrl: string): string {
  const parts = repositoryUrl.split('/')
  return parts[parts.length - 1] || ''
}

export function GitHubActivity({ className = '', initialRepos = [], initialPRs = [], contributionData = [] }: GitHubActivityProps) {
  const repos = initialRepos
  const prs = initialPRs
  const loading = false
  const error = initialRepos.length === 0 ? 'No repositories found' : null
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="mb-6 inline-block">
                <p className="font-mono text-emerald-400/80 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse"></span>
                    System.GitHub_Sync
                </p>
                <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Open Source <span className="font-serif italic font-light text-white/70">Activity</span>
            </h2>
          </motion.div>

          {/* Contribution Calendar */}
          {contributionData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 mb-12 shadow-2xl relative overflow-hidden group"
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight">
                  <span className="font-mono text-emerald-400 font-normal">❯_</span>
                  Commit Heatmap
                </h3>
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-400/40 text-white/70 hover:text-emerald-400 transition-all shadow-[0_0_15px_rgba(52,211,153,0)] hover:shadow-[0_0_15px_rgba(52,211,153,0.1)]"
                >
                  [ View_Profile ] <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="overflow-x-auto pb-2 relative z-10">
                <div className="min-w-[750px]">
                  <ActivityCalendar
                    data={contributionData}
                    colorScheme="dark"
                    theme={customTheme}
                    fontSize={12}
                    blockSize={12}
                    blockMargin={4}
                    labels={{
                      totalCount: '{{count}} contributions mapped in the last year',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Repos and PRs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Recent Projects (Repos) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Projects</h3>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#050505] border border-white/5 rounded-xl p-5 animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-white/5 rounded w-full mb-2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center font-mono text-xs text-white/40 py-8 border border-white/5 border-dashed rounded-xl">
                  [ ERROR: {error} ]
                </div>
              ) : (
                <div className="space-y-4">
                  {repos.map((repo, index) => (
                    <motion.a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group block bg-[#050505] border border-white/10 rounded-xl p-5 hover:border-blue-500/30 hover:bg-blue-500/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Hover effect accent line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-mono font-medium group-hover:text-blue-400 transition-colors truncate flex-1 flex items-center gap-2">
                          <span className="text-blue-500/50">~/</span>{repo.name}
                        </h4>
                        <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                      </div>

                      <p className="text-white/50 text-sm mb-4 line-clamp-2 min-h-[40px] font-light leading-relaxed">
                        {repo.description || 'No description available in repository.'}
                      </p>

                      <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          {repo.language && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                                style={{
                                  backgroundColor: languageColors[repo.language] || '#8b8b8b',
                                  color: languageColors[repo.language] || '#8b8b8b'
                                }}
                              />
                              {repo.language}
                            </span>
                          )}
                          {(repo.stargazers_count > 0 || repo.forks_count > 0) && (
                            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                              {repo.stargazers_count > 0 && (
                                <span className="flex items-center gap-1 hover:text-white/80 transition-colors">
                                  <Star className="w-3.5 h-3.5" />
                                  {repo.stargazers_count}
                                </span>
                              )}
                              {repo.forks_count > 0 && (
                                <span className="flex items-center gap-1 hover:text-white/80 transition-colors">
                                  <GitFork className="w-3.5 h-3.5" />
                                  {repo.forks_count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-white/30">
                          {mounted ? formatRelativeTime(repo.pushed_at) : ''}
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Pull Requests */}
            {prs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <GitPullRequestDraft className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Recent Pull Requests</h3>
                </div>

                <div className="space-y-4">
                  {prs.slice(0, 5).map((pr, index) => (
                    <motion.a
                      key={pr.id}
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group block bg-[#050505] border border-white/10 rounded-xl p-5 hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Hover effect accent line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        pr.merged_at ? 'bg-purple-500' : pr.state === 'open' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></div>

                      <div className="flex items-start gap-4">
                        {/* PR Status Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 ${
                          pr.merged_at
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            : pr.state === 'open'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {pr.merged_at ? (
                            <GitMerge className="w-4 h-4" />
                          ) : pr.state === 'open' ? (
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                          ) : (
                            <div className="w-2 h-2 bg-red-400 rounded-full" />
                          )}
                        </div>

                        {/* PR Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/40 font-mono tracking-tight bg-white/5 px-2 py-0.5 rounded">
                                {getRepoName(pr.repository_url)}
                              </span>
                              <span className="text-[10px] text-white/30 font-mono">#{pr.number}</span>
                            </div>
                            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                              pr.merged_at
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : pr.state === 'open'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {pr.merged_at ? 'Merged' : pr.state === 'open' ? 'Open' : 'Closed'}
                            </span>
                          </div>
                          
                          <h4 className="text-white/80 text-sm font-medium group-hover:text-purple-400 transition-colors line-clamp-2 leading-relaxed">
                            {pr.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-[10px] font-mono text-white/30">
                            <span>{mounted ? formatRelativeTime(pr.created_at) : ''}</span>
                            <span className="flex-1"></span>
                            <span className="group-hover:text-purple-400 transition-colors flex items-center gap-1">
                              View Diff <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
