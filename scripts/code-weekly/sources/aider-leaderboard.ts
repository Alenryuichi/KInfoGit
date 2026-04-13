// Aider Leaderboard — code editing benchmark data
// Primary: GitHub YAML (official source of truth)
// Fallback: HTML scraping of aider.chat

export interface AiderEntry {
  model: string
  passRate: number
}

// ─── GitHub YAML (primary) ────────────────────────────────

const AIDER_YAML_URL =
  'https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml'

/** Minimal YAML parser — handles the flat list-of-objects format used by Aider. */
function parseSimpleYaml(yaml: string): Array<Record<string, string>> {
  const items: Array<Record<string, string>> = []
  let current: Record<string, string> | null = null

  for (const line of yaml.split('\n')) {
    const trimmed = line.trimEnd()
    if (trimmed.startsWith('- ')) {
      // New item
      if (current) items.push(current)
      current = {}
      const kv = trimmed.slice(2).match(/^(\w[\w_]*):\s*(.*)$/)
      if (kv) current[kv[1]] = kv[2].trim()
    } else if (trimmed.startsWith('  ') && current) {
      const kv = trimmed.match(/^\s+(\w[\w_]*):\s*(.*)$/)
      if (kv) current[kv[1]] = kv[2].trim()
    }
  }
  if (current) items.push(current)

  return items
}

async function fetchFromGitHubYaml(): Promise<AiderEntry[]> {
  try {
    const res = await fetch(AIDER_YAML_URL, {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[aider] GitHub YAML HTTP ${res.status}`)
      return []
    }

    const yaml = await res.text()
    const items = parseSimpleYaml(yaml)

    const entries: AiderEntry[] = []
    const seen = new Set<string>()

    for (const item of items) {
      const model = (item.model || '').replace(/^["']|["']$/g, '')
      const passRateStr = item.pass_rate_2 || item.pass_rate || ''
      const passRate = parseFloat(passRateStr)

      if (model && !isNaN(passRate) && passRate >= 0 && passRate <= 100 && !seen.has(model)) {
        seen.add(model)
        entries.push({ model, passRate })
      }
    }

    const sorted = entries.sort((a, b) => b.passRate - a.passRate).slice(0, 30)
    if (sorted.length > 0) {
      console.log(`[aider] GitHub YAML: ${sorted.length} models loaded`)
    }
    return sorted
  } catch (err) {
    console.warn('[aider] GitHub YAML failed:', err)
    return []
  }
}

// ─── HTML scraping fallback ───────────────────────────────

/** Decode common HTML entities */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

async function fetchFromHtml(): Promise<AiderEntry[]> {
  try {
    const res = await fetch('https://aider.chat/docs/leaderboards/', {
      headers: { 'User-Agent': 'KInfoGit-Code-Weekly' },
    })

    if (!res.ok) {
      console.warn(`[aider] HTML fetch HTTP ${res.status}`)
      return []
    }

    const html = await res.text()
    const entries: AiderEntry[] = []
    const seen = new Set<string>()

    const rowPattern = /<tr\s+id="main-row-\d+"[^>]*>([\s\S]*?)<\/tr>/g
    let rowMatch: RegExpExecArray | null

    while ((rowMatch = rowPattern.exec(html)) !== null) {
      const rowHtml = rowMatch[1]
      const modelSpanMatch = rowHtml.match(/<td[^>]*>\s*<span>([^<]+)<\/span>\s*<\/td>/)
      const barCellMatch = rowHtml.match(/<td\s+class="bar-cell">\s*[\s\S]*?<span>([\d.]+)%<\/span>\s*<\/td>/)

      if (modelSpanMatch && barCellMatch) {
        const model = decodeEntities(modelSpanMatch[1].trim())
        const passRate = parseFloat(barCellMatch[1])

        if (model && !seen.has(model) && passRate >= 0 && passRate <= 100) {
          seen.add(model)
          entries.push({ model, passRate })
        }
      }
    }

    const sorted = entries.sort((a, b) => b.passRate - a.passRate).slice(0, 20)
    if (sorted.length > 0) {
      console.log(`[aider] HTML fallback: ${sorted.length} models loaded`)
    }
    return sorted
  } catch (err) {
    console.warn('[aider] HTML fallback failed:', err)
    return []
  }
}

// ─── Public API ───────────────────────────────────────────

export async function fetchAiderLeaderboard(): Promise<AiderEntry[]> {
  const yaml = await fetchFromGitHubYaml()
  if (yaml.length > 0) return yaml

  console.warn('[aider] GitHub YAML failed, trying HTML fallback')
  const html = await fetchFromHtml()
  if (html.length > 0) return html

  console.warn('[aider] All aider sources failed')
  return []
}
