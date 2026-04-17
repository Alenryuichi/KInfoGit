// AI Daily — Horizon source (reads HN-sourced markdown summaries)

import fs from 'fs'
import path from 'path'
import type { RawNewsItem } from '../types'

/**
 * Read today's Horizon markdown summary and parse items.
 * Horizon provides HN-sourced tech news with scores.
 */
export function fetchHorizonItems(projectRoot: string): RawNewsItem[] {
  const today = new Date().toISOString().slice(0, 10)
  const summariesDir = path.join(projectRoot, 'tools', 'horizon', 'repo', 'data', 'summaries')
  const filePath = path.join(summariesDir, `horizon-${today}-en.md`)

  if (!fs.existsSync(filePath)) {
    console.log(`[horizon] No summary for ${today}`)
    return []
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const items = parseHorizonMarkdown(content)
    console.log(`[horizon] ${items.length} items from ${today}`)
    return items
  } catch (err) {
    console.warn(`[horizon] Failed to parse:`, err)
    return []
  }
}

function parseHorizonMarkdown(content: string): RawNewsItem[] {
  const lines = content.split('\n')
  const itemRegex = /^## \[(.+?)\]\((.+?)\)\s*⭐️\s*([\d.]+)\/10/
  const items: RawNewsItem[] = []

  let currentTitle = ''
  let currentUrl = ''
  let currentScore = 0
  let summaryLines: string[] = []

  function flushItem() {
    if (currentTitle && currentUrl) {
      items.push({
        title: currentTitle,
        url: currentUrl,
        summary: summaryLines.join(' ').trim().slice(0, 500),
        sourceName: `HN (${currentScore.toFixed(1)})`,
        sourceType: 'horizon',
        publishedAt: new Date().toISOString(),
      })
    }
    currentTitle = ''
    currentUrl = ''
    currentScore = 0
    summaryLines = []
  }

  for (const line of lines) {
    const match = line.match(itemRegex)
    if (match) {
      flushItem()
      currentTitle = match[1]
      currentUrl = match[2]
      currentScore = parseFloat(match[3])
      continue
    }

    if (!currentTitle) continue

    // Skip metadata lines
    if (line.startsWith('**Tags**:') || line.startsWith('**Background**:') ||
        line.startsWith('**Discussion**:') || line.startsWith('<') ||
        line === '---' || /^\d+\.\s*\[/.test(line) || line.startsWith('> ')) {
      continue
    }

    // Skip source lines (pattern: "word · word · date")
    if (/^\w+\s*·\s*.+$/.test(line) && !line.startsWith('**')) continue

    if (line.trim()) {
      summaryLines.push(line.trim())
    }
  }

  flushItem()
  return items
}
