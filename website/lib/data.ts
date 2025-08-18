import fs from 'fs'
import path from 'path'

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
