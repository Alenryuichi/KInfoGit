import fs from 'fs'
import path from 'path'

// --- Config ---

// NOTE: 14 users × 1 request each = 14 requests per run
// Anonymous GitHub API: 60 req/hr. With GITHUB_TOKEN: 5000 req/hr.
const GITHUB_USERS = [
  // Personal
  'Alenryuichi',
  'yironghuang',
  // AI Leaders
  'karpathy',        // Andrej Karpathy
  'simonw',          // Simon Willison — AI tools blogger, extremely active
  'rasbt',           // Sebastian Raschka — LLMs from Scratch author
  'ggerganov',       // Georgi Gerganov — llama.cpp creator
  'hwchase17',       // Harrison Chase — LangChain founder
  'lilianweng',      // Lilian Weng — ex-OpenAI VP, Lil'Log
  'DrJimFan',        // Jim Fan — NVIDIA, embodied AI
  'tridao',          // Tri Dao — Flash Attention
  'jph00',           // Jeremy Howard — fast.ai
  'thomwolf',        // Thomas Wolf — Hugging Face co-founder
  'soumith',         // Soumith Chintala — PyTorch creator
  'fchollet',        // François Chollet — Keras creator
]
const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling',
] as const

// --- Types ---

interface GitHubStarResponse {
  starred_at: string
  repo: {
    full_name: string
    html_url: string
    description: string | null
    language: string | null
    stargazers_count: number
    topics?: string[]
  }
}

interface StarredRepo {
  repo: string
  url: string
  description: string
  language: string | null
  stargazersCount: number
  starredBy: string
  highlights: string
  worthReading: string
  topics: string[]
  tags: string[]
}

interface DailyStars {
  date: string
  stars: StarredRepo[]
}

// --- GitHub API ---

async function fetchUserStars(username: string): Promise<{ starredAt: string; repo: GitHubStarResponse['repo']; user: string }[]> {
  const url = `https://api.github.com/users/${username}/starred?per_page=30&sort=created&direction=desc`
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.star+json',
    'User-Agent': 'KInfoGit-Stars-Fetcher',
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(url, { headers })

    if (res.status === 403) {
      console.warn(`⚠️  Rate limited for user ${username}, skipping.`)
      return []
    }

    if (!res.ok) {
      console.warn(`⚠️  GitHub API error for ${username}: ${res.status} ${res.statusText}`)
      return []
    }

    const data = (await res.json()) as GitHubStarResponse[]
    return data.map(item => ({
      starredAt: item.starred_at,
      repo: item.repo,
      user: username,
    }))
  } catch (err) {
    console.error(`❌ Failed to fetch stars for ${username}:`, err)
    return []
  }
}

// --- DeepSeek API ---

async function generateCommentary(repo: StarredRepo): Promise<{ highlights: string; worthReading: string; tags: string[] }> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '', tags: [] }
  }

  const prompt = `You are a technical reviewer. Given a GitHub repository, provide:
1. "highlights": Core value and key features of this project (2-3 sentences, concise)
2. "worthReading": Why it's worth exploring (1-2 sentences)
3. "tags": Pick 1-3 tags from this EXACT list that best describe the project: ${VALID_TAGS.join(', ')}. Return an empty array if none fit.

Repository: ${repo.repo}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics.join(', ') || 'None'}
Stars: ${repo.stargazersCount}

Respond in JSON format: {"highlights": "...", "worthReading": "...", "tags": ["..."]}`

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
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`⚠️  DeepSeek API error for ${repo.repo}: ${res.status}`)
      return { highlights: '', worthReading: '', tags: [] }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)
    const rawTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : []
    const validTags = rawTags.filter((t: string) => (VALID_TAGS as readonly string[]).includes(t))
    return {
      highlights: parsed.highlights || '',
      worthReading: parsed.worthReading || '',
      tags: validTags,
    }
  } catch (err) {
    console.error(`❌ DeepSeek error for ${repo.repo}:`, err)
    return { highlights: '', worthReading: '', tags: [] }
  }
}

// --- Main ---

async function main() {
  console.log('🌟 Fetching GitHub stars...')
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Fetch all stars from all users
  const allStars: { starredAt: string; repo: GitHubStarResponse['repo']; user: string }[] = []

  for (const user of GITHUB_USERS) {
    console.log(`  📥 Fetching stars for ${user}...`)
    const stars = await fetchUserStars(user)
    console.log(`     Found ${stars.length} recent stars`)
    allStars.push(...stars)
  }

  // Keep stars from the last 7 days
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffDate = cutoff.toISOString().split('T')[0]

  const recentStars = allStars.filter(item => item.starredAt.split('T')[0] >= cutoffDate)

  if (recentStars.length === 0) {
    console.log(`No stars found in the last 7 days (since ${cutoffDate}). Done.`)
    return
  }

  console.log(`  📅 Found ${recentStars.length} stars in the last 7 days`)

  // Group by date
  const byDate = new Map<string, StarredRepo[]>()
  for (const item of recentStars) {
    const date = item.starredAt.split('T')[0]
    if (!byDate.has(date)) byDate.set(date, [])

    byDate.get(date)!.push({
      repo: item.repo.full_name,
      url: item.repo.html_url,
      description: item.repo.description || '',
      language: item.repo.language,
      stargazersCount: item.repo.stargazers_count,
      starredBy: item.user,
      highlights: '',
      worthReading: '',
      topics: item.repo.topics || [],
      tags: [],
    })
  }

  // Process each date
  for (const [date, stars] of byDate) {
    const filePath = path.join(OUTPUT_DIR, `${date}.json`)

    // Merge with existing data if present
    let existingStars: StarredRepo[] = []
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailyStars
        existingStars = existing.stars
      } catch {
        // Ignore parse errors
      }
    }

    // Deduplicate by repo + starredBy (same person starring same repo)
    const existingKeys = new Set(existingStars.map(s => `${s.repo}::${s.starredBy}`))
    const newStars = stars.filter(s => !existingKeys.has(`${s.repo}::${s.starredBy}`))

    if (newStars.length === 0 && existingStars.length > 0) {
      console.log(`  📄 ${date}: No new stars (${existingStars.length} existing)`)
      continue
    }

    // Generate AI commentary for new stars
    if (DEEPSEEK_API_KEY) {
      console.log(`  🤖 Generating AI commentary for ${newStars.length} repos on ${date}...`)
      for (const star of newStars) {
        const commentary = await generateCommentary(star)
        star.highlights = commentary.highlights
        star.worthReading = commentary.worthReading
        star.tags = commentary.tags
      }
    }

    // Also generate commentary for existing stars that lack it
    if (DEEPSEEK_API_KEY) {
      for (const star of existingStars) {
        if (!star.highlights && !star.worthReading) {
          const commentary = await generateCommentary(star)
          star.highlights = commentary.highlights
          star.worthReading = commentary.worthReading
          star.tags = commentary.tags
        }
      }
    }

    // Backfill tags for existing stars that have commentary but no tags
    if (DEEPSEEK_API_KEY) {
      for (const star of existingStars) {
        if (!star.tags || star.tags.length === 0) {
          const commentary = await generateCommentary(star)
          star.tags = commentary.tags
        }
      }
    }

    const allDayStars = [...existingStars, ...newStars]
    const dailyData: DailyStars = { date, stars: allDayStars }

    fs.writeFileSync(filePath, JSON.stringify(dailyData, null, 2) + '\n')
    console.log(`  ✅ ${date}: ${allDayStars.length} stars (${newStars.length} new)`)
  }

  console.log('🎉 Done!')
}

main().catch(console.error)
