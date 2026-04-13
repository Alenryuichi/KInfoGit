import fs from 'fs'
import path from 'path'

// --- Config ---

const PEOPLE_JSON_PATH = path.join(__dirname, '..', 'profile-data', 'people.json')
const GITHUB_STARS_DIR = path.join(__dirname, '..', 'profile-data', 'github-stars')
const BLUESKY_POSTS_DIR = path.join(__dirname, '..', 'profile-data', 'bluesky-posts')
const YOUTUBE_VIDEOS_DIR = path.join(__dirname, '..', 'profile-data', 'youtube-videos')
const BLOG_POSTS_DIR = path.join(__dirname, '..', 'profile-data', 'blog-posts')
const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'people-activity')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// --- Types ---

interface Person {
  id: string
  name: string
  bio?: string
  github?: string
  bluesky?: string
  youtubeChannel?: string
  blogAuthor?: string
  avatar?: string
}

interface StarredRepo {
  type?: string
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

interface BlueskyPost {
  type?: string
  uri: string
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
  repostCount: number
  highlights: string
  worthReading: string
}

interface YouTubeVideo {
  type?: string
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
}

interface BlogPost {
  type?: string
  title: string
  url: string
  author: string
  publishedAt: string
  summary: string
  highlights: string
  worthReading: string
}

interface PersonActivity {
  id: string
  stars: StarredRepo[]
  posts: BlueskyPost[]
  videos: YouTubeVideo[]
  blogs: BlogPost[]
  dailyCounts: number[]
  interestSummary: string
}

// --- Helpers ---

function getDateRange(days: number): { start: string; dates: string[] } {
  const now = new Date()
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return { start: dates[0], dates }
}

function loadJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return null
  }
}

// --- DeepSeek API ---

async function generateInterestSummary(
  person: Person,
  stars: StarredRepo[],
  posts: BlueskyPost[]
): Promise<string> {
  if (!DEEPSEEK_API_KEY) return ''
  if (stars.length === 0 && posts.length === 0) return ''

  const starDescriptions = stars.slice(0, 15).map(s =>
    `- ${s.repo}: ${s.description || 'No description'}`
  ).join('\n')

  const postDescriptions = posts.slice(0, 15).map(p =>
    `- ${p.content.slice(0, 200)}`
  ).join('\n')

  const prompt = `Given this person's recent activity, write a 1-2 sentence summary of their recent interests and focus areas.

Person: ${person.name}
Bio: ${person.bio || 'N/A'}

Recent GitHub stars (${stars.length} total):
${starDescriptions || 'None'}

Recent Bluesky posts (${posts.length} total):
${postDescriptions || 'None'}

Respond with ONLY the 1-2 sentence summary, no quotes or prefixes.`

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
        max_tokens: 150,
      }),
    })

    if (!res.ok) {
      console.warn(`⚠️  DeepSeek API error for ${person.id}: ${res.status}`)
      return ''
    }

    const data = await res.json()
    return (data.choices?.[0]?.message?.content || '').trim()
  } catch (err) {
    console.error(`❌ DeepSeek error for ${person.id}:`, err)
    return ''
  }
}

// --- Main ---

async function main() {
  console.log('👥 Generating people activity data...')

  // Load people registry
  if (!fs.existsSync(PEOPLE_JSON_PATH)) {
    console.warn('⚠️  people.json not found, skipping.')
    return
  }

  const people = JSON.parse(fs.readFileSync(PEOPLE_JSON_PATH, 'utf-8')) as Person[]
  console.log(`  📋 Found ${people.length} people`)

  // Compute 30-day date range
  const { dates } = getDateRange(30)
  const dateSet = new Set(dates)

  // Load all GitHub stars and Bluesky posts within the date range
  const allStarsByDate = new Map<string, StarredRepo[]>()
  const allPostsByDate = new Map<string, BlueskyPost[]>()
  const allVideosByDate = new Map<string, YouTubeVideo[]>()
  const allBlogsByDate = new Map<string, BlogPost[]>()

  if (fs.existsSync(GITHUB_STARS_DIR)) {
    const files = fs.readdirSync(GITHUB_STARS_DIR).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const date = file.replace('.json', '')
      if (!dateSet.has(date)) continue
      const data = loadJsonFile<{ date: string; stars: StarredRepo[] }>(
        path.join(GITHUB_STARS_DIR, file)
      )
      if (data?.stars) {
        allStarsByDate.set(date, data.stars.map(s => ({ ...s, type: 'github' })))
      }
    }
  }

  if (fs.existsSync(BLUESKY_POSTS_DIR)) {
    const files = fs.readdirSync(BLUESKY_POSTS_DIR).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const date = file.replace('.json', '')
      if (!dateSet.has(date)) continue
      const data = loadJsonFile<{ date: string; posts: BlueskyPost[] }>(
        path.join(BLUESKY_POSTS_DIR, file)
      )
      if (data?.posts) {
        allPostsByDate.set(date, data.posts.map(p => ({ ...p, type: 'bluesky' })))
      }
    }
  }

  if (fs.existsSync(YOUTUBE_VIDEOS_DIR)) {
    const files = fs.readdirSync(YOUTUBE_VIDEOS_DIR).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const date = file.replace('.json', '')
      const data = loadJsonFile<{ date: string; videos: YouTubeVideo[] }>(
        path.join(YOUTUBE_VIDEOS_DIR, file)
      )
      if (data?.videos) {
        allVideosByDate.set(date, data.videos.map(v => ({ ...v, type: 'youtube' })))
      }
    }
  }

  if (fs.existsSync(BLOG_POSTS_DIR)) {
    const files = fs.readdirSync(BLOG_POSTS_DIR).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const date = file.replace('.json', '')
      const data = loadJsonFile<{ date: string; posts: BlogPost[] }>(
        path.join(BLOG_POSTS_DIR, file)
      )
      if (data?.posts) {
        allBlogsByDate.set(date, data.posts.map(b => ({ ...b, type: 'blog' })))
      }
    }
  }

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Process each person
  for (const person of people) {
    const personStars: StarredRepo[] = []
    const personPosts: BlueskyPost[] = []
    const personVideos: YouTubeVideo[] = []
    const personBlogs: BlogPost[] = []
    const dailyCounts = new Array(30).fill(0)

    // Collect stars
    if (person.github) {
      for (const [date, stars] of allStarsByDate) {
        const matched = stars.filter(s => s.starredBy === person.github)
        personStars.push(...matched)
        const dayIndex = dates.indexOf(date)
        if (dayIndex >= 0) {
          dailyCounts[dayIndex] += matched.length
        }
      }
    }

    // Collect posts
    if (person.bluesky) {
      for (const [date, posts] of allPostsByDate) {
        const matched = posts.filter(p => p.author.handle === person.bluesky)
        personPosts.push(...matched)
        const dayIndex = dates.indexOf(date)
        if (dayIndex >= 0) {
          dailyCounts[dayIndex] += matched.length
        }
      }
    }

    // Collect videos
    if (person.youtubeChannel) {
      for (const [, videos] of allVideosByDate) {
        const matched = videos.filter(v => v.channelTitle === person.youtubeChannel)
        personVideos.push(...matched)
      }
    }

    // Collect blogs
    if (person.blogAuthor) {
      for (const [, blogs] of allBlogsByDate) {
        const matched = blogs.filter(b => b.author === person.blogAuthor)
        personBlogs.push(...matched)
      }
    }

    // Generate AI interest summary
    const interestSummary = await generateInterestSummary(person, personStars, personPosts)

    const activity: PersonActivity = {
      id: person.id,
      stars: personStars,
      posts: personPosts,
      videos: personVideos,
      blogs: personBlogs,
      dailyCounts,
      interestSummary,
    }

    const outputPath = path.join(OUTPUT_DIR, `${person.id}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(activity, null, 2) + '\n')
    const total = personStars.length + personPosts.length + personVideos.length + personBlogs.length
    console.log(`  ✅ ${person.id}: ${personStars.length} stars, ${personPosts.length} posts, ${personVideos.length} videos, ${personBlogs.length} blogs`)
  }

  console.log('🎉 People data generation complete!')
}

main().catch(err => {
  console.error('❌ generate-people-data failed:', err)
  // Don't exit with error — allow build to continue
})
