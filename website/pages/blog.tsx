import React, { useState, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BlogPost, getAllBlogPosts } from '@/lib/data'
import { stripMarkdownTitle } from '@/lib/utils'

// --- Theme tab types & config ---

// Tabs are dynamically generated from post data

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

// --- Components ---

function ThemeTabs({
  active,
  tabs,
  onChange,
}: {
  active: string
  tabs: string[]
  onChange: (t: string) => void
}) {
  return (
    <div className="relative md:contents">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide relative p-1 rounded-lg bg-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              active === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {active === tab && (
              <motion.div
                layoutId="theme-tab-indicator"
                className="absolute inset-0 bg-white/10 rounded-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>
      {/* Scroll hint overlay - mobile only */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none md:hidden rounded-r-lg" />
    </div>
  )
}

function PostEntry({ post }: { post: BlogPost }) {
  const dateStr = post.date
    ? `${String(new Date(post.date).getMonth() + 1).padStart(2, '0')}/${String(new Date(post.date).getDate()).padStart(2, '0')}`
    : ''
  const displayTags = post.tags.slice(0, 4)

  return (
    <div className="group py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/blog/${post.slug}/`}
            className="text-base font-medium text-gray-100 group-hover:text-blue-400 transition-colors"
          >
            {stripMarkdownTitle(post.title)}
          </Link>
          {post.excerpt && (
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
          )}
          {displayTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="shrink-0 text-sm tabular-nums text-gray-500 pt-0.5">{dateStr}</span>
      </div>
    </div>
  )
}

function YearSection({ group }: { group: YearGroup }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-300 shrink-0">{group.year}</h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="divide-y divide-white/5">
        {group.posts.map((post) => (
          <PostEntry key={post.slug} post={post} />
        ))}
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

  // Filter by tab
  const filteredPosts = useMemo(
    () =>
      activeTab === '全部'
        ? posts
        : posts.filter((p) => p.category === activeTab),
    [posts, activeTab]
  )

  // Group by year
  const yearGroups = useMemo(() => groupByYear(filteredPosts), [filteredPosts])

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
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-3xl mx-auto">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              THE BLOG
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold">
              Handpicked insights from the{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                pensieve
              </span>
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 pb-20">
          {/* Theme Tabs */}
          <div className="mb-6">
            <ThemeTabs active={activeTab} tabs={tabs} onChange={setActiveTab} />
          </div>

          {/* Year Groups */}
          {yearGroups.length > 0 ? (
            <motion.div
              className="space-y-8"
              key={activeTab}
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
