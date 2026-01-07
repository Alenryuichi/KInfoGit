import { GetStaticProps } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import About from '@/components/About'
import Skills from '@/components/Skills'
import WorkExperience from '@/components/WorkExperience'
import { profileData } from '@/lib/config'
import { getWorkExperience, type WorkExperience as WorkExperienceType } from '@/lib/data'

interface AboutPageProps {
  profileData: typeof profileData
  workExperience: WorkExperienceType[]
}

export default function AboutPage({ profileData, workExperience }: AboutPageProps) {
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

      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Effects - 与 Home 页面一致 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* About Section */}
        <section className="py-20 pt-32 relative z-10">
          <About />
        </section>

        {/* Work Experience Section */}
        <WorkExperience data={workExperience} />

        {/* Skills Section */}
        <section className="py-20 relative z-10">
          <Skills />
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const workExperience = await getWorkExperience() || []
  return {
    props: {
      profileData,
      workExperience,
    },
  }
}
