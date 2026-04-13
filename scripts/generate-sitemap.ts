import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// --- Config ---

const BASE_URL = 'https://alenryuichi.github.io/KInfoGit'
const OUTPUT_PATH = path.join(__dirname, '..', 'website', 'public', 'sitemap.xml')

// --- Data directories (relative to website/) ---

const profileDataDir = path.join(__dirname, '..', 'profile-data')
const GITHUB_STARS_DIR = path.join(profileDataDir, 'github-stars')
const BLUESKY_POSTS_DIR = path.join(profileDataDir, 'bluesky-posts')
const BLOG_POSTS_DIR = path.join(profileDataDir, 'blog-posts')
const YOUTUBE_VIDEOS_DIR = path.join(profileDataDir, 'youtube-videos')
const WEEKLY_DIGESTS_DIR = path.join(profileDataDir, 'weekly-digests')
const PEOPLE_JSON = path.join(profileDataDir, 'people', 'people.json')

// --- Helpers ---

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function urlEntry(
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {},
): string {
  let xml = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`
  if (opts.lastmod) xml += `    <lastmod>${opts.lastmod}</lastmod>\n`
  if (opts.changefreq) xml += `    <changefreq>${opts.changefreq}</changefreq>\n`
  if (opts.priority) xml += `    <priority>${opts.priority}</priority>\n`
  xml += '  </url>'
  return xml
}

// --- Collect slugs from data layer ---

function getBlogSlugs(): string[] {
  const blogDir = path.join(profileDataDir, 'blog')
  if (!fs.existsSync(blogDir)) return []
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

function getFeedDates(): string[] {
  const dateSet = new Set<string>()

  for (const dir of [GITHUB_STARS_DIR, BLUESKY_POSTS_DIR, BLOG_POSTS_DIR, YOUTUBE_VIDEOS_DIR]) {
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      const m = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)
      if (m) dateSet.add(m[1])
    }
  }

  return Array.from(dateSet).sort()
}

function getWeeklyDigestWeeks(): string[] {
  if (!fs.existsSync(WEEKLY_DIGESTS_DIR)) return []
  return fs
    .readdirSync(WEEKLY_DIGESTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((w) => /^\d{4}-W\d{2}$/.test(w))
    .sort()
}

function getPersonHandles(): string[] {
  if (!fs.existsSync(PEOPLE_JSON)) return []
  try {
    const data = JSON.parse(fs.readFileSync(PEOPLE_JSON, 'utf-8'))
    return (data as { id: string }[]).map((p) => p.id)
  } catch {
    return []
  }
}

function getProjectIds(): string[] {
  const filePath = path.join(profileDataDir, 'projects', 'core-projects.json')
  if (!fs.existsSync(filePath)) return []
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return (data as { id: string }[]).map((p) => p.id)
  } catch {
    return []
  }
}

// --- Main ---

function generate(): void {
  const today = todayISO()
  const entries: string[] = []

  // Static pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about/', priority: '0.8', changefreq: 'monthly' },
    { path: '/work/', priority: '0.8', changefreq: 'monthly' },
    { path: '/blog/', priority: '0.9', changefreq: 'weekly' },
    { path: '/stars/', priority: '0.8', changefreq: 'daily' },
    { path: '/stars/timeline/', priority: '0.7', changefreq: 'daily' },
    { path: '/stars/people/', priority: '0.7', changefreq: 'weekly' },
  ]

  for (const page of staticPages) {
    entries.push(
      urlEntry(`${BASE_URL}${page.path}`, {
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority,
      }),
    )
  }

  // Blog posts
  const blogSlugs = getBlogSlugs()
  for (const slug of blogSlugs) {
    // Try to extract date from slug (format: YYYY-MM-DD-title)
    const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/)
    const lastmod = dateMatch ? dateMatch[1] : today

    entries.push(
      urlEntry(`${BASE_URL}/blog/${slug}/`, {
        lastmod,
        changefreq: 'monthly',
        priority: '0.6',
      }),
    )
  }

  // Stars daily pages
  const feedDates = getFeedDates()
  for (const date of feedDates) {
    entries.push(
      urlEntry(`${BASE_URL}/stars/${date}/`, {
        lastmod: date,
        changefreq: 'never',
        priority: '0.5',
      }),
    )
  }

  // Stars weekly digests
  const weeks = getWeeklyDigestWeeks()
  for (const week of weeks) {
    entries.push(
      urlEntry(`${BASE_URL}/stars/weekly/${week}/`, {
        changefreq: 'never',
        priority: '0.5',
      }),
    )
  }

  // Stars people pages
  const handles = getPersonHandles()
  for (const handle of handles) {
    entries.push(
      urlEntry(`${BASE_URL}/stars/people/${handle}/`, {
        changefreq: 'weekly',
        priority: '0.5',
      }),
    )
  }

  // Work/project detail pages
  const projectIds = getProjectIds()
  for (const id of projectIds) {
    entries.push(
      urlEntry(`${BASE_URL}/work/${id}/`, {
        changefreq: 'monthly',
        priority: '0.6',
      }),
    )
  }

  // Build XML
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8')
  console.log(`✅ Sitemap generated: ${OUTPUT_PATH}`)
  console.log(
    `   ${staticPages.length} static + ${blogSlugs.length} blog + ${feedDates.length} daily + ${weeks.length} weekly + ${handles.length} people + ${projectIds.length} projects = ${entries.length} URLs`,
  )
}

generate()
