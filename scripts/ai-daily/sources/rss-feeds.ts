// AI Daily — RSS feed source

import { RSS_FEEDS } from '../config'
import type { RawNewsItem } from '../types'

/** Max items per feed to avoid ArXiv-scale floods */
const MAX_ITEMS_PER_FEED = 10

/**
 * Fetch AI-specific RSS feeds and extract articles from the last 24 hours.
 */
export async function fetchRssItems(): Promise<RawNewsItem[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 1)

  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchFeed(feed.name, feed.url, cutoff))
  )

  const items: RawNewsItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value)
    }
  }

  console.log(`[rss] ${items.length} items from ${RSS_FEEDS.length} feeds`)
  return items
}

async function fetchFeed(name: string, url: string, since: Date): Promise<RawNewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KInfoGit-AI-Daily',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[rss] ${name}: HTTP ${res.status}`)
      return []
    }

    const xml = await res.text()
    const items = parseXmlItems(xml, name, since).slice(0, MAX_ITEMS_PER_FEED)

    if (items.length > 0) {
      console.log(`[rss] ${name}: ${items.length} items`)
    }

    return items
  } catch (err) {
    console.warn(`[rss] ${name} failed:`, err)
    return []
  }
}

function parseXmlItems(xml: string, sourceName: string, since: Date): RawNewsItem[] {
  const items: RawNewsItem[] = []

  // Match RSS <item> or Atom <entry> blocks
  const entryRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi
  let match: RegExpExecArray | null

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1]

    const title = extractTag(block, 'title')
    const link = extractLink(block)
    const pubDate = extractTag(block, 'pubDate') ||
                    extractTag(block, 'published') ||
                    extractTag(block, 'updated') ||
                    extractTag(block, 'dc:date')
    const summary = extractTag(block, 'description') ||
                    extractTag(block, 'summary') ||
                    extractTag(block, 'content') ||
                    ''

    if (!title || !link) continue

    // Filter by date
    if (pubDate) {
      const d = new Date(pubDate)
      if (!isNaN(d.getTime()) && d < since) continue
    }

    items.push({
      title: stripHtml(title).trim(),
      url: link,
      summary: stripHtml(summary).slice(0, 500).trim(),
      sourceName,
      sourceType: 'rss',
      publishedAt: pubDate || new Date().toISOString(),
    })
  }

  return items
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1]

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

function extractLink(xml: string): string | null {
  // Atom <link href="..."/>
  const atomLink = xml.match(/<link[^>]*href="([^"]+)"[^>]*(?:rel="alternate")?/i)
  if (atomLink) return atomLink[1]

  // RSS <link>...</link>
  const rssLink = extractTag(xml, 'link')
  if (rssLink) return rssLink.trim()

  // <guid> as fallback
  const guid = extractTag(xml, 'guid')
  if (guid && guid.startsWith('http')) return guid

  return null
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
}
