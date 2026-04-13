import fs from 'fs'
import path from 'path'

// --- Config ---

// Bluesky accounts of AI leaders to monitor
// Only confirmed active accounts — verify at https://bsky.app/profile/{handle}
const BLUESKY_HANDLES = [
  // Extremely active (1000+ posts)
  'simonwillison.net',             // Simon Willison — AI tools blogger
  'markriedl.bsky.social',         // Mark Riedl — Georgia Tech, AI for games/safety
  'sharky6000.bsky.social',        // Marc Lanctot — Google DeepMind, multi-agent RL
  'mmitchell.bsky.social',         // Margaret Mitchell — Hugging Face, AI ethics
  'tdietterich.bsky.social',       // Thomas Dietterich — Oregon State, safe AI/ML
  // Very active
  'natolambert.bsky.social',       // Nathan Lambert — RLHF researcher, interconnects.ai
  'gaelvaroquaux.bsky.social',     // Gaël Varoquaux — scikit-learn co-founder
  'sashamtl.bsky.social',          // Sasha Luccioni — Hugging Face, Climate + AI
  'jeffdean.bsky.social',          // Jeff Dean — Google Chief Scientist
  'hardmaru.bsky.social',          // David Ha — Sakana AI CEO, ex-Google Brain
  'yoshuabengio.bsky.social',      // Yoshua Bengio — Turing Award, Mila
  'lateinteraction.bsky.social',   // Omar Khattab — DSPy/ColBERT creator
  'sarahooker.bsky.social',        // Sara Hooker — Cohere For AI
  'chrisrackauckas.bsky.social',   // Chris Rackauckas — SciML, MIT CSAIL
  // Notable (lower frequency)
  'yann-lecun.bsky.social',        // Yann LeCun — Meta Chief AI Scientist
  'drfeifei.bsky.social',          // Fei-Fei Li — Stanford, AI healthcare
  'karpathy.bsky.social',          // Andrej Karpathy — AI educator
  'clem.hf.co',                    // Clem Delangue — Hugging Face CEO
  'tkipf.bsky.social',             // Thomas Kipf — Google DeepMind, GNNs
  'jonbarron.bsky.social',         // Jon Barron — Google DeepMind, neural rendering
  'phillipisola.bsky.social',      // Phillip Isola — MIT, generative models
]

const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'bluesky-posts')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling',
] as const

// Bluesky public API (no auth required)
const BLUESKY_API_URL = 'https://public.api.bsky.app/xrpc'

// --- Types ---

interface BlueskyAuthor {
  handle: string
  displayName: string
  avatar: string | null
}

interface BlueskyPostData {
  uri: string
  cid: string
  author: BlueskyAuthor
  record: {
    text: string
    createdAt: string
    facets?: any[]
  }
  likeCount: number
  replyCount: number
  repostCount: number
}

interface BlueskyPost {
  uri: string
  url: string
  author: BlueskyAuthor
  content: string
  createdAt: string
  likeCount: number
  replyCount: number
  repostCount: number
  highlights: string
  worthReading: string
  tags: string[]
}

interface DailyBlueskyPosts {
  date: string
  posts: BlueskyPost[]
}

// --- Bluesky API ---

async function fetchAuthorFeed(handle: string, limit: number = 30): Promise<BlueskyPostData[]> {
  const url = `${BLUESKY_API_URL}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&filter=posts_no_replies&limit=${limit}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KInfoGit-Bluesky-Fetcher',
      },
    })

    if (!res.ok) {
      console.warn(`⚠️  Bluesky API error for ${handle}: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    const feedEntries: any[] = data.feed || []

    // Filter out reposts before mapping
    const originalEntries = feedEntries.filter((entry: any) => {
      // Skip reposts (entries with reasonRepost)
      if (entry.reason?.$type === 'app.bsky.feed.defs#reasonRepost') return false
      // Only keep posts from the requested author (safety check)
      if (entry.post?.author?.handle !== handle) return false
      return true
    })

    const filteredCount = feedEntries.length - originalEntries.length
    if (filteredCount > 0) {
      console.log(`     Filtered ${filteredCount} reposts`)
    }

    return originalEntries
      .map((entry: any) => ({
        uri: entry.post.uri,
        cid: entry.post.cid,
        author: {
          handle: entry.post.author.handle,
          displayName: entry.post.author.displayName || entry.post.author.handle,
          avatar: entry.post.author.avatar || null,
        },
        record: entry.post.record,
        likeCount: entry.post.likeCount || 0,
        replyCount: entry.post.replyCount || 0,
        repostCount: entry.post.repostCount || 0,
      }))
      .filter((post: BlueskyPostData) => {
        // Only include posts from last 7 days
        const postDate = new Date(post.record.createdAt)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return postDate >= sevenDaysAgo
      })
  } catch (err) {
    console.error(`❌ Failed to fetch posts for ${handle}:`, err)
    return []
  }
}

// --- DeepSeek API ---

async function generateCommentary(post: BlueskyPost): Promise<{ highlights: string; worthReading: string; tags: string[] }> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '', tags: [] }
  }

  const prompt = `You are a technical reviewer. Given a Bluesky post about AI/tech, provide:
1. "highlights": Core insight or key takeaway (2-3 sentences, concise)
2. "worthReading": Why it's worth exploring (1-2 sentences)
3. "tags": Pick 1-3 tags from this EXACT list that best describe the post: ${VALID_TAGS.join(', ')}. Return an empty array if none fit.

Post Author: ${post.author.displayName} (@${post.author.handle})
Content: ${post.content}
Engagement: ${post.likeCount} likes, ${post.repostCount} reposts

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
      console.warn(`⚠️  DeepSeek API error for ${post.author.handle}: ${res.status}`)
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
    console.error(`❌ DeepSeek error for ${post.author.handle}:`, err)
    return { highlights: '', worthReading: '', tags: [] }
  }
}

// --- Main ---

async function main() {
  console.log('📱 Fetching Bluesky posts from AI leaders...')
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Fetch all posts from all handles
  const allPosts: { postData: BlueskyPostData; createdAt: string }[] = []

  for (const handle of BLUESKY_HANDLES) {
    console.log(`  📥 Fetching posts for ${handle}...`)
    const posts = await fetchAuthorFeed(handle)
    console.log(`     Found ${posts.length} recent posts`)
    for (const post of posts) {
      allPosts.push({
        postData: post,
        createdAt: post.record.createdAt,
      })
    }
  }

  // Keep posts from the last 7 days
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffDate = cutoff.toISOString().split('T')[0]

  const recentPosts = allPosts.filter(item => item.createdAt.split('T')[0] >= cutoffDate)

  if (recentPosts.length === 0) {
    console.log(`No posts found in the last 7 days (since ${cutoffDate}). Done.`)
    return
  }

  console.log(`  📅 Found ${recentPosts.length} posts in the last 7 days`)

  // Group by date
  const byDate = new Map<string, BlueskyPost[]>()
  for (const item of recentPosts) {
    const date = item.createdAt.split('T')[0]
    if (!byDate.has(date)) byDate.set(date, [])

    const postUrl = `https://bsky.app/profile/${item.postData.author.handle}/post/${item.postData.uri.split('/').pop()}`

    byDate.get(date)!.push({
      uri: item.postData.uri,
      url: postUrl,
      author: item.postData.author,
      content: item.postData.record.text,
      createdAt: item.postData.record.createdAt,
      likeCount: item.postData.likeCount,
      replyCount: item.postData.replyCount,
      repostCount: item.postData.repostCount,
      highlights: '',
      worthReading: '',
      tags: [],
    })
  }

  // Process each date
  for (const [date, posts] of byDate) {
    const filePath = path.join(OUTPUT_DIR, `${date}.json`)

    // Merge with existing data if present
    let existingPosts: BlueskyPost[] = []
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailyBlueskyPosts
        existingPosts = existing.posts
      } catch {
        // Ignore parse errors
      }
    }

    // Deduplicate by uri (same post)
    const existingUris = new Set(existingPosts.map(p => p.uri))
    const newPosts = posts.filter(p => !existingUris.has(p.uri))

    if (newPosts.length === 0 && existingPosts.length > 0) {
      console.log(`  📄 ${date}: No new posts (${existingPosts.length} existing)`)
      continue
    }

    // Generate AI commentary for new posts
    if (DEEPSEEK_API_KEY) {
      console.log(`  🤖 Generating AI commentary for ${newPosts.length} posts on ${date}...`)
      for (const post of newPosts) {
        const commentary = await generateCommentary(post)
        post.highlights = commentary.highlights
        post.worthReading = commentary.worthReading
        post.tags = commentary.tags
      }
    }

    // Also generate commentary for existing posts that lack it
    if (DEEPSEEK_API_KEY) {
      for (const post of existingPosts) {
        if (!post.highlights && !post.worthReading) {
          const commentary = await generateCommentary(post)
          post.highlights = commentary.highlights
          post.worthReading = commentary.worthReading
          post.tags = commentary.tags
        }
      }
    }

    // Backfill tags for existing posts that have commentary but no tags
    if (DEEPSEEK_API_KEY) {
      for (const post of existingPosts) {
        if (!post.tags || post.tags.length === 0) {
          const commentary = await generateCommentary(post)
          post.tags = commentary.tags
        }
      }
    }

    const allDayPosts = [...existingPosts, ...newPosts]
    const dailyData: DailyBlueskyPosts = { date, posts: allDayPosts }

    fs.writeFileSync(filePath, JSON.stringify(dailyData, null, 2) + '\n')
    console.log(`  ✅ ${date}: ${allDayPosts.length} posts (${newPosts.length} new)`)
  }

  console.log('🎉 Done!')
}

main().catch(console.error)
