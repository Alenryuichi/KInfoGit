import { useEffect, useState, Component, ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Github, ExternalLink, Star, GitFork, Clock, AlertCircle } from 'lucide-react'

// Error Boundary for GitHub Calendar
interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class CalendarErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Dynamic import to avoid SSR hydration issues
const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then((mod) => mod.GitHubCalendar),
  { ssr: false, loading: () => <div className="h-32 bg-gray-800/50 rounded animate-pulse" /> }
)

const GITHUB_USERNAME = 'Alenryuichi'

// Custom theme matching the site's dark theme
const customTheme = {
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
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

interface GitHubActivityProps {
  className?: string
  initialRepos?: GitHubRepo[]
  initialPRs?: GitHubPR[]
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Extract repo name from repository_url
function getRepoName(repositoryUrl: string): string {
  const parts = repositoryUrl.split('/')
  return parts[parts.length - 1] || ''
}

export function GitHubActivity({ className = '', initialRepos = [], initialPRs = [] }: GitHubActivityProps) {
  // Use initialRepos and initialPRs from getStaticProps (fetched at build time)
  const repos = initialRepos
  const prs = initialPRs
  const loading = false
  const error = initialRepos.length === 0 ? 'No repositories found' : null
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Github className="w-8 h-8 text-white" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                GitHub Activity
              </h2>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              My open source contributions and coding activity
            </p>
          </motion.div>

          {/* Contribution Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                Contribution Graph
              </h3>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                View Profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[750px]">
                <CalendarErrorBoundary
                  fallback={
                    <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                      <AlertCircle className="w-5 h-5" />
                      <span>Unable to load contribution graph. </span>
                      <a
                        href={`https://github.com/${GITHUB_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View on GitHub
                      </a>
                    </div>
                  }
                >
                  <GitHubCalendar
                    username={GITHUB_USERNAME}
                    colorScheme="dark"
                    theme={customTheme}
                    fontSize={12}
                    blockSize={12}
                    blockMargin={4}
                    labels={{
                      totalCount: '{{count}} contributions in the last year',
                    }}
                  />
                </CalendarErrorBoundary>
              </div>
            </div>
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Projects
              </h3>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 animate-pulse"
                  >
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-700 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-gray-400 py-8">
                Failed to load repositories
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repos.map((repo, index) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-gray-900/70 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors truncate flex-1">
                        {repo.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {repo.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: languageColors[repo.language] || '#8b8b8b',
                              }}
                            />
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            {repo.stargazers_count}
                          </span>
                        )}
                        {repo.forks_count > 0 && (
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3.5 h-3.5" />
                            {repo.forks_count}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600">
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
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-purple-400" />
                  Recent Pull Requests
                </h3>
              </div>

              <div className="space-y-3">
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
                    className="group flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-900/70 transition-all duration-300"
                  >
                    {/* PR Status Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      pr.merged_at
                        ? 'bg-purple-500/20 text-purple-400'
                        : pr.state === 'open'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pr.merged_at ? (
                        <GitFork className="w-4 h-4" />
                      ) : pr.state === 'open' ? (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                      )}
                    </div>

                    {/* PR Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {getRepoName(pr.repository_url)}
                        </span>
                        <span className="text-xs text-gray-600">#{pr.number}</span>
                      </div>
                      <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                        {pr.title}
                      </h4>
                    </div>

                    {/* Time & Status */}
                    <div className="flex-shrink-0 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pr.merged_at
                          ? 'bg-purple-500/20 text-purple-400'
                          : pr.state === 'open'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}>
                        {pr.merged_at ? 'Merged' : pr.state === 'open' ? 'Open' : 'Closed'}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {mounted ? formatRelativeTime(pr.created_at) : ''}
                      </p>
                    </div>

                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  )
}

