// AI Daily — social signal source (reads existing Bluesky + Blog pipeline data)

import fs from 'fs'
import path from 'path'
import { BLUESKY_MIN_LIKES, BLUESKY_AI_KEYWORDS, getTodayInShanghai } from '../config'
import type { RawNewsItem } from '../types'

/**
 * Read today's Bluesky posts and blog posts from existing pipelines,
 * extract high-value AI-related items as social signals.
 */
export function fetchSocialItems(projectRoot: string): RawNewsItem[] {
  const today = getTodayInShanghai()
  const items: RawNewsItem[] = []

  items.push(...readBlueskyPosts(projectRoot, today))
  items.push(...readBlogPosts(projectRoot, today))

  console.log(`[social] ${items.length} items`)
  return items
}

/** Return true iff the URL is a non-empty, parseable http(s) URL. */
function isValidUrl(u: unknown): u is string {
  if (typeof u !== 'string') return false
  const trimmed = u.trim()
  if (!trimmed) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function readBlueskyPosts(projectRoot: string, date: string): RawNewsItem[] {
  const filePath = path.join(projectRoot, 'profile-data', 'bluesky-posts', `${date}.json`)
  if (!fs.existsSync(filePath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const posts = data.posts ?? data ?? []
    if (!Array.isArray(posts)) return []

    const items: RawNewsItem[] = []
    let skippedNoUrl = 0
    for (const post of posts) {
      // Filter: minimum likes
      const likes = post.likeCount ?? 0
      if (likes < BLUESKY_MIN_LIKES) continue

      // Filter: AI-related content
      const text = (post.content ?? '').toLowerCase()
      const isAiRelated = BLUESKY_AI_KEYWORDS.some(kw => text.includes(kw))
      if (!isAiRelated) continue

      // Guard: posts without a valid URL pollute dedup (first empty string
      // consumes the key and later items with empty URL get dropped).
      if (!isValidUrl(post.url)) {
        skippedNoUrl += 1
        continue
      }

      items.push({
        title: (post.content ?? '').slice(0, 100).trim(),
        url: post.url.trim(),
        summary: (post.content ?? '').slice(0, 500).trim(),
        sourceName: `Bluesky:${post.author?.handle ?? 'unknown'}`,
        sourceType: 'social',
        publishedAt: post.createdAt ?? date,
      })
    }

    if (items.length > 0) console.log(`[social] Bluesky: ${items.length} AI posts (likes≥${BLUESKY_MIN_LIKES})`)
    if (skippedNoUrl > 0) console.warn(`[social] Bluesky: skipped ${skippedNoUrl} posts without a valid URL`)
    return items
  } catch {
    return []
  }
}

function readBlogPosts(projectRoot: string, date: string): RawNewsItem[] {
  const filePath = path.join(projectRoot, 'profile-data', 'blog-posts', `${date}.json`)
  if (!fs.existsSync(filePath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const posts = data.posts ?? data ?? []
    if (!Array.isArray(posts)) return []

    const items: RawNewsItem[] = []
    let skippedNoUrl = 0
    for (const post of posts) {
      if (!isValidUrl(post.url)) {
        skippedNoUrl += 1
        continue
      }
      items.push({
        title: post.title ?? post.repo ?? (post.content ?? '').slice(0, 100),
        url: post.url.trim(),
        summary: post.highlights ?? post.description ?? (post.content ?? '').slice(0, 500),
        sourceName: `Blog:${post.author?.displayName ?? post.author?.handle ?? 'unknown'}`,
        sourceType: 'social',
        publishedAt: post.createdAt ?? date,
      })
    }

    if (items.length > 0) console.log(`[social] Blog: ${items.length} posts`)
    if (skippedNoUrl > 0) console.warn(`[social] Blog: skipped ${skippedNoUrl} posts without a valid URL`)
    return items
  } catch {
    return []
  }
}
