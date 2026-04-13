// Changelog Page — fetch and parse HTML changelog pages
// Lightweight regex-based extraction (no DOM parser dependency)

import { EDITORS } from '../config'

export interface ChangelogEntry {
  editor: string
  version: string
  publishedAt: string
  summary: string
  url: string
}

/**
 * Fetch recent changelog entries (published within last 7 days) for editors
 * that have `changelogUrl` configured.
 */
export async function fetchChangelogEntries(): Promise<ChangelogEntry[]> {
  const editors = EDITORS.filter(e => e.sources.changelogUrl)
  if (editors.length === 0) return []

  const results = await Promise.allSettled(
    editors.map(e => fetchEditorChangelog(e.name, e.sources.changelogUrl!))
  )

  const entries: ChangelogEntry[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      entries.push(...result.value)
    }
  }

  return entries
}

async function fetchEditorChangelog(
  editor: string,
  url: string,
): Promise<ChangelogEntry[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KInfoGit-Code-Weekly',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[changelog] ${editor}: HTTP ${res.status}`)
      return []
    }

    const html = await res.text()
    if (!html || html.length < 100) {
      console.warn(`[changelog] ${editor}: page content too short or empty (possibly JS-rendered)`)
      return []
    }

    const entries = parseChangelogHtml(editor, url, html)
    if (entries.length > 0) {
      console.log(`[changelog] ${editor}: ${entries.length} entries in last 7 days`)
    }
    return entries
  } catch (err) {
    console.warn(`[changelog] ${editor} failed:`, err)
    return []
  }
}

// ─── HTML Parsing ─────────────────────────────────────────

/**
 * Parse changelog entries from HTML. Strategy:
 * 1. Strip HTML tags to get plain text
 * 2. Split on version/date header patterns
 * 3. Filter to last 7 days
 */
function parseChangelogHtml(
  editor: string,
  url: string,
  html: string,
): ChangelogEntry[] {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Strip HTML tags but preserve block-level breaks
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')

  // Match sections that start with a version header and/or date
  // Common patterns:
  //   "v1.2.3 — 2026-04-10"
  //   "Version 1.2.3 (April 10, 2026)"
  //   "2026-04-10" on its own line
  //   "## 1.2.3 - 2026/04/10"
  const headerPattern = /(?:^|\n)\s*(?:#{1,3}\s+)?(?:v(?:ersion)?\s*)?(\d+\.\d+(?:\.\d+)?)?[\s\-—·|]*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi

  const entries: ChangelogEntry[] = []
  const matches: Array<{ version: string; date: Date; index: number }> = []

  let match: RegExpExecArray | null
  while ((match = headerPattern.exec(text)) !== null) {
    const version = match[1] || ''
    const dateStr = match[2]
    const parsed = parseDate(dateStr)

    if (!parsed) {
      console.warn(`[changelog] ${editor}: unparseable date "${dateStr}"`)
      continue
    }

    matches.push({ version, date: parsed, index: match.index })
  }

  // Extract summary text between each header
  for (let i = 0; i < matches.length; i++) {
    const { version, date } = matches[i]

    // Skip entries older than 7 days
    if (date < oneWeekAgo) continue

    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    const body = text.slice(start, end).trim()

    // Take first ~500 chars as summary, skip the header line itself
    const lines = body.split('\n').slice(1).filter(l => l.trim())
    const summary = lines.join('\n').slice(0, 500).trim()

    if (!summary && !version) continue

    entries.push({
      editor,
      version,
      publishedAt: date.toISOString().slice(0, 10),
      summary,
      url,
    })
  }

  // Sort newest first
  entries.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return entries
}

// ─── Date Parsing ─────────────────────────────────────────

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

/** Parse common changelog date formats. Returns Date or null. */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (isoMatch) {
    const d = new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3])
    return isNaN(d.getTime()) ? null : d
  }

  // Month DD, YYYY  (e.g. "April 10, 2026")
  const mdy = dateStr.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/)
  if (mdy) {
    const month = MONTHS[mdy[1].toLowerCase()]
    if (month !== undefined) {
      const d = new Date(+mdy[3], month, +mdy[2])
      return isNaN(d.getTime()) ? null : d
    }
  }

  // DD Month YYYY  (e.g. "10 April 2026")
  const dmy = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/)
  if (dmy) {
    const month = MONTHS[dmy[2].toLowerCase()]
    if (month !== undefined) {
      const d = new Date(+dmy[3], month, +dmy[1])
      return isNaN(d.getTime()) ? null : d
    }
  }

  return null
}
