import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { ReadingProgressBar } from '@/components/ReadingProgressBar'
import { BlogPost, getAllBlogPosts, getBlogPost } from '@/lib/data'
import { stripMarkdownTitle } from '@/lib/utils'
import { siteConfig } from '@/lib/config'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline'

interface AdjacentPost {
  slug: string
  title: string
}

interface BlogPostPageProps {
  post: BlogPost | null
  prevPost: AdjacentPost | null
  nextPost: AdjacentPost | null
}

export default function BlogPostPage({ post, prevPost, nextPost }: BlogPostPageProps) {

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/blog/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const cleanTitle = stripMarkdownTitle(post.title)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <Head>
        <title>{cleanTitle} - Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={cleanTitle} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${siteConfig.url}/blog/covers/${post.slug}.png`} />
        <meta property="og:url" content={`${siteConfig.url}/blog/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${siteConfig.url}/blog/covers/${post.slug}.png`} />
      </Head>

      <ReadingProgressBar />

      <div className="min-h-screen bg-black text-white">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-4">
          <Link
            href="/blog/"
            className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 hover:bg-gray-800/80 transition-all duration-300 group backdrop-blur-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12">
          <header className="mb-12">
            {post.featured && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Featured Post
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {cleanTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <time>{formatDate(post.date)}</time>
              </div>

              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>{post.readTime}</span>
              </div>

              <div className="flex items-center">
                <TagIcon className="w-4 h-4 mr-2" />
                <span>{post.category}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-sm bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50 hover:bg-gray-700/60 hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Excerpt */}
            <div className="text-xl text-gray-300 leading-relaxed border-l-4 border-blue-500/50 pl-6 italic">
              {post.excerpt}
            </div>
          </header>

          {/* Mobile TOC */}
          <TableOfContents content={post.content} variant="mobile" />
        </div>

        {/* Article Content */}
        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 pb-12">
          {/* Desktop TOC — fixed in right margin, follows scroll */}
          <div className="hidden xl:block fixed top-32 w-56" style={{ left: 'calc(50% + 28rem + 2rem)' }}>
            <TableOfContents content={post.content} variant="desktop" />
          </div>

          <article>
            <MarkdownRenderer content={post.content} />

            {/* Prev/Next Navigation */}
            {(prevPost || nextPost) && (
              <nav className="mt-16 pt-8 border-t border-gray-800 flex items-stretch justify-between gap-4">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}/`}
                    className="group flex-1 min-w-0 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-colors"
                  >
                    <span className="text-xs text-gray-500 uppercase tracking-wider">上一篇</span>
                    <p className="mt-1 text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      ← {stripMarkdownTitle(prevPost.title)}
                    </p>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}/`}
                    className="group flex-1 min-w-0 p-4 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-colors text-right"
                  >
                    <span className="text-xs text-gray-500 uppercase tracking-wider">下一篇</span>
                    <p className="mt-1 text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {stripMarkdownTitle(nextPost.title)} →
                    </p>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </nav>
            )}

            {/* Article Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-gray-400">
                  <p>Thanks for reading!</p>
                </div>

                <div className="flex items-center space-x-4">
                  <Link
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanTitle)}&url=${encodeURIComponent(`${siteConfig.url}/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    Share on Twitter
                  </Link>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllBlogPosts()
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      notFound: true,
    }
  }

  // Get all posts sorted by date (newest first) for prev/next navigation
  const allPosts = await getAllBlogPosts()
  const currentIndex = allPosts.findIndex(p => p.slug === slug)

  // In the sorted array (newest first):
  // - "next" (newer) post is at index - 1
  // - "prev" (older) post is at index + 1
  const nextPost = currentIndex > 0
    ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title }
    : null

  const prevPost = currentIndex < allPosts.length - 1
    ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title }
    : null

  return {
    props: {
      post,
      prevPost,
      nextPost,
    },
  }
}
