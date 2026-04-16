import fs from 'fs'
import path from 'path'

// --- Config ---

// X/Twitter accounts of AI leaders to monitor
// Only confirmed active accounts — verify at https://x.com/{handle}
// NOTE: X API v2 requires X_API_KEY in environment
const X_HANDLES = [
  // Extremely active
  'karpathy',                    // Andrej Karpathy — AI educator, ex-Tesla/OpenAI
  'ylecun',                      // Yann LeCun — Meta Chief AI Scientist, Turing Award
  'hardmaru',                    // David Ha — Sakana AI CEO, ex-Google Brain
  'jacksonw27',                  // Jackson Wambugu — AI safety researcher
  // Very active
  'jonathanvmey',                // Jonathan Mey — AI researcher
  'jaimenpulse',                 // Jaimen Pulse — AI/ML thought leader
  'RohanPaul_AI',                // Rohan Paul — AI researcher
  // Active AI researchers & builders
  'ylecun',                      // Yann LeCun — Meta Chief AI Scientist
  'goodfellow_ian',              // Ian Goodfellow — GAN creator, AI safety
  'jacksonw27',                  // Jackson Wambugh — Research labs
  'fchollet',                    // François Chollet — Keras creator
  'EmollickEmily',               // Emily Mollick (if active on X)
  // Additional AI leaders (verify handles on x.com)
]

const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'x-signals')
const X_API_KEY = process.env.X_API_KEY || ''
const X_API_URL = 'https://api.twitter.com/2'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling',
] as const

// --- Types ---

interface XAuthor {
  handle: string
  displayName: string
  avatar: string | null
}

interface XPostData {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    like_count: number
    reply_count: number
    retweet_count: number
  }
}

interface XPostRawData {
  data?: XPostData[]
  includes?: {
    users?: Array<{
      id: string
      username: string
      name: string
      profile_image_url?: string
    }>
  }
}

interface XPost {
  id: string
  url: string
  author: XAuthor
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

// --- X API ---

async function fetchUserPosts(handle: string, limit: number = 30): Promise<XPost[]> {
  if (!X_API_KEY) {
    console.warn(`⚠️  X_API_KEY not set, skipping ${handle}`)
    return []
  }

  try {
    // Get user ID from handle
    const userUrl = `${X_API_URL}/users/by/username/${encodeURIComponent(handle)}`
    const userRes = await fetch(userUrl, {
      headers: {
        'Authorization': `Bearer ${X_API_KEY}`,
        'User-Agent': 'KInfoGit-X-Fetcher',
      },
    })

    if (!userRes.ok) {
      if (userRes.status === 403) {
        console.warn(`⚠️  Rate limited for user ${handle}, skipping.`)
      } else {
        console.warn(`⚠️  X API error getting user ${handle}: ${userRes.status} ${userRes.statusText}`)
      }
      return []
    }

    const userData = await userRes.json()
    const userId = userData.data?.id

    if (!userId) {
      console.warn(`⚠️  Could not find user ID for ${handle}`)
      return []
    }

    // Get user's posts
    const postsUrl = `${X_API_URL}/users/${userId}/tweets?max_results=${Math.min(limit, 100)}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username,name,profile_image_url`

    const postsRes = await fetch(postsUrl, {
      headers: {
        'Authorization': `Bearer ${X_API_KEY}`,
        'User-Agent': 'KInfoGit-X-Fetcher',
      },
    })

    if (!postsRes.ok) {
      console.warn(`⚠️  X API error fetching posts for ${handle}: ${postsRes.status}`)
      return []
    }

    const rawData = await postsRes.json() as XPostRawData
    const posts = rawData.data || []
    const users = rawData.includes?.users || []

    // Filter posts from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.created_at)
      return postDate >= sevenDaysAgo
    })

    // Map to XPost format
    return recentPosts.map(post => {
      const author = users.find(u => u.id === post.author_id)
      return {
        id: post.id,
        url: `https://x.com/${handle}/status/${post.id}`,
        author: {
          handle: author?.username || handle,
          displayName: author?.name || handle,
          avatar: author?.profile_image_url || null,
        },
        content: post.text,
        createdAt: post.created_at,
        likeCount: post.public_metrics.like_count,
        replyCount: post.public_metrics.reply_count,
        retweetCount: post.public_metrics.retweet_count,
        highlights: '',
        worthReading: '',
        tags: [],
      }
    })
  } catch (err) {
    console.error(`❌ Failed to fetch posts for ${handle}:`, err)
    return []
  }
}

// --- DeepSeek API ---

async function generateCommentary(post: XPost): Promise<{ highlights: string; worthReading: string; tags: string[] }> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '', tags: [] }
  }

  const prompt = `You are a technical reviewer. Given an X post about AI/tech, provide:
1. "highlights": Core insight or key takeaway (2-3 sentences, concise)
2. "worthReading": Why it's worth exploring (1-2 sentences)
3. "tags": Pick 1-3 tags from this EXACT list that best describe the post: ${VALID_TAGS.join(', ')}. Return an empty array if none fit.

Post Author: ${post.author.displayName} (@${post.author.handle})
Content: ${post.content}
Engagement: ${post.likeCount} likes, ${post.retweetCount} retweets

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
  console.log('🐦 Fetching X posts from AI leaders...')

  if (!X_API_KEY) {
    console.warn('⚠️  X_API_KEY not set. Set environment variable to enable X signals fetching.')
    console.warn('    For now, creating empty output directory.')
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    return
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Fetch all posts from all handles
  const allPosts: { postData: XPost; createdAt: string }[] = []

  for (const handle of X_HANDLES) {
    console.log(`  📥 Fetching posts for ${handle}...`)
    const posts = await fetchUserPosts(handle)
    console.log(`     Found ${posts.length} recent posts`)
    for (const post of posts) {
      allPosts.push({
        postData: post,
        createdAt: post.createdAt,
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
  const byDate = new Map<string, XPost[]>()
  for (const item of recentPosts) {
    const date = item.createdAt.split('T')[0]
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date)!.push(item.postData)
  }

  // Process each date
  for (const [date, posts] of byDate) {
    const filePath = path.join(OUTPUT_DIR, `${date}.json`)

    // Merge with existing data if present
    let existingPosts: XPost[] = []
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailyXPosts
        existingPosts = existing.posts
      } catch {
        // Ignore parse errors
      }
    }

    // Deduplicate by id (same post)
    const existingIds = new Set(existingPosts.map(p => p.id))
    const newPosts = posts.filter(p => !existingIds.has(p.id))

    if (newPosts.length === 0 && existingPosts.length > 0) {
      const needsBackfill = DEEPSEEK_API_KEY && existingPosts.some(p => !p.tags || p.tags.length === 0)
      if (!needsBackfill) {
        console.log(`  📄 ${date}: No new posts (${existingPosts.length} existing)`)
        continue
      }
      console.log(`  📄 ${date}: No new posts, but backfilling tags for ${existingPosts.filter(p => !p.tags || p.tags.length === 0).length} posts`)
    }

    // Extract tags for new posts
    if (DEEPSEEK_API_KEY) {
      console.log(`  🏷️  Extracting tags for ${newPosts.length} posts on ${date}...`)
      for (const post of newPosts) {
        const commentary = await generateCommentary(post)
        post.highlights = commentary.highlights
        post.worthReading = commentary.worthReading
        post.tags = commentary.tags
      }
    }

    // Backfill tags for existing posts
    if (DEEPSEEK_API_KEY) {
      for (const post of existingPosts) {
        if (!post.tags || post.tags.length === 0) {
          const commentary = await generateCommentary(post)
          post.highlights = commentary.highlights
          post.worthReading = commentary.worthReading
          post.tags = commentary.tags
        }
      }
    }

    const allDayPosts = [...existingPosts, ...newPosts]
    const dailyData: DailyXPosts = { date, posts: allDayPosts }

    fs.writeFileSync(filePath, JSON.stringify(dailyData, null, 2) + '\n')
    console.log(`  ✅ ${date}: ${allDayPosts.length} posts (${newPosts.length} new)`)
  }

  console.log('🎉 Done!')
}

main().catch(console.error)
