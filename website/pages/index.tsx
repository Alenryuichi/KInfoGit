import Head from 'next/head'
import Hero from '@/components/Hero'
import Layout from '@/components/Layout'
import { profileData } from '@/lib/config'

export default function Home() {
  return (
    <>
      <Head>
        <title>{profileData.name} - {profileData.title}</title>
        <meta name="description" content={profileData.bio} />
        <meta name="keywords" content="anti-fraud, full-stack developer, system architecture, graph database, data analysis, Python, Go, Vue.js" />
        <meta property="og:title" content={`${profileData.name} - ${profileData.title}`} />
        <meta property="og:description" content={profileData.bio} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://alenryuichi.github.io/KInfoGit" />
      </Head>

      <Layout>
        <main className="min-h-screen">
          <Hero />
        </main>
      </Layout>
    </>
  )
}

