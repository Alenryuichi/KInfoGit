'use client'

import { useState, useEffect, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Layout from '@/components/Layout'
import BlogCard from '@/components/BlogCard'
import SearchBox from '@/components/SearchBox'
import TagCloud from '@/components/TagCloud'
import { BlogPost, getAllBlogPosts, getAllTags } from '@/lib/data'

interface BlogPageProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogPage({ posts, tags }: BlogPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(posts.map(post => post.category)))]
    return cats
  }, [posts])

  // Filter posts based on search, tags, and category
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => post.tags.includes(tag))

      // Category filter
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory

      return matchesSearch && matchesTags && matchesCategory
    })
  }, [posts, searchQuery, selectedTags, selectedCategory])

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <>
      <Head>
        <title>Blog - Handpicked insights from the pensieve</title>
        <meta name="description" content="Handpicked insights from the pensieve - thoughts on frontend development, technology, and more." />
      </Head>

      <Layout>
        <div className="min-h-screen bg-black text-white">
          {/* Hero Section */}
          <div className="relative py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  THE BLOG
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Handpicked insights
                <br />
                from{' '}
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  the pensieve
                </span>
              </h1>
              
              <div className="mt-12">
                <SearchBox onSearch={handleSearch} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Blog Posts */}
              <div className="lg:col-span-3">
                {/* Category Filter */}
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${selectedCategory === category
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                            : 'bg-gray-800/40 text-gray-300 border border-gray-700/30 hover:bg-gray-700/50 hover:text-white'
                          }
                        `}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Info */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm">
                    {filteredPosts.length === posts.length 
                      ? `Showing all ${posts.length} posts`
                      : `Found ${filteredPosts.length} of ${posts.length} posts`
                    }
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>

                {/* Blog Posts Grid */}
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPosts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                    <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-8">
                  {/* Tag Cloud */}
                  <TagCloud
                    tags={tags}
                    selectedTags={selectedTags}
                    onTagClick={handleTagClick}
                  />

                  {/* Featured Posts */}
                  {posts.filter(p => p.featured).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Featured Posts</h3>
                      <div className="space-y-4">
                        {posts.filter(p => p.featured).slice(0, 3).map((post) => (
                          <div key={post.slug} className="group">
                            <a href={`/blog/${post.slug}`} className="block">
                              <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">{post.readTime}</p>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getAllBlogPosts()
  const tags = await getAllTags()

  return {
    props: {
      posts,
      tags,
    },
  }
}
