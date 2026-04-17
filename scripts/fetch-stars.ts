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
  // High-frequency starrers
  'minimaxir',       // Max Woolf — AI tools & content creator
  'pcuenca',         // Pedro Cuenca — Hugging Face
  'cfahlgren1',      // Caleb Fahlgren — Hugging Face Spaces
  'lucidrains',      // Phil Wang — paper implementations
  'merveenoyan',     // Merve Noyan — Hugging Face DevRel
  'srush',           // Sasha Rush — Cornell, Mamba
  'stas00',          // Stas Bekman — Hugging Face, training
  'younesbelkada',   // Younes Belkada — Hugging Face, PEFT
  'sayakpaul',       // Sayak Paul — Hugging Face, diffusion
  'philschmid',      // Philipp Schmid — Hugging Face, deployment
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
  score: number           // 0–10, integer. Higher = stronger signal.
  scoreReason: string     // One-liner explanation from DeepSeek
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

async function generateCommentary(repo: StarredRepo): Promise<{
  highlights: string
  worthReading: string
  tags: string[]
  score: number
  scoreReason: string
}> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '', tags: [], score: 0, scoreReason: '' }
  }

  const prompt = `You are a senior AI engineer curating a feed of "what top AI leaders are starring on GitHub this week". For the repository below, produce five fields:

1. "highlights": Core value and key features (2-3 sentences, concise).
2. "worthReading": Why it's worth exploring (1-2 sentences).
3. "tags": Pick 1-3 tags from this EXACT list: ${VALID_TAGS.join(', ')}. Return [] if none fit.
4. "score": Integer 0-10 signalling how much attention THIS star deserves in an AI-leader feed. Use the rubric:
   - Freshness (weight 0-4): Is the repo young/rising (low-to-mid stargazer count but clearly gaining traction)? Established (10k+) but releasing something new counts half. Very old/famous repos with no recent angle score 0-1 here.
   - Relevance (weight 0-4): How squarely does it sit in frontier AI topics (agents, LLM infra, evals, post-training, multi-modal, tooling for AI devs, RAG, agent-harness)? Non-AI dev tools or general CS utilities score low.
   - Concreteness (weight 0-2): Does the description signal a real, specific artifact (working code, benchmark, novel approach) vs vague/aspirational/placeholder?
   Sum the three. Clamp to 0-10. Aim for realistic spread — only truly noteworthy repos get 8+.
5. "scoreReason": ONE sentence justifying the score (reference freshness / relevance / concreteness explicitly).

Repository: ${repo.repo}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics.join(', ') || 'None'}
Stars: ${repo.stargazersCount}
Starred by: ${repo.starredBy}

Respond in JSON format: {"highlights": "...", "worthReading": "...", "tags": ["..."], "score": 7, "scoreReason": "..."}`

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
        temperature: 0.4,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`⚠️  DeepSeek API error for ${repo.repo}: ${res.status}`)
      return { highlights: '', worthReading: '', tags: [], score: 0, scoreReason: '' }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)
    const rawTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : []
    const validTags = rawTags.filter((t: string) => (VALID_TAGS as readonly string[]).includes(t))
    const rawScore = typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score, 10)
    const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(10, Math.round(rawScore))) : 0
    return {
      highlights: parsed.highlights || '',
      worthReading: parsed.worthReading || '',
      tags: validTags,
      score,
      scoreReason: parsed.scoreReason || '',
    }
  } catch (err) {
    console.error(`❌ DeepSeek error for ${repo.repo}:`, err)
    return { highlights: '', worthReading: '', tags: [], score: 0, scoreReason: '' }
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
      score: 0,
      scoreReason: '',
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
      // Check if any existing stars need backfill (commentary / tags / score)
      const needsBackfill = DEEPSEEK_API_KEY && existingStars.some(s =>
        (!s.highlights && !s.worthReading) ||
        !s.tags || s.tags.length === 0 ||
        !s.score || s.score === 0
      )
      if (!needsBackfill) {
        console.log(`  📄 ${date}: No new stars (${existingStars.length} existing)`)
        continue
      }
      console.log(`  📄 ${date}: No new stars, backfilling commentary/tags/score for existing`)
    }

    // Generate AI commentary for new stars
    if (DEEPSEEK_API_KEY) {
      console.log(`  🤖 Generating AI commentary for ${newStars.length} repos on ${date}...`)
      for (const star of newStars) {
        const commentary = await generateCommentary(star)
        star.highlights = commentary.highlights
        star.worthReading = commentary.worthReading
        star.tags = commentary.tags
        star.score = commentary.score
        star.scoreReason = commentary.scoreReason
      }
    }

    // Unified backfill for existing stars — single pass, fills whichever fields are missing
    if (DEEPSEEK_API_KEY) {
      for (const star of existingStars) {
        const missingCommentary = !star.highlights && !star.worthReading
        const missingTags = !star.tags || star.tags.length === 0
        const missingScore = !star.score || star.score === 0
        if (!missingCommentary && !missingTags && !missingScore) continue

        const commentary = await generateCommentary(star)
        if (missingCommentary) {
          star.highlights = commentary.highlights
          star.worthReading = commentary.worthReading
        }
        if (missingTags) star.tags = commentary.tags
        if (missingScore) {
          star.score = commentary.score
          star.scoreReason = commentary.scoreReason
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
