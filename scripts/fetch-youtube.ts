import fs from 'fs'
import path from 'path'

// --- Config ---

// AI leader YouTube channels to monitor
const YOUTUBE_CHANNELS = [
  { name: 'Andrej Karpathy', channelId: 'UCXUPKJO5MZQN11PqgIvyuvQ' },
  { name: 'Jeremy Howard (fast.ai)', channelId: 'UCX7Y2qWriXpqocG97SFW2OQ' },
  { name: 'Yannic Kilcher', channelId: 'UCZHmQk67mSJgfCCTn7xBfew' },
]

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3'
const OUTPUT_DIR = path.join(__dirname, '..', 'profile-data', 'youtube-videos')
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// --- Types ---

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
}

interface DailyYouTubeVideos {
  date: string
  videos: YouTubeVideoData[]
}

// --- YouTube API ---

async function fetchUploadsPlaylistId(channelId: string): Promise<string | null> {
  const url = `${YOUTUBE_API_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`

  try {
    const res = await fetch(url)

    if (!res.ok) {
      console.warn(`⚠️  YouTube API error for channel ${channelId}: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    const items = data.items || []
    if (items.length === 0) {
      console.warn(`⚠️  No channel found for ${channelId}`)
      return null
    }

    return items[0].contentDetails?.relatedPlaylists?.uploads || null
  } catch (err) {
    console.error(`❌ Failed to fetch channel ${channelId}:`, err)
    return null
  }
}

async function fetchPlaylistVideos(playlistId: string): Promise<YouTubeVideoData[]> {
  const url = `${YOUTUBE_API_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=10&key=${YOUTUBE_API_KEY}`

  try {
    const res = await fetch(url)

    if (!res.ok) {
      console.warn(`⚠️  YouTube API error for playlist ${playlistId}: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    const items = data.items || []

    return items
      .map((item: any) => {
        const snippet = item.snippet
        const videoId = snippet.resourceId?.videoId || ''
        return {
          videoId,
          title: snippet.title || '',
          description: snippet.description || '',
          channelTitle: snippet.channelTitle || '',
          publishedAt: snippet.publishedAt || '',
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
          viewCount: 0,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          highlights: '',
          worthReading: '',
        }
      })
  } catch (err) {
    console.error(`❌ Failed to fetch playlist ${playlistId}:`, err)
    return []
  }
}

async function fetchVideoStats(videoIds: string[]): Promise<Map<string, number>> {
  const viewCounts = new Map<string, number>()
  if (videoIds.length === 0) return viewCounts

  // Batch up to 50 IDs per request
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const url = `${YOUTUBE_API_URL}/videos?part=statistics&id=${batch.join(',')}&key=${YOUTUBE_API_KEY}`

    try {
      const res = await fetch(url)

      if (!res.ok) {
        console.warn(`⚠️  YouTube API error for video stats: ${res.status} ${res.statusText}`)
        continue
      }

      const data = await res.json()
      for (const item of data.items || []) {
        viewCounts.set(item.id, parseInt(item.statistics?.viewCount || '0', 10))
      }
    } catch (err) {
      console.error('❌ Failed to fetch video stats:', err)
    }
  }

  return viewCounts
}

// --- DeepSeek API ---

async function generateCommentary(video: YouTubeVideoData): Promise<{ highlights: string; worthReading: string }> {
  if (!DEEPSEEK_API_KEY) {
    return { highlights: '', worthReading: '' }
  }

  const prompt = `You are a technical reviewer. Given a YouTube video about AI/tech, provide:
1. "highlights": Core insight or key takeaway (2-3 sentences, concise)
2. "worthReading": Why it's worth watching (1-2 sentences)

Video Title: ${video.title}
Channel: ${video.channelTitle}
Description: ${video.description.slice(0, 500)}
Views: ${video.viewCount.toLocaleString()}

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
      console.warn(`⚠️  DeepSeek API error for "${video.title}": ${res.status}`)
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
    console.error(`❌ DeepSeek error for "${video.title}":`, err)
    return { highlights: '', worthReading: '' }
  }
}

// --- Main ---

async function main() {
  if (!YOUTUBE_API_KEY) {
    console.log('ℹ️  YOUTUBE_API_KEY not set, skipping YouTube video fetch.')
    return
  }

  console.log('🎬 Fetching YouTube videos from AI leaders...')
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Fetch all videos from all channels
  const allVideos: YouTubeVideoData[] = []

  for (const channel of YOUTUBE_CHANNELS) {
    console.log(`  📥 Fetching videos for ${channel.name}...`)

    const playlistId = await fetchUploadsPlaylistId(channel.channelId)
    if (!playlistId) {
      console.warn(`  ⚠️  Could not get uploads playlist for ${channel.name}, skipping.`)
      continue
    }

    const videos = await fetchPlaylistVideos(playlistId)
    console.log(`     Found ${videos.length} recent videos`)
    allVideos.push(...videos)
  }

  if (allVideos.length === 0) {
    console.log('No videos found. Done.')
    return
  }

  // Fetch view counts for all videos
  const videoIds = allVideos.map(v => v.videoId).filter(Boolean)
  console.log(`  📊 Fetching view counts for ${videoIds.length} videos...`)
  const viewCounts = await fetchVideoStats(videoIds)
  for (const video of allVideos) {
    video.viewCount = viewCounts.get(video.videoId) || 0
  }

  // Group by date
  const byDate = new Map<string, YouTubeVideoData[]>()
  for (const video of allVideos) {
    const date = video.publishedAt.split('T')[0]
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date)!.push(video)
  }

  // Process each date
  for (const [date, videos] of byDate) {
    const filePath = path.join(OUTPUT_DIR, `${date}.json`)

    // Merge with existing data if present
    let existingVideos: YouTubeVideoData[] = []
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailyYouTubeVideos
        existingVideos = existing.videos
      } catch {
        // Ignore parse errors
      }
    }

    // Deduplicate by videoId
    const existingIds = new Set(existingVideos.map(v => v.videoId))
    const newVideos = videos.filter(v => !existingIds.has(v.videoId))

    if (newVideos.length === 0 && existingVideos.length > 0) {
      console.log(`  📄 ${date}: No new videos (${existingVideos.length} existing)`)
      continue
    }

    // Generate AI commentary for new videos
    if (DEEPSEEK_API_KEY) {
      console.log(`  🤖 Generating AI commentary for ${newVideos.length} videos on ${date}...`)
      for (const video of newVideos) {
        const commentary = await generateCommentary(video)
        video.highlights = commentary.highlights
        video.worthReading = commentary.worthReading
      }
    }

    // Also generate commentary for existing videos that lack it
    if (DEEPSEEK_API_KEY) {
      for (const video of existingVideos) {
        if (!video.highlights && !video.worthReading) {
          const commentary = await generateCommentary(video)
          video.highlights = commentary.highlights
          video.worthReading = commentary.worthReading
        }
      }
    }

    const allDayVideos = [...existingVideos, ...newVideos]
    const dailyData: DailyYouTubeVideos = { date, videos: allDayVideos }

    fs.writeFileSync(filePath, JSON.stringify(dailyData, null, 2) + '\n')
    console.log(`  ✅ ${date}: ${allDayVideos.length} videos (${newVideos.length} new)`)
  }

  console.log('🎉 Done!')
}

main().catch(console.error)
