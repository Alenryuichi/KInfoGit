import React, { useState, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion } from 'framer-motion'
import BlogCard from '@/components/BlogCard'
import TagCloud from '@/components/TagCloud'
import { BlogPost, getAllBlogPosts, getAllTags } from '@/lib/data'

// Animation variants for staggered card entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
}

interface BlogPageProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogPage({ posts, tags }: BlogPageProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(posts.map(post => post.category)))]
    return cats
  }, [posts])

  // Filter posts based on tags and category (search removed - using global search)
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tags filter
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => post.tags.includes(tag))

      // Category filter
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory

      return matchesTags && matchesCategory
    })
  }, [posts, selectedTags, selectedCategory])

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <React.Fragment>
      <Head>
        <title>Blog - Handpicked insights from the pensieve</title>
        <meta name="description" content="Handpicked insights from the pensieve - thoughts on frontend development, technology, and more." />
      </Head>

      <div className="min-h-screen text-white">
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

        {/* Filter Section - Category buttons and Tag Cloud */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Tag Cloud */}
          <TagCloud
            tags={tags}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          {filteredPosts.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={`${selectedCategory}-${selectedTags.join('-')}`}
            >
              {filteredPosts.map((post) => (
                <motion.div key={post.slug} variants={cardVariants}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No posts found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Try adjusting your selected filters to find what you're looking for.
              </p>
              <motion.button
                onClick={() => {
                  setSelectedTags([])
                  setSelectedCategory('All')
                }}
                className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Clear All Filters
              </motion.button>
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