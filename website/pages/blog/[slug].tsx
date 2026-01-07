import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { BlogPost, getAllBlogPosts, getBlogPost } from '@/lib/data'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline'

interface BlogPostPageProps {
  post: BlogPost | null
}

export default function BlogPostPage({ post }: BlogPostPageProps) {

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

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
        <title>{post.title} - Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        {post.image && <meta property="og:image" content={post.image} />}
      </Head>

      <Layout>
        <div className="min-h-screen bg-black text-white">
          {/* Back Button */}
          <div className="max-w-4xl mx-auto px-4 pt-8">
            <Link 
              href="/blog"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>
          </div>

          {/* Article Header */}
          <article className="max-w-4xl mx-auto px-4 py-12">
            <header className="mb-12">
              {post.featured && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Featured Post
                  </span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {post.title}
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
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
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

            {/* Article Content */}
            <MarkdownRenderer content={post.content} />

            {/* Article Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-gray-400">
                  <p>Thanks for reading!</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${post.slug}`)}`}
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
      </Layout>
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

  return {
    props: {
      post,
    },
  }
}
