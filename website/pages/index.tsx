import { GetStaticProps } from 'next'
import Head from 'next/head'
import Hero from '@/components/Hero'
import FeaturedProjects from '@/components/FeaturedProjects'
import HomeCTA from '@/components/HomeCTA'
import { profileData } from '@/lib/config'
import { getFeaturedProjects, type Project } from '@/lib/projects'

interface HomeProps {
  featuredProjects: Project[]
}

export default function Home({ featuredProjects }: HomeProps) {
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

      <main className="min-h-screen bg-black">
        <Hero />
        <FeaturedProjects projects={featuredProjects} />
        <HomeCTA />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const featuredProjects = getFeaturedProjects()
  return {
    props: {
      featuredProjects,
    },
  }
}

