import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { ReadingProgressBar } from '@/components/ReadingProgressBar'
import { BlogPost, getAllBlogPosts, getBlogPost } from '@/lib/data'
import { stripMarkdownTitle } from '@/lib/utils'
import { siteConfig } from '@/lib/config'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { BusuanziCounter } from '@/components/BusuanziCounter'
import { BlogComments } from '@/components/BlogComments'

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

      <div className="min-h-screen bg-black text-white" data-pagefind-body data-pagefind-meta="type:Blog">
        {/* Pagefind date meta */}
        <meta data-pagefind-meta={`date:${post.date}`} />
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-32 pb-4">
          <Link
            href="/blog/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-12 pb-2">
          <header className="mb-2">
            {post.featured && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Featured Post
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
              {cleanTitle}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-gray-400/80 mb-4">
              <time className="font-medium text-gray-300">{formatDate(post.date)}</time>
              <span className="text-white/10 select-none">·</span>
              <span>{post.readTime}</span>
              <span className="text-white/10 select-none">·</span>
              <span className="text-gray-300">{post.category}</span>
              <span className="text-white/10 select-none">·</span>
              <BusuanziCounter key={post.slug} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/?tag=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 text-xs font-medium bg-white/[0.02] text-gray-300 border border-white/[0.06] rounded-md hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white transition-all"
                >
                  <span className="text-gray-500 mr-px">#</span>{tag}
                </Link>
              ))}
            </div>

            {/* AI Summary */}
            <div className="mb-2 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-300">Summary</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">AI</span>
              </div>
              <p className="text-gray-400 text-[15px] leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          </header>

          {/* Mobile TOC */}
          <TableOfContents content={post.content} variant="mobile" />
        </div>

        {/* Article Content + Desktop TOC */}
        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 pb-12">
            <article>
            <MarkdownRenderer content={post.content} />

            {/* Prev/Next Navigation */}
            {(prevPost || nextPost) && (
              <nav className="mt-16 pt-8 border-t border-white/[0.06] flex items-stretch justify-between gap-4" data-pagefind-ignore>
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}/`}
                    className="group flex-1 min-w-0 p-4 rounded-xl border border-white/[0.04] bg-transparent hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-200"
                  >
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">上一篇</span>
                    <p className="mt-1.5 text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      ← {stripMarkdownTitle(prevPost.title)}
                    </p>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}/`}
                    className="group flex-1 min-w-0 p-4 rounded-xl border border-white/[0.04] bg-transparent hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-200 text-right"
                  >
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">下一篇</span>
                    <p className="mt-1.5 text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {stripMarkdownTitle(nextPost.title)} →
                    </p>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </nav>
            )}

            {/* Comments */}
            <BlogComments />
          </article>

            {/* Desktop TOC — positioned in right margin */}
            <TableOfContents content={post.content} variant="desktop" />
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
