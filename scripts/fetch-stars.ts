import fs from 'fs'
import path from 'path'

// --- Config ---

const GITHUB_USERS = ['Alenryuichi', 'karpathy', 'yironghuang']
const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

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

async function generateCommentary(repo: StarredRepo): Promise<{ highlights: string; worthReading: string }> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '' }
  }

  const prompt = `You are a technical reviewer. Given a GitHub repository, provide:
1. "highlights": Core value and key features of this project (2-3 sentences, concise)
2. "worthReading": Why it's worth exploring (1-2 sentences)

Repository: ${repo.repo}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics.join(', ') || 'None'}
Stars: ${repo.stargazersCount}

Respond in JSON format: {"highlights": "...", "worthReading": "..."}`

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
      return { highlights: '', worthReading: '' }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)
    return {
      highlights: parsed.highlights || '',
      worthReading: parsed.worthReading || '',
    }
  } catch (err) {
    console.error(`❌ DeepSeek error for ${repo.repo}:`, err)
    return { highlights: '', worthReading: '' }
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

  if (allStars.length === 0) {
    console.log('No stars found. Done.')
    return
  }

  // Group by date
  const byDate = new Map<string, StarredRepo[]>()

  for (const item of allStars) {
    const date = item.starredAt.split('T')[0]
    if (!byDate.has(date)) {
      byDate.set(date, [])
    }

    const star: StarredRepo = {
      repo: item.repo.full_name,
      url: item.repo.html_url,
      description: item.repo.description || '',
      language: item.repo.language,
      stargazersCount: item.repo.stargazers_count,
      starredBy: item.user,
      highlights: '',
      worthReading: '',
      topics: item.repo.topics || [],
    }

    byDate.get(date)!.push(star)
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

    // Deduplicate by repo name
    const repoSet = new Set(existingStars.map(s => s.repo))
    const newStars = stars.filter(s => !repoSet.has(s.repo))

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
      }
    }

    // Also generate commentary for existing stars that lack it
    if (DEEPSEEK_API_KEY) {
      for (const star of existingStars) {
        if (!star.highlights && !star.worthReading) {
          const commentary = await generateCommentary(star)
          star.highlights = commentary.highlights
          star.worthReading = commentary.worthReading
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
