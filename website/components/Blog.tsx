'use client'

import { useState, useEffect, useMemo } from 'react'
import BlogCard from './BlogCard'
import SearchBox from './SearchBox'
import TagCloud from './TagCloud'
import { BlogPost, getAllBlogPosts, getAllTags } from '@/lib/data'

interface BlogProps {
  posts?: BlogPost[]
  tags?: string[]
}

export default function Blog({ posts = [], tags = [] }: BlogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => post.tags.includes(tag))
      
      return matchesSearch && matchesTags
    })
  }, [posts, searchQuery, selectedTags])

  return (
    <section id="blog" className="min-h-screen bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              THE BLOG
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Handpicked insights
            <br />
            from{' '}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              the pensieve
            </span>
          </h2>
          
          <div className="mt-12 max-w-md mx-auto">
            <SearchBox onSearch={handleSearch} />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
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
                <p className="text-gray-400 text-lg">
                  {searchQuery || selectedTags.length > 0 
                    ? 'No posts found matching your criteria.'
                    : 'No blog posts available yet.'
                  }
                </p>
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
    </section>
  )
}
