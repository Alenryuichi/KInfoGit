// AI Daily — shared types

export interface RawNewsItem {
  title: string
  url: string
  summary: string
  sourceName: string         // e.g. "ArXiv", "Tavily", "Bluesky"
  sourceType: 'rss' | 'search' | 'social' | 'horizon'
  publishedAt: string        // ISO date or date string
}

export interface ScoredItem extends RawNewsItem {
  score: number              // 0-10
  category: 'breaking' | 'research' | 'release' | 'insight'
  aiRelevant: boolean
  oneLiner: string           // Chinese one-line summary
}

// Output format — compatible with existing DailyDigest
export interface NewsSource {
  name: string
  meta?: string
}

export interface NewsItem {
  title: string
  summary: string
  url: string
  score: number
  sources: NewsSource[]
  tags: string[]
  focusTopics: string[]
}

export interface DigestSection {
  id: string
  title: string
  items: NewsItem[]
}

export interface DailyDigest {
  date: string
  itemCount: number
  sections: DigestSection[]
  aiSummary?: string | null
}
