/**
 * One-shot backfill: add `tags: string[]` to every existing YouTube video JSON.
 * - Does NOT call YouTube API (uses only local files).
 * - Only calls DeepSeek for videos whose `tags` field is missing or empty.
 * - Safe to re-run: idempotent.
 *
 * Usage: npx tsx scripts/backfill-youtube-tags.ts
 */
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'youtube-videos')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling',
] as const

interface YouTubeVideoData {
  videoId: string
  title: string
  description: string
  channelTitle: string
  publishedAt: string
  thumbnail: string
  viewCount: number
  url: string
  highlights: string
  worthReading: string
  tags?: string[]
}

async function extractTags(video: YouTubeVideoData): Promise<string[]> {
  const prompt = `You are a technical reviewer. Pick 1-3 tags from this EXACT list that best describe the YouTube video: ${VALID_TAGS.join(', ')}. Return an empty array if none fit.

Video Title: ${video.title}
Channel: ${video.channelTitle}
Description: ${(video.description || '').slice(0, 500)}

Respond in JSON format: {"tags": ["..."]}`

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
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`  ⚠️  DeepSeek ${res.status} for "${video.title}"`)
      return []
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)
    const rawTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : []
    return rawTags.filter((t: string) => (VALID_TAGS as readonly string[]).includes(t))
  } catch (err) {
    console.error(`  ❌ error for "${video.title}":`, err)
    return []
  }
}

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY not set.')
    process.exit(1)
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json')).sort()
  console.log(`🎬 Backfilling YouTube tags across ${files.length} files...`)

  let totalVideos = 0
  let backfilled = 0
  let skipped = 0

  for (const file of files) {
    const filePath = path.join(OUTPUT_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const videos: YouTubeVideoData[] = data.videos || []
    let dirty = false

    for (const video of videos) {
      totalVideos++
      if (Array.isArray(video.tags) && video.tags.length > 0) {
        skipped++
        continue
      }
      const tags = await extractTags(video)
      video.tags = tags
      dirty = true
      backfilled++
      console.log(`  ✓ ${file} :: ${video.title.slice(0, 60)} → [${tags.join(', ') || '—'}]`)
    }

    if (dirty) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
    }
  }

  console.log(`\n🎉 Done. total=${totalVideos} backfilled=${backfilled} skipped=${skipped}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
