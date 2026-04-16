// Discovery — find emerging spec-driven development projects

import type { DiscoveredProject } from '../types'
import {
  FRAMEWORKS,
  DISCOVERY_GITHUB_QUERIES,
  DISCOVERY_MIN_STARS,
  DISCOVERY_MAX_AGE_DAYS,
  DISCOVERY_MAX_RESULTS,
} from '../config'

const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories'

interface GitHubSearchItem {
  full_name: string
  name: string
  description: string | null
  stargazers_count: number
  html_url: string
  language: string | null
  pushed_at: string
}

interface GitHubSearchResponse {
  items: GitHubSearchItem[]
  total_count: number
}

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

/**
 * Discover emerging spec-driven development projects.
 * Searches GitHub, deduplicates against fixed tracking list, caps results.
 */
export async function discoverProjects(): Promise<DiscoveredProject[]> {
  const fixedRepos = new Set(
    FRAMEWORKS
      .filter(f => f.sources.githubRepo)
      .map(f => f.sources.githubRepo!.toLowerCase()),
  )

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - DISCOVERY_MAX_AGE_DAYS)
  const today = new Date().toISOString().slice(0, 10)

  const allDiscovered = new Map<string, DiscoveredProject>()

  // Run all GitHub searches in parallel
  const results = await Promise.allSettled(
    DISCOVERY_GITHUB_QUERIES.map(q => searchGitHub(q)),
  )

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue

    for (const item of result.value.items) {
      const fullName = item.full_name.toLowerCase()

      // Skip if already in fixed list or already discovered
      if (fixedRepos.has(fullName)) continue
      if (allDiscovered.has(fullName)) continue

      // Filter by stars
      if (item.stargazers_count < DISCOVERY_MIN_STARS) continue

      // Filter by recent activity
      const pushedAt = new Date(item.pushed_at)
      if (pushedAt < cutoffDate) continue

      allDiscovered.set(fullName, {
        name: item.name,
        fullName: item.full_name,
        stars: item.stargazers_count,
        description: item.description ?? '',
        url: item.html_url,
        language: item.language ?? '',
        pushedAt: item.pushed_at,
        discoveredAt: today,
        source: 'github',
      })
    }
  }

  // Sort by stars desc, cap at max
  const sorted = Array.from(allDiscovered.values())
    .sort((a, b) => b.stars - a.stars)
    .slice(0, DISCOVERY_MAX_RESULTS)

  console.log(`[discovery] found ${sorted.length} emerging projects (from ${allDiscovered.size} candidates)`)
  return sorted
}

async function searchGitHub(query: string): Promise<GitHubSearchResponse | null> {
  try {
    const url = `${GITHUB_SEARCH_API}?q=${encodeURIComponent(query)}&per_page=30`
    const res = await fetch(url, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[discovery] GitHub search failed: HTTP ${res.status} for query "${query}"`)
      return null
    }

    return await res.json() as GitHubSearchResponse
  } catch (err) {
    console.warn(`[discovery] GitHub search error:`, err)
    return null
  }
}
