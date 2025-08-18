import Head from 'next/head'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import Experience from '@/components/Experience'
import Contact from '@/components/Contact'

export default function Home() {
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
        <Contact />
      </main>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {},
  }
}