import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const profileDataDir = path.join(process.cwd(), '..', 'profile-data')
const outputDir = path.join(process.cwd(), 'public')
const outputFile = path.join(outputDir, 'search-index.json')

interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project'
}

async function generateIndex() {
  const searchIndex: SearchItem[] = []

  // 1. Process Blog Posts
  const blogDir = path.join(profileDataDir, 'blog')
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'))
    blogFiles.forEach(file => {
      const slug = file.replace(/\.md$/, '')
      const fullPath = path.join(blogDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(content)
      
      searchIndex.push({
        title: data.title || slug,
        description: data.excerpt || '',
        url: `/blog/${slug}`,
        category: data.category || 'Blog',
        type: 'blog'
      })
    })
  }

  // 2. Process Projects
  const projectsPath = path.join(profileDataDir, 'projects', 'core-projects.json')
  if (fs.existsSync(projectsPath)) {
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'))
    projects.forEach((project: any) => {
      searchIndex.push({
        title: project.title.en || project.title.zh || 'Project',
        description: project.description?.en || project.description?.zh || project.impact || '',
        url: `/work/${project.id}`,
        category: project.category || 'Project',
        type: 'project'
      })
    })
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputFile, JSON.stringify(searchIndex, null, 2))
  console.log(`✅ Search index generated with ${searchIndex.length} items at ${outputFile}`)
}

generateIndex().catch(err => {
  console.error('❌ Failed to generate search index:', err)
  process.exit(1)
})
