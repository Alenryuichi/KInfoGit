import fs from 'fs'
import path from 'path'
import type { StarredRepo, BlueskyPost, YouTubeVideo, BlogPost, XPost } from './social-feeds'

// --- Types ---

export interface Person {
  id: string
  name: string
  bio?: string
  github?: string
  bluesky?: string
  youtubeChannel?: string
  blogAuthor?: string
  x?: string
  avatar?: string
}

export interface PersonSummary extends Person {
  activityCount: number
  latestActivityAt: string | null
  platformCount: number
}

export interface PersonActivity {
  id: string
  stars: StarredRepo[]
  posts: BlueskyPost[]
  videos: YouTubeVideo[]
  blogs: BlogPost[]
  xPosts: XPost[]
  dailyCounts: number[]
  interestSummary: string
}

export interface PersonDetail extends Person {
  activity: PersonActivity
}

// --- Data Directories ---

const PEOPLE_JSON_PATH = path.join(process.cwd(), '..', 'profile-data', 'people.json')
const PEOPLE_ACTIVITY_DIR = path.join(process.cwd(), '..', 'profile-data', 'people-activity')

function getPeopleJsonPath(): string {
  if (fs.existsSync(PEOPLE_JSON_PATH)) return PEOPLE_JSON_PATH
  const alt = path.join(process.cwd(), 'profile-data', 'people.json')
  if (fs.existsSync(alt)) return alt
  return PEOPLE_JSON_PATH
}

function getPeopleActivityDir(): string {
  if (fs.existsSync(PEOPLE_ACTIVITY_DIR)) return PEOPLE_ACTIVITY_DIR
  const alt = path.join(process.cwd(), 'profile-data', 'people-activity')
  if (fs.existsSync(alt)) return alt
  return PEOPLE_ACTIVITY_DIR
}

// --- Helper Functions ---

function loadPeopleJson(): Person[] {
  const filePath = getPeopleJsonPath()
  if (!fs.existsSync(filePath)) return []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as Person[]
  } catch {
    return []
  }
}

function loadPersonActivity(id: string): PersonActivity | null {
  const dir = getPeopleActivityDir()
  const filePath = path.join(dir, `${id}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const raw = JSON.parse(content) as Partial<PersonActivity>
    return {
      id: raw.id ?? id,
      stars: raw.stars ?? [],
      posts: raw.posts ?? [],
      videos: raw.videos ?? [],
      blogs: raw.blogs ?? [],
      xPosts: raw.xPosts ?? [],
      dailyCounts: Array.isArray(raw.dailyCounts) && raw.dailyCounts.length > 0
        ? raw.dailyCounts
        : new Array(30).fill(0),
      interestSummary: raw.interestSummary ?? '',
    }
  } catch {
    return null
  }
}

// --- Public API ---

export function getAllPeople(): PersonSummary[] {
  const people = loadPeopleJson()

  return people.map(person => {
    const activity = loadPersonActivity(person.id)
    const activityCount = activity
      ? (activity.stars?.length || 0) + (activity.posts?.length || 0) + (activity.videos?.length || 0) + (activity.blogs?.length || 0) + (activity.xPosts?.length || 0)
      : 0

    // Compute latest activity timestamp across all sources
    let latestActivityAt: string | null = null
    if (activity) {
      const timestamps: string[] = [
        ...(activity.posts || []).map(p => p.createdAt),
        ...(activity.videos || []).map(v => v.publishedAt),
        ...(activity.blogs || []).map(b => b.publishedAt),
        ...(activity.xPosts || []).map(x => x.createdAt),
      ].filter(Boolean)
      if (timestamps.length > 0) {
        timestamps.sort((a, b) => b.localeCompare(a))
        latestActivityAt = timestamps[0]
      }
    }

    // Count active platforms (vectors)
    let platformCount = 0
    if (person.github) platformCount++
    if (person.bluesky) platformCount++
    if (person.youtubeChannel) platformCount++
    if (person.blogAuthor) platformCount++
    if (person.x) platformCount++

    return { ...person, activityCount, latestActivityAt, platformCount }
  })
}

export function getPersonByHandle(handle: string): PersonDetail | null {
  const people = loadPeopleJson()
  const person = people.find(p => p.id === handle)

  if (!person) return null

  const activity = loadPersonActivity(person.id) || {
    id: person.id,
    stars: [],
    posts: [],
    videos: [],
    blogs: [],
    xPosts: [],
    dailyCounts: new Array(30).fill(0),
    interestSummary: '',
  }

  return { ...person, activity }
}

export function getAllPersonIds(): string[] {
  const people = loadPeopleJson()
  return people.map(p => p.id)
}

export function getHandleToPersonMap(): Record<string, string> {
  const people = loadPeopleJson()
  const map: Record<string, string> = {}

  for (const person of people) {
    if (person.github) {
      map[`github:${person.github.toLowerCase()}`] = person.id
    }
    if (person.bluesky) {
      map[`bluesky:${person.bluesky.toLowerCase()}`] = person.id
    }
    if (person.x) {
      map[`x:${person.x.toLowerCase()}`] = person.id
    }
  }

  return map
}
