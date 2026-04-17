import fs from 'fs'
import path from 'path'

// --- Config ---

const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'x-signals')
const PEOPLE_JSON_PATH = path.join(__dirname, '..', 'profile-data', 'people.json')

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ''
const EXA_API_KEY = process.env.EXA_API_KEY || ''
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling',
] as const

// --- Types ---

interface Person {
  id: string
  name: string
  x?: string
  avatar?: string
}

interface RawSignal {
  title: string
  url: string
  content: string
  source: 'tavily' | 'exa'
  publishedDate?: string
}

interface XPost {
  type: 'x'
  id: string
  url: string
  author: {
    handle: string
    displayName: string
    avatar: string | null
  }
  content: string
  createdAt: string
  likeCount: number
  replyCount: number
  retweetCount: number
  highlights: string
  worthReading: string
  tags: string[]
}

interface DailyXPosts {
  date: string
  posts: XPost[]
}

// --- Tavily Search ---

async function searchTavily(query: string): Promise<RawSignal[]> {
  if (!TAVILY_API_KEY) return []

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
        days: 7,
        include_domains: ['x.com', 'twitter.com'],
      }),
    })

    if (!res.ok) {
      console.warn(`  ⚠️  Tavily HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as {
      results: Array<{ title: string; url: string; content: string; score: number }>
    }

    return (data.results || [])
      .filter(r => r.score > 0.4)
      .map(r => ({
        title: r.title,
        url: r.url,
        content: r.content.slice(0, 1000),
        source: 'tavily' as const,
      }))
  } catch (err) {
    console.warn('  ⚠️  Tavily error:', err)
    return []
  }
}

// --- Exa Search ---

async function searchExa(query: string): Promise<RawSignal[]> {
  if (!EXA_API_KEY) return []

  const startDate = new Date(Date.now() - 7 * 86400000).toISOString()

  try {
    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXA_API_KEY,
      },
      body: JSON.stringify({
        query,
        numResults: 5,
        type: 'auto',
        contents: { text: { maxCharacters: 500 } },
        startPublishedDate: startDate,
        includeDomains: ['x.com', 'twitter.com'],
      }),
    })

    if (!res.ok) {
      console.warn(`  ⚠️  Exa HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as {
      results: Array<{ title: string; url: string; text?: string; publishedDate?: string }>
    }

    return (data.results || []).map(r => ({
      title: r.title || '',
      url: r.url,
      content: (r.text || '').slice(0, 1000),
      source: 'exa' as const,
      publishedDate: r.publishedDate,
    }))
  } catch (err) {
    console.warn('  ⚠️  Exa error:', err)
    return []
  }
}

// --- DeepSeek: Structure raw signals into XPosts ---

async function structureSignals(
  person: Person,
  signals: RawSignal[]
): Promise<XPost[]> {
  if (!DEEPSEEK_API_KEY || signals.length === 0) return []

  const signalText = signals.map((s, i) =>
    `[${i + 1}] Source: ${s.source}\n    URL: ${s.url}\n    Title: ${s.title}\n    Content: ${s.content.slice(0, 400)}`
  ).join('\n\n')

  const prompt = `You are a technical intelligence analyst. Given search results about ${person.name} (X handle: @${person.x}) from X/Twitter, extract their actual tweets/posts.

SEARCH RESULTS:
${signalText}

INSTRUCTIONS:
1. Identify distinct tweets/posts by ${person.name} from the search results
2. Skip profile pages, reply pages, or content not actually posted by this person
3. Skip results that are clearly about someone else or generic pages
4. For each tweet found, extract the content and any context

Respond in JSON format:
{
  "posts": [
    {
      "url": "the x.com URL of the tweet",
      "content": "the tweet text (reconstruct from search snippet if needed)",
      "estimatedDate": "ISO date string if determinable, or empty string",
      "highlights": "core insight or takeaway (1-2 sentences)",
      "worthReading": "why it matters (1 sentence)",
      "tags": ["pick 1-3 from: ${VALID_TAGS.join(', ')}"]
    }
  ]
}

If no actual tweets by this person are found, return {"posts": []}.`

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
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      console.warn(`  ⚠️  DeepSeek error: ${res.status}`)
      return []
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const parsed = JSON.parse(content)

    const posts: XPost[] = (parsed.posts || []).map((p: any) => {
      const statusMatch = (p.url || '').match(/status\/(\d+)/)
      const id = statusMatch ? statusMatch[1] : `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      const rawTags: string[] = Array.isArray(p.tags) ? p.tags : []
      const validTags = rawTags.filter((t: string) => (VALID_TAGS as readonly string[]).includes(t))

      return {
        type: 'x' as const,
        id,
        url: p.url || `https://x.com/${person.x}`,
        author: {
          handle: person.x || person.id,
          displayName: person.name,
          avatar: person.avatar || null,
        },
        content: p.content || '',
        createdAt: p.estimatedDate || new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        retweetCount: 0,
        highlights: p.highlights || '',
        worthReading: p.worthReading || '',
        tags: validTags,
      }
    })

    return posts
  } catch (err) {
    console.error('  ❌ DeepSeek error:', err)
    return []
  }
}

// --- Deduplication ---

function deduplicatePosts(posts: XPost[]): XPost[] {
  const seen = new Set<string>()
  return posts.filter(p => {
    const key = p.id.startsWith('sig-') ? p.url : p.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// --- Main ---

async function main() {
  console.log('🐦 Fetching X signals via Tavily + Exa search engines...')

  if (!TAVILY_API_KEY && !EXA_API_KEY) {
    console.warn('⚠️  Neither TAVILY_API_KEY nor EXA_API_KEY set. Skipping.')
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    return
  }

  console.log(`  Engines: ${TAVILY_API_KEY ? '✅ Tavily' : '❌ Tavily'} | ${EXA_API_KEY ? '✅ Exa' : '❌ Exa'} | ${DEEPSEEK_API_KEY ? '✅ DeepSeek' : '❌ DeepSeek'}`)

  // Load people with X handles from people.json
  if (!fs.existsSync(PEOPLE_JSON_PATH)) {
    console.warn('⚠️  people.json not found. Skipping.')
    return
  }

  const allPeople = JSON.parse(fs.readFileSync(PEOPLE_JSON_PATH, 'utf-8')) as Person[]
  const xPeople = allPeople.filter(p => p.x)

  if (xPeople.length === 0) {
    console.log('  No people with X handles found in people.json.')
    return
  }

  console.log(`  📋 Found ${xPeople.length} people with X handles`)

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const today = new Date().toISOString().split('T')[0]
  const allPosts: XPost[] = []

  for (const person of xPeople) {
    console.log(`  🔍 @${person.x} (${person.name})...`)

    // Dual engine search in parallel
    const [tavilyResults, exaResults] = await Promise.allSettled([
      searchTavily(person.name),
      searchExa(`${person.name} AI`),
    ])

    const tavilySignals = tavilyResults.status === 'fulfilled' ? tavilyResults.value : []
    const exaSignals = exaResults.status === 'fulfilled' ? exaResults.value : []
    const signals: RawSignal[] = [...tavilySignals, ...exaSignals]

    console.log(`     Tavily: ${tavilySignals.length} | Exa: ${exaSignals.length}`)

    if (signals.length === 0) continue

    // Structure via DeepSeek
    const posts = await structureSignals(person, signals)
    console.log(`     → ${posts.length} posts extracted`)
    allPosts.push(...posts)

    // Rate limit courtesy
    await new Promise(r => setTimeout(r, 300))
  }

  // Deduplicate
  const uniquePosts = deduplicatePosts(allPosts)
  console.log(`\n  📊 Total: ${uniquePosts.length} unique posts (from ${allPosts.length} raw)`)

  if (uniquePosts.length === 0) {
    console.log('  No posts extracted. Done.')
    return
  }

  // Save to date-stamped file, merging with existing
  const outputPath = path.join(OUTPUT_DIR, `${today}.json`)

  let existingPosts: XPost[] = []
  if (fs.existsSync(outputPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      existingPosts = existing.posts || []
    } catch { /* ignore */ }
  }

  const mergedPosts = deduplicatePosts([...uniquePosts, ...existingPosts])

  const dailyData: DailyXPosts = { date: today, posts: mergedPosts }
  fs.writeFileSync(outputPath, JSON.stringify(dailyData, null, 2) + '\n')

  console.log(`  💾 Saved ${mergedPosts.length} posts to x-signals/${today}.json`)
  console.log('🎉 X signals fetch complete!')
}

main().catch(err => {
  console.error('❌ fetch-x-signals failed:', err)
  // Don't exit with error — allow pipeline to continue
})
