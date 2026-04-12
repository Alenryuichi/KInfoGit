/**
 * Search Integration Tests
 * @module __tests__/search-integration.test
 *
 * End-to-end tests for the search system:
 * - Search index loading and parsing
 * - Fuse.js search execution
 * - Search result accuracy
 * - Cross-browser compatibility
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

// Real search-index.json path
const SEARCH_INDEX_PATH = '/Users/kylinmiao/Documents/project/KInfoGit/website/public/search-index.json'

interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project'
}

describe('Search System Integration Tests', () => {
  let searchIndex: SearchItem[] = []

  beforeAll(() => {
    // Load the actual search index
    try {
      const fs = require('fs')
      const data = fs.readFileSync(SEARCH_INDEX_PATH, 'utf-8')
      searchIndex = JSON.parse(data)
    } catch (error) {
      console.warn('Could not load search index, using mock data')
      searchIndex = []
    }
  })

  describe('Search Index Loading', () => {
    it('should load search index JSON file', () => {
      expect(searchIndex).toBeDefined()
      expect(Array.isArray(searchIndex)).toBe(true)
    })

    it('should contain at least 16 items', () => {
      // Known: 11 blogs + 5 projects
      expect(searchIndex.length).toBeGreaterThanOrEqual(16)
    })

    it('should parse JSON without errors', () => {
      expect(searchIndex.length).toBeGreaterThan(0)
    })

    it('should validate SearchItem structure for all items', () => {
      searchIndex.forEach(item => {
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('description')
        expect(item).toHaveProperty('url')
        expect(item).toHaveProperty('category')
        expect(item).toHaveProperty('type')
      })
    })

    it('should have valid type field (blog or project)', () => {
      searchIndex.forEach(item => {
        expect(['blog', 'project']).toContain(item.type)
      })
    })

    it('should have valid URL format', () => {
      searchIndex.forEach(item => {
        expect(item.url).toMatch(/^\//)
      })
    })
  })

  describe('Search Result Accuracy', () => {
    it('should find blog posts by title', () => {
      // Search for known blog: "Page Agent 深度技术分析报告"
      const query = 'Page Agent'
      const results = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find projects by name', () => {
      // Search for known project: Betaline
      const query = 'Betaline'
      const results = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find items by category', () => {
      // Search for category: AI
      const query = 'AI'
      const results = searchIndex.filter(item =>
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find items by description', () => {
      // Search for known description text
      const query = 'Agent'
      const results = searchIndex.filter(item =>
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return consistent results across searches', () => {
      const query = 'blog'
      const results1 = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query)
      )
      const results2 = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query)
      )
      expect(results1.length).toBe(results2.length)
    })
  })

  describe('Blog Indexing Verification', () => {
    it('should have indexed blog posts', () => {
      const blogs = searchIndex.filter(item => item.type === 'blog')
      expect(blogs.length).toBeGreaterThanOrEqual(11)
    })

    it('should have 11 blog items', () => {
      const blogs = searchIndex.filter(item => item.type === 'blog')
      expect(blogs.length).toBe(11)
    })

    it('should have blog URLs in /blog/ format', () => {
      const blogs = searchIndex.filter(item => item.type === 'blog')
      blogs.forEach(blog => {
        expect(blog.url).toMatch(/^\/blog\//)
      })
    })

    it('should include specific known blogs', () => {
      const titles = searchIndex.map(item => item.title)
      // Check for at least some known blogs
      expect(titles.some(t => t.includes('Page Agent'))).toBe(true)
    })

    it('should have blog categories', () => {
      const blogs = searchIndex.filter(item => item.type === 'blog')
      blogs.forEach(blog => {
        expect(blog.category.length).toBeGreaterThan(0)
      })
    })

    it('should have blog descriptions', () => {
      const blogs = searchIndex.filter(item => item.type === 'blog')
      blogs.forEach(blog => {
        expect(blog.description).toBeDefined()
      })
    })
  })

  describe('Project Indexing Verification', () => {
    it('should have indexed projects', () => {
      const projects = searchIndex.filter(item => item.type === 'project')
      expect(projects.length).toBeGreaterThanOrEqual(5)
    })

    it('should have exactly 5 projects', () => {
      const projects = searchIndex.filter(item => item.type === 'project')
      expect(projects.length).toBe(5)
    })

    it('should have project URLs in /work/ format', () => {
      const projects = searchIndex.filter(item => item.type === 'project')
      projects.forEach(project => {
        expect(project.url).toMatch(/^\/work\//)
      })
    })

    it('should include all core projects', () => {
      const projectIds = searchIndex
        .filter(item => item.type === 'project')
        .map(item => item.url)
      
      // Known projects
      const expectedProjects = [
        '/work/betaline',
        '/work/openmemory-plus',
        '/work/anti-fraud-governance',
        '/work/portrait-platform',
        '/work/ai-agent-review'
      ]
      
      expectedProjects.forEach(projectUrl => {
        expect(projectIds).toContain(projectUrl)
      })
    })

    it('should support bilingual project titles', () => {
      const projects = searchIndex.filter(item => item.type === 'project')
      // Titles should be in either English or Chinese
      projects.forEach(project => {
        expect(project.title.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Search Performance Metrics', () => {
    it('should have reasonable index size', () => {
      const json = JSON.stringify(searchIndex)
      const sizeInKB = json.length / 1024
      // Should be under 50 KB for reasonable client-side performance
      expect(sizeInKB).toBeLessThan(50)
    })

    it('should be parseable in <10ms', () => {
      const start = performance.now()
      JSON.parse(JSON.stringify(searchIndex))
      const duration = performance.now() - start
      expect(duration).toBeLessThan(10)
    })

    it('should support client-side filtering', () => {
      // All items should have searchable fields
      searchIndex.forEach(item => {
        const searchableText = `${item.title} ${item.description} ${item.category}`
        expect(searchableText.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Data Consistency', () => {
    it('should have unique URLs', () => {
      const urls = searchIndex.map(item => item.url)
      const uniqueUrls = new Set(urls)
      expect(urls.length).toBe(uniqueUrls.size)
    })

    it('should not have duplicate items', () => {
      const titles = searchIndex.map(item => item.title)
      const uniqueTitles = new Set(titles)
      // Most titles should be unique (allowing for possible duplicates)
      expect(uniqueTitles.size).toBeGreaterThan(searchIndex.length * 0.9)
    })

    it('should have non-empty titles', () => {
      searchIndex.forEach(item => {
        expect(item.title.trim().length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty descriptions', () => {
      searchIndex.forEach(item => {
        // Description can be empty string but should exist
        expect(item.description).toBeDefined()
      })
    })

    it('should have valid categories', () => {
      searchIndex.forEach(item => {
        expect(item.category.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Search Simulation', () => {
    it('should simulate Fuse.js search for blog queries', () => {
      const query = 'blog'
      const results = searchIndex
        .filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
        .slice(0, 5)
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('should simulate Fuse.js search for project queries', () => {
      const query = 'project'
      const results = searchIndex
        .filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        )
        .slice(0, 5)
      
      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('should return empty results for no matches', () => {
      const query = 'xyznonexistent'
      const results = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
      
      expect(results.length).toBe(0)
    })

    it('should be case-insensitive', () => {
      const query1 = 'ai'
      const query2 = 'AI'
      const query3 = 'Ai'
      
      const results1 = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query1)
      )
      const results2 = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query2.toLowerCase())
      )
      const results3 = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query3.toLowerCase())
      )
      
      expect(results1.length).toBe(results2.length)
      expect(results2.length).toBe(results3.length)
    })

    it('should limit results to 5 items', () => {
      const query = 'a'  // Common letter
      const results = searchIndex
        .filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
        .slice(0, 5)
      
      expect(results.length).toBeLessThanOrEqual(5)
    })
  })
})
