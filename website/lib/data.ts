import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Get the profile data directory path
const profileDataDir = path.join(process.cwd(), '..', 'profile-data')

// Personal info types
export interface PersonalInfo {
  name: {
    zh: string
    en: string
    display: string
  }
  contact: {
    phone: string
    email: string
    location: string
  }
  title: {
    zh: string
    en: string
  }
  summary: {
    zh: string[]
    en: string[]
  }
  languages: {
    zh: string
    en: string
  }
}

// Skills types
export interface Skill {
  name: string
  level: string
  years: number
}

export interface SkillCategory {
  category: string
  skills: Skill[]
}

// Project types
export interface Project {
	id: string
	title: {
		zh: string
		en: string
	}
	period: string
	company: string
	role: {
		zh: string
		en: string
	}
	tech_stack: string[]
	responsibilities: {
		zh: string[]
		en: string[]
	}
	achievements: {
		zh: string[]
		en: string[]
	}
	description?: {
		zh: string
		en: string
	}
	highlights?: {
		zh: string
		en: string
	}
	/**
	 * 简要量化影响，用于列表卡片上的一行 summary，例如
	 * "10亿级数据处理能力"、"300万+直接收益" 等。
	 */
	impact?: string
	/**
	 * 用于简单分组/过滤的项目类别，例如 "anti-fraud"、"graph-database" 等。
	 */
	category?: string
}

// Blog types
export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  category: string
  readTime: string
  featured: boolean
  image?: string
  excerpt: string
  content: string
}

// Data fetching functions
export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  try {
    const filePath = path.join(profileDataDir, 'resume', 'personal-info.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error('Error loading personal info:', error)
    return null
  }
}

export async function getTechnicalSkills(): Promise<Record<string, SkillCategory> | null> {
  try {
    const filePath = path.join(profileDataDir, 'skills', 'technical-skills.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error('Error loading technical skills:', error)
    return null
  }
}

export async function getCoreProjects(): Promise<Project[] | null> {
	try {
		const filePath = path.join(profileDataDir, 'projects', 'core-projects.json')
		const fileContents = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(fileContents)
	} catch (error) {
		console.error('Error loading core projects:', error)
		return null
	}
}

export async function getProjectById(id: string): Promise<Project | null> {
	try {
		const projects = await getCoreProjects()
		if (!projects) return null
		return projects.find(project => project.id === id) ?? null
	} catch (error) {
		console.error('Error loading project by id:', error)
		return null
	}
}

// Utility functions
export function formatPeriod(period: string): string {
  return period.replace('-', ' - ')
}

export function getSkillLevel(level: string): number {
  const levelMap: Record<string, number> = {
    '初级': 30,
    '一般': 50,
    '熟练': 80,
    '专家': 95,
    '精通': 100
  }
  return levelMap[level] || 50
}

export function getYearsDisplay(years: number): string {
  if (years >= 5) return '5+ years'
  if (years >= 3) return '3+ years'
  if (years >= 1) return `${years}+ years`
  return '< 1 year'
}

// Blog data functions
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const blogDir = path.join(profileDataDir, 'blog')

    if (!fs.existsSync(blogDir)) {
      return []
    }

    const fileNames = fs.readdirSync(blogDir)
    const posts = fileNames
      .filter(name => name.endsWith('.md'))
      .map(fileName => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(blogDir, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        return {
          slug,
          title: data.title || '',
          date: data.date || '',
          tags: data.tags || [],
          category: data.category || 'Uncategorized',
          readTime: data.readTime || '5 min read',
          featured: data.featured || false,
          image: data.image,
          excerpt: data.excerpt || '',
          content
        } as BlogPost
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return posts
  } catch (error) {
    console.error('Error loading blog posts:', error)
    return []
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(profileDataDir, 'blog', `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      tags: data.tags || [],
      category: data.category || 'Uncategorized',
      readTime: data.readTime || '5 min read',
      featured: data.featured || false,
      image: data.image,
      excerpt: data.excerpt || '',
      content
    } as BlogPost
  } catch (error) {
    console.error('Error loading blog post:', error)
    return null
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const posts = await getAllBlogPosts()
    const allTags = posts.flatMap(post => post.tags)
    const uniqueTags = Array.from(new Set(allTags))
    return uniqueTags.sort()
  } catch (error) {
    console.error('Error loading tags:', error)
    return []
  }
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  try {
    const posts = await getAllBlogPosts()
    return posts.filter(post => post.tags.includes(tag))
  } catch (error) {
    console.error('Error loading posts by tag:', error)
    return []
  }
}


