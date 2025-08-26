import React, { useState, useEffect, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
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

      // Tags filter
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
    <React.Fragment>
      <Head>
        <title>Blog - Handpicked insights from the pensieve</title>
        <meta name="description" content="Handpicked insights from the pensieve - thoughts on frontend development, technology, and more." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                THE BLOG
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Handpicked insights from the{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                pensieve
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Thoughts on frontend development, technology, and the art of building digital experiences.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <SearchBox onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <TagCloud
              tags={tags}
              selectedTags={selectedTags}
              onTagClick={handleTagClick}
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No posts found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Try adjusting your search terms or selected filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTags([])
                  setSelectedCategory('All')
                }}
                className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
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