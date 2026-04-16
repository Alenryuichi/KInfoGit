// GitHub Stats — fetch repo stats for spec frameworks

import type { GitHubStats } from '../types'
import type { FrameworkConfig } from '../config'

const GITHUB_API = 'https://api.github.com'

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'KInfoGit-Spec-Tracker',
  }
  if (process.env.GITHUB_TOKEN) {
    h['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      console.warn(`[github] ${url}: HTTP ${res.status}`)
      return null
    }
    return await res.json() as T
  } catch (err) {
    console.warn(`[github] ${url} failed:`, err)
    return null
  }
}

interface RepoData {
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
}

interface ReleaseData {
  tag_name: string
  published_at: string
}

interface CommitActivityWeek {
  total: number
  week: number
}

/**
 * Fetch comprehensive GitHub stats for a single repo.
 * Handles 202 retry on commit_activity endpoint.
 */
async function fetchRepoStats(repo: string): Promise<GitHubStats | null> {
  // 1. Basic repo info
  const repoData = await fetchJson<RepoData>(`${GITHUB_API}/repos/${repo}`)
  if (!repoData) return null

  // 2. Latest release (parallel with commit activity)
  const [releases, commitActivity, contribRes] = await Promise.allSettled([
    fetchJson<ReleaseData[]>(`${GITHUB_API}/repos/${repo}/releases?per_page=1`),
    fetchCommitActivity(repo),
    fetchContributorCount(repo),
  ])

  const releaseList = releases.status === 'fulfilled' ? releases.value : null
  const weeklyCommits = commitActivity.status === 'fulfilled' ? (commitActivity.value ?? 0) : 0
  const contributors = contribRes.status === 'fulfilled' ? (contribRes.value ?? 0) : 0

  const latestRelease = releaseList && releaseList.length > 0
    ? { tag: releaseList[0].tag_name, publishedAt: releaseList[0].published_at }
    : undefined

  return {
    repo,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    openIssues: repoData.open_issues_count,
    pushedAt: repoData.pushed_at,
    latestRelease,
    weeklyCommits,
    contributors,
  }
}

/**
 * Fetch weekly commit count. Handles 202 (computing) with one retry.
 */
async function fetchCommitActivity(repo: string): Promise<number> {
  const url = `${GITHUB_API}/repos/${repo}/stats/commit_activity`

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      })

      if (res.status === 202 && attempt === 0) {
        // GitHub is computing stats — wait and retry
        console.log(`[github] ${repo} commit_activity: 202, retrying in 3s...`)
        await new Promise(r => setTimeout(r, 3000))
        continue
      }

      if (!res.ok) return 0

      const weeks = await res.json() as CommitActivityWeek[]
      if (!Array.isArray(weeks) || weeks.length === 0) return 0

      // Return last week's commit count
      return weeks[weeks.length - 1].total
    } catch {
      return 0
    }
  }

  return 0
}

/**
 * Fetch contributor count using Link header pagination trick.
 */
async function fetchContributorCount(repo: string): Promise<number> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${repo}/contributors?per_page=1&anon=true`,
      { headers: headers(), signal: AbortSignal.timeout(15_000) },
    )
    if (!res.ok) return 0

    // Parse Link header for last page number
    const link = res.headers.get('link')
    if (link) {
      const match = link.match(/page=(\d+)>;\s*rel="last"/)
      if (match) return parseInt(match[1], 10)
    }

    // No pagination = only 1 page of results
    const data = await res.json()
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}

/**
 * Fetch GitHub stats for all frameworks with a configured githubRepo.
 */
export async function fetchAllGitHubStats(
  frameworks: FrameworkConfig[],
): Promise<Map<string, GitHubStats>> {
  const withRepo = frameworks.filter(f => f.sources.githubRepo)
  const results = new Map<string, GitHubStats>()

  const settled = await Promise.allSettled(
    withRepo.map(async (fw) => {
      const stats = await fetchRepoStats(fw.sources.githubRepo!)
      if (stats) {
        results.set(fw.id, stats)
        console.log(`[github] ${fw.id}: ${stats.stars}★, ${stats.weeklyCommits} commits/wk`)
      }
    }),
  )

  const failures = settled.filter(r => r.status === 'rejected')
  if (failures.length > 0) {
    console.warn(`[github] ${failures.length} repos failed`)
  }

  return results
}
