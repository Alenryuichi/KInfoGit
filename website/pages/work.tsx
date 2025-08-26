import { GetStaticProps } from 'next'
import Head from 'next/head'
import Projects from '@/components/Projects'
import Experience from '@/components/Experience'
import { profileData } from '@/lib/config'

interface WorkPageProps {
  profileData: typeof profileData
}

export default function WorkPage({ profileData }: WorkPageProps) {
  return (
    <>
      <Head>
        <title>Work - {profileData.name}</title>
        <meta name="description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
        <meta property="og:title" content={`Work - ${profileData.name}`} />
        <meta property="og:description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Work - ${profileData.name}`} />
        <meta name="twitter:description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
      </Head>

      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background Effects - 与 Home 页面一致 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Projects Section */}
        <section className="py-20 pt-32 relative z-10">
          <Projects />
        </section>

        {/* Experience Section */}
        <section className="py-20 relative z-10">
          <Experience />
        </section>
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
