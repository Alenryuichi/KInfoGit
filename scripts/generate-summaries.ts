import fs from 'fs'
import path from 'path'

// --- Config ---

const GITHUB_STARS_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const BLUESKY_POSTS_DIR = path.join(__dirname, '..', 'profile-data', 'bluesky-posts')
const SUMMARIES_DIR = path.join(__dirname, '..', 'profile-data', 'daily-summaries')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// --- Types ---

interface DailySummary {
  date: string
  summary: string
}

// --- Helpers ---

function collectAllDates(): string[] {
  const dates = new Set<string>()

  for (const dir of [GITHUB_STARS_DIR, BLUESKY_POSTS_DIR]) {
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (match) dates.add(match[1])
    }
  }

  return Array.from(dates).sort()
}

function loadDayContent(date: string): string {
  const parts: string[] = []

  // GitHub stars
  const starsFile = path.join(GITHUB_STARS_DIR, `${date}.json`)
  if (fs.existsSync(starsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(starsFile, 'utf-8'))
      for (const star of data.stars || []) {
        parts.push(`[GitHub Star] ${star.repo} — ${star.description || 'No description'} (${star.language || 'unknown'}, ⭐${star.stargazersCount}, starred by ${star.starredBy})`)
      }
    } catch { /* skip */ }
  }

  // Bluesky posts
  const postsFile = path.join(BLUESKY_POSTS_DIR, `${date}.json`)
  if (fs.existsSync(postsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(postsFile, 'utf-8'))
      for (const post of data.posts || []) {
        const text = post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content
        parts.push(`[Bluesky Post] ${post.author.displayName} (@${post.author.handle}): ${text}`)
      }
    } catch { /* skip */ }
  }

  return parts.join('\n')
}

async function generateSummary(date: string, content: string): Promise<string> {
  const prompt = `You are a tech news editor. Given today's collection of GitHub starred repos and Bluesky posts from AI leaders, write a concise daily overview (3-5 sentences). Highlight the key themes, notable projects, and interesting discussions. Be specific about what's trending. Write in a professional but engaging tone.

Date: ${date}

Today's content:
${content}

Write the overview directly, no title or prefix needed.`

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!res.ok) {
      console.warn(`⚠️  DeepSeek API error for ${date}: ${res.status}`)
      return ''
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
  } catch (err) {
    console.error(`❌ DeepSeek error for ${date}:`, err)
    return ''
  }
}

// --- Main ---

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.log('⚠️  No DEEPSEEK_API_KEY set, skipping summary generation.')
    return
  }

  console.log('📝 Generating daily summaries...')
  fs.mkdirSync(SUMMARIES_DIR, { recursive: true })

  const dates = collectAllDates()

  for (const date of dates) {
    const filePath = path.join(SUMMARIES_DIR, `${date}.json`)

    // Skip if summary already exists
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailySummary
        if (existing.summary) {
          console.log(`  📄 ${date}: Summary exists, skipping`)
          continue
        }
      } catch { /* regenerate */ }
    }

    const content = loadDayContent(date)
    if (!content) {
      console.log(`  📄 ${date}: No content, skipping`)
      continue
    }

    console.log(`  🤖 Generating summary for ${date}...`)
    const summary = await generateSummary(date, content)

    if (summary) {
      const data: DailySummary = { date, summary }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
      console.log(`  ✅ ${date}: Summary generated`)
    }
  }

  console.log('🎉 Done!')
}

main().catch(console.error)
