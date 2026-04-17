/**
 * One-shot backfill: add `score` + `scoreReason` to every existing GitHub star record.
 * - Does NOT call GitHub API (reads only local files).
 * - Only calls DeepSeek for records whose `score` field is missing or 0.
 * - Safe to re-run: idempotent.
 *
 * Usage: npx tsx scripts/backfill-stars-scores.ts
 */
import fs from 'fs'
import path from 'path'

const STARS_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

interface StarRecord {
  repo: string
  url: string
  description: string
  language: string | null
  stargazersCount: number
  starredBy: string
  highlights?: string
  worthReading?: string
  topics?: string[]
  tags?: string[]
  score?: number
  scoreReason?: string
}

async function scoreRepo(star: StarRecord): Promise<{ score: number; scoreReason: string }> {
  const prompt = `You are a senior AI engineer curating a feed of "what top AI leaders are starring on GitHub this week". Score the repository below.

Rubric (sum to 0-10, realistic spread — only truly noteworthy repos get 8+):
- Freshness (0-4): Young/rising repo (low-to-mid star count but clearly gaining traction) scores high; established repo with fresh release scores half; very old/famous repo with no new angle scores 0-1.
- Relevance (0-4): Squarely frontier AI (agents, LLM infra, evals, post-training, multi-modal, AI dev tooling, RAG, agent-harness) scores high; non-AI or general CS utilities score low.
- Concreteness (0-2): Concrete artifact / benchmark / novel approach in description scores high; vague/aspirational/placeholder scores low.

Repository: ${star.repo}
Description: ${star.description || 'No description'}
Language: ${star.language || 'Unknown'}
Topics: ${(star.topics || []).join(', ') || 'None'}
Stars: ${star.stargazersCount}
Starred by: ${star.starredBy}

Respond in JSON: {"score": 7, "scoreReason": "one-sentence justification referencing freshness/relevance/concreteness"}`

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
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`  ⚠️  DeepSeek ${res.status} for ${star.repo}`)
      return { score: 0, scoreReason: '' }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)
    const rawScore = typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score, 10)
    const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(10, Math.round(rawScore))) : 0
    return { score, scoreReason: parsed.scoreReason || '' }
  } catch (err) {
    console.error(`  ❌ error for ${star.repo}:`, err)
    return { score: 0, scoreReason: '' }
  }
}

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY not set.')
    process.exit(1)
  }

  const files = fs.readdirSync(STARS_DIR).filter(f => f.endsWith('.json')).sort()
  console.log(`🌟 Backfilling star scores across ${files.length} files...`)

  let total = 0
  let backfilled = 0
  let skipped = 0
  const histogram: Record<number, number> = {}

  for (const file of files) {
    const filePath = path.join(STARS_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const stars: StarRecord[] = data.stars || []
    let dirty = false

    for (const star of stars) {
      total++
      if (typeof star.score === 'number' && star.score > 0) {
        skipped++
        histogram[star.score] = (histogram[star.score] || 0) + 1
        continue
      }
      const { score, scoreReason } = await scoreRepo(star)
      star.score = score
      star.scoreReason = scoreReason
      dirty = true
      backfilled++
      histogram[score] = (histogram[score] || 0) + 1
      console.log(`  ✓ ${file} :: ${star.repo.slice(0, 50)} by ${star.starredBy} → ${score}/10`)
    }

    if (dirty) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
    }
  }

  console.log(`\n🎉 Done. total=${total} backfilled=${backfilled} skipped=${skipped}`)
  console.log('Score distribution:')
  for (const s of Object.keys(histogram).map(Number).sort((a, b) => a - b)) {
    console.log(`  ${s}/10: ${histogram[s]}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
