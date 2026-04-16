// Spec Tracker — shared types

export interface GitHubStats {
  repo: string
  stars: number
  forks: number
  openIssues: number
  pushedAt: string           // ISO date of last push
  latestRelease?: {
    tag: string
    publishedAt: string
  }
  weeklyCommits: number
  contributors: number
}

export interface NpmStats {
  package: string
  latestVersion: string
  weeklyDownloads: number
  lastPublishedAt: string
}

export interface ChangelogEntry {
  version?: string
  date: string
  highlights: string[]
}

export interface SpecFramework {
  id: string
  name: string
  category: 'toolkit' | 'agent-framework' | 'ide' | 'platform' | 'rules'
  description: string
  website?: string
  github?: GitHubStats
  npm?: NpmStats
  changelog?: ChangelogEntry[]
}

export interface DiscoveredProject {
  name: string
  fullName: string           // owner/repo
  stars: number
  description: string
  url: string
  language: string
  pushedAt: string
  discoveredAt: string       // ISO date when first discovered
  source: 'github' | 'npm'
}

export interface SpecSnapshot {
  updatedAt: string          // ISO string
  frameworks: SpecFramework[]
  discovered: DiscoveredProject[]
}

// Trend data for website charts
export interface StarsTrendPoint {
  date: string               // YYYY-MM-DD
  stars: number
}

export interface StarsTrendSeries {
  id: string
  name: string
  points: StarsTrendPoint[]
}
