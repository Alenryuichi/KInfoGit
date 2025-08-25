import Head from 'next/head'
import { useEffect } from 'react'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import Experience from '@/components/Experience'
import Blog from '@/components/Blog'
import Contact from '@/components/Contact'
import { animateOnScroll, cleanupScrollTriggers } from '@/utils/animations'
import { BlogPost, getAllBlogPosts, getAllTags } from '@/lib/data'

interface HomeProps {
  posts: BlogPost[]
  tags: string[]
}

export default function Home({ posts, tags }: HomeProps) {
  useEffect(() => {
    // 初始化其他section的滚动动画
    animateOnScroll('#about')
    animateOnScroll('#blog')
    animateOnScroll('#contact')

    // 清理函数
    return () => {
      cleanupScrollTriggers()
    }
  }, [])
  return (
    <>
      <Head>
        <title>苗静思 Kylin - Full-stack Anti-fraud Expert & Developer</title>
        <meta name="description" content="Full-stack anti-fraud technology expert specializing in large-scale data analysis, system architecture, and graph database technologies." />
        <meta name="keywords" content="anti-fraud, full-stack developer, system architecture, graph database, data analysis, Python, Go, Vue.js" />
        <meta property="og:title" content="苗静思 Kylin - Full-stack Anti-fraud Expert" />
        <meta property="og:description" content="Tencent Senior Backend Engineer specializing in anti-fraud technology and large-scale system architecture" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://username.github.io/KInfoGit" />
      </Head>

      <main className="min-h-screen">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Blog posts={posts} tags={tags} />
        <Contact />
      </main>
    </>
  )
}

export async function getStaticProps() {
  const posts = await getAllBlogPosts()
  const tags = await getAllTags()

  return {
    props: {
      posts,
      tags,
    },
  }
}