import React, { useState, useMemo, useCallback } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Folder, FolderOpen, FileText, ChevronDown } from 'lucide-react'
import { BlogPost, getAllBlogPosts } from '@/lib/data'
import { stripMarkdownTitle } from '@/lib/utils'

// --- Year grouping ---

interface YearGroup {
  year: number
  posts: BlogPost[]
}

function groupByYear(posts: BlogPost[]): YearGroup[] {
  const map = new Map<number, BlogPost[]>()
  for (const post of posts) {
    const year = new Date(post.date).getFullYear() || 0
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(post)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, posts]) => ({
      year,
      posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }))
}

// --- Subcategory helpers ---

/** Build a map: category → subcategory[] (only categories that have subcategories) */
function buildSubcategoryMap(posts: BlogPost[]): Map<string, string[]> {
  const map = new Map<string, Set<string>>()
  for (const p of posts) {
    if (p.subcategory) {
      if (!map.has(p.category)) map.set(p.category, new Set())
      map.get(p.category)!.add(p.subcategory)
    }
  }
  const result = new Map<string, string[]>()
  for (const [cat, subs] of Array.from(map.entries())) {
    result.set(cat, Array.from(subs))
  }
  return result
}

// --- Components ---

function ThemeTabs({
  active,
  tabs,
  subcategoryMap,
  activeSubcategory,
  onChange,
  onSubcategoryChange,
}: {
  active: string
  tabs: string[]
  subcategoryMap: Map<string, string[]>
  activeSubcategory: string | null
  onChange: (t: string) => void
  onSubcategoryChange: (sub: string | null) => void
}) {
  const currentSubs = active !== '全部' ? (subcategoryMap.get(active) || []) : []

  return (
    <div className="mb-10">
      {/* Level 1: Primary Tabs (Root Directories) */}
      <div className="flex gap-6 border-b border-white/10 pb-[1px] mb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = active === tab
          return (
            <button
              key={tab}
              onClick={() => {
                onChange(tab)
                onSubcategoryChange(null)
              }}
              className={`text-[13px] font-mono flex items-center gap-1.5 pb-2.5 transition-colors whitespace-nowrap ${
                isActive ? 'text-white border-b-2 border-blue-500 -mb-[1px]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : ''}`} />
              {tab === '全部' ? '~/all' : `~/${tab.toLowerCase()}`}
            </button>
          )
        })}
      </div>

      {/* Level 2: Secondary Tabs (Subdirectories) */}
      {currentSubs.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-2">
          {/* Simulated tree branch line */}
          <div className="w-4 h-4 border-b border-l border-white/20 rounded-bl-lg -ml-4 -mt-2 opacity-50"></div>
          
          <button
            onClick={() => onSubcategoryChange(null)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
              activeSubcategory === null
                ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-transparent'
            }`}
          >
            ./all_{active.toLowerCase()}
          </button>
          
          {currentSubs.map((sub) => (
            <button
              key={sub}
              onClick={() => onSubcategoryChange(sub)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
                activeSubcategory === sub
                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-transparent'
              }`}
            >
              ./{sub.toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PostEntry({ post }: { post: BlogPost }) {
  const dateStr = post.date
    ? `${new Date(post.date).toLocaleString('en-US', { month: 'short' })} ${String(new Date(post.date).getDate()).padStart(2, '0')}`
    : ''
  const displayTags = post.tags.slice(0, 4)
  const titleText = stripMarkdownTitle(post.title)
  const descriptionText = post.excerpt || ''

  return (
    <Link
      href={`/blog/${post.slug}/`}
      className="group flex flex-col px-3 py-3 sm:pl-8 rounded-lg relative transition-colors mt-2"
    >
      <div className="flex items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-4 h-4 text-gray-600 shrink-0 group-hover:text-blue-400 transition-colors mt-0.5 sm:mt-0" />
          <div className="relative inline-block min-w-0">
            <h3 className="text-[15px] font-medium text-white/80 truncate group-hover:text-white transition-colors pb-0.5">
              {titleText}
            </h3>
            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-7 sm:pl-0">
          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="hidden sm:flex gap-1.5">
              {displayTags.map((tag, idx) => (
                <span
                  key={tag}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                    idx === 0
                      ? 'text-emerald-400/80 bg-emerald-400/5 border border-emerald-400/20'
                      : 'text-white/40 bg-white/5 border border-white/10'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span className="text-[11px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors shrink-0">
            {dateStr}
          </span>
        </div>
      </div>

      {descriptionText && (
        <div className="mt-2 pl-7 sm:pl-7 pr-4">
          <p className="text-[13px] text-gray-500 line-clamp-2 font-sans leading-relaxed group-hover:text-gray-400 transition-colors">
            {descriptionText}
          </p>
        </div>
      )}
    </Link>
  )
}

function YearSection({ group }: { group: YearGroup }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="space-y-1 font-mono folder-block">
      {/* Interactive Directory (Year) Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-2 py-2 text-sm sticky top-0 bg-[#0a0a0a]/90 backdrop-blur z-20 border-b border-white/5 mt-4 transition-colors cursor-pointer group ${isOpen ? 'text-white/50 hover:text-white/80' : 'text-white/30 hover:text-white/60'}`}
      >
        <ChevronDown 
          className={`w-4 h-4 chevron-icon transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} 
        />
        {isOpen ? (
          <FolderOpen className="w-4 h-4 text-blue-400/70 group-hover:text-blue-400 transition-colors" />
        ) : (
          <Folder className="w-4 h-4 text-blue-400/70 group-hover:text-blue-400 transition-colors" />
        )}
        <span className="font-bold">{group.year}</span>
        <span className="text-[10px] ml-2 text-white/20 font-sans tracking-wide">{group.posts.length} items</span>
      </button>

      {/* Collapsible Content Area */}
      <div 
        className="folder-content" 
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease-out'
        }}
      >
        <div className="folder-content-inner overflow-hidden">
          {group.posts.map((post) => (
            <PostEntry key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Page ---

interface BlogPageProps {
  posts: BlogPost[]
}

export default function BlogPage({ posts }: BlogPageProps) {
  const [activeTab, setActiveTab] = useState<string>('全部')
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)

  // Dynamic tabs from post categories, ordered by categoryOrder
  const tabs = useMemo(() => {
    const catMap = new Map<string, number>()
    for (const p of posts) {
      if (p.category && !catMap.has(p.category)) {
        catMap.set(p.category, p.categoryOrder ?? 999)
      }
    }
    const sorted = Array.from(catMap.entries()).sort((a, b) => a[1] - b[1]).map(([name]) => name)
    return ['全部', ...sorted]
  }, [posts])

  // Subcategory map
  const subcategoryMap = useMemo(() => buildSubcategoryMap(posts), [posts])

  // Filter by tab + subcategory
  const filteredPosts = useMemo(() => {
    let result = posts
    if (activeTab !== '全部') {
      result = result.filter((p) => p.category === activeTab)
    }
    if (activeSubcategory) {
      result = result.filter((p) => p.subcategory === activeSubcategory)
    }
    return result
  }, [posts, activeTab, activeSubcategory])

  // Group by year
  const yearGroups = useMemo(() => groupByYear(filteredPosts), [filteredPosts])

  // Reset subcategory when switching tabs
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    if (tab === '全部') {
      setActiveSubcategory(null)
    }
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>Blog - Kylin Miao</title>
        <meta
          name="description"
          content="Thoughts on frontend development, AI, and the art of building digital experiences."
        />
      </Head>

      <div className="min-h-screen text-white">
        {/* Header */}
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-block">
                  <p className="font-mono text-purple-400/80 text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7] animate-pulse"></span>
                      System.Pensieve
                  </p>
                  <div className="h-px w-full bg-gradient-to-r from-purple-500/30 to-transparent"></div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    Handpicked <span className="font-serif italic font-light text-white/70">Insights</span>
                </h1>
                <div className="font-mono text-xs text-white/30 pb-1.5 flex items-center gap-2">
                  <span className="text-purple-500/50">/*</span>
                  Question <span className="text-white/20">·</span> Reason <span className="text-white/20">·</span> Document
                  <span className="text-purple-500/50">*/</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          {/* Theme Tabs */}
          <div className="mb-6">
            <ThemeTabs
              active={activeTab}
              tabs={tabs}
              subcategoryMap={subcategoryMap}
              activeSubcategory={activeSubcategory}
              onChange={handleTabChange}
              onSubcategoryChange={setActiveSubcategory}
            />
          </div>

          {/* Year Groups */}
          {yearGroups.length > 0 ? (
            <motion.div
              className="space-y-8"
              key={`${activeTab}-${activeSubcategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {yearGroups.map((group) => (
                <YearSection key={group.year} group={group} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">该主题下暂无文章</p>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getAllBlogPosts()

  return {
    props: {
      posts,
    },
  }
}
