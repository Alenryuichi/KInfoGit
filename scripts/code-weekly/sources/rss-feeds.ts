// RSS/Atom feed parser — fetch company blog articles
import { RSS_FEEDS, type RssFeedConfig, type WeekBounds } from '../config'

export interface RssArticle {
  company: string
  title: string
  url: string
  publishedAt: string
  summary: string
  tags: string[]
}

// Simple XML tag extractor (avoids heavy dependency for SSG build)
// Matches both `<tag>` and namespace-prefixed `<ns:tag>` variants
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(
    `<(?:\\w+:)?${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></(?:\\w+:)?${tag}>` +
    `|<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`,
  )
  const match = xml.match(re)
  const raw = (match?.[1] || match?.[2] || '').trim()
  return decodeXmlEntities(raw)
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function extractItems(xml: string): string[] {
  // RSS <item> or Atom <entry>
  const items: string[] = []
  const rssPattern = /<item>([\s\S]*?)<\/item>/g
  const atomPattern = /<entry>([\s\S]*?)<\/entry>/g

  let m: RegExpExecArray | null
  while ((m = rssPattern.exec(xml)) !== null) items.push(m[1])
  if (items.length === 0) {
    while ((m = atomPattern.exec(xml)) !== null) items.push(m[1])
  }

  return items
}

function extractAtomLink(xml: string): string {
  // Atom <link href="..." rel="alternate"/>
  const match = xml.match(/<link[^>]*href="([^"]*)"[^>]*rel="alternate"[^>]*\/?>/i)
    || xml.match(/<link[^>]*rel="alternate"[^>]*href="([^"]*)"[^>]*\/?>/i)
    || xml.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)
  return match?.[1] || ''
}

function extractDate(itemXml: string): string {
  // RSS: <pubDate>, Atom: <published> or <updated>
  const raw = extractTag(itemXml, 'pubDate')
    || extractTag(itemXml, 'published')
    || extractTag(itemXml, 'updated')
    || ''
  // Some feeds (e.g. Vercel Atom) emit literal "null" — treat as empty
  if (!raw || raw === 'null' || raw === 'undefined') return ''
  return raw
}

async function fetchFeed(feed: RssFeedConfig, bounds: WeekBounds): Promise<RssArticle[]> {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    console.warn(`[rss-feeds] ${feed.company}: HTTP ${res.status}`)
    return []
  }

  const xml = await res.text()
  const items = extractItems(xml).slice(0, 10)

  const articles: RssArticle[] = []

  for (const itemXml of items) {
    const title = extractTag(itemXml, 'title')
    const link = extractTag(itemXml, 'link') || extractAtomLink(itemXml)
    const dateStr = extractDate(itemXml)
    const description = extractTag(itemXml, 'description')
      || extractTag(itemXml, 'summary')
      || extractTag(itemXml, 'content')

    if (!title || !link) continue

    // Filter strictly into the target week. Items with an unparseable
    // date are dropped (used to be kept — that leaked stale content).
    if (!dateStr) continue
    const pub = new Date(dateStr).getTime()
    if (isNaN(pub)) continue
    if (pub < bounds.start.getTime() || pub >= bounds.end.getTime()) continue

    articles.push({
      company: feed.company,
      title,
      url: link,
      publishedAt: dateStr,
      summary: description.replace(/<[^>]*>/g, '').slice(0, 500),
      tags: feed.tags || [],
    })
  }

  return articles
}

export async function fetchRssFeeds(bounds: WeekBounds): Promise<RssArticle[]> {
  const settled = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchFeed(feed, bounds))
  )

  const results: RssArticle[] = []
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(...result.value)
    } else {
      console.warn('[rss-feeds] Failed:', result.reason)
    }
  }

  return results
}
