import { GetStaticProps } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import About from '@/components/About'
import Skills from '@/components/Skills'
import { profileData } from '@/lib/config'

interface AboutPageProps {
  profileData: typeof profileData
}

export default function AboutPage({ profileData }: AboutPageProps) {
  // Handle smooth scroll to hash anchor on page load (for cross-page navigation)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const element = document.getElementById(hash)
      if (element) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [])

  return (
    <>
      <Head>
        <title>About - {profileData.name}</title>
        <meta name="description" content={`Learn more about ${profileData.name}, ${profileData.title}`} />
        <meta property="og:title" content={`About - ${profileData.name}`} />
        <meta property="og:description" content={`Learn more about ${profileData.name}, ${profileData.title}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`About - ${profileData.name}`} />
        <meta name="twitter:description" content={`Learn more about ${profileData.name}, ${profileData.title}`} />
      </Head>

      <main className="min-h-screen text-white relative overflow-hidden">
        {/* About Section */}
        <section className="pt-32 pb-8 relative z-10">
          <About />
        </section>

        {/* Skills Section */}
        <div className="relative z-10">
          <Skills />
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      profileData,
    },
  }
}
