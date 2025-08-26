import { GetStaticProps } from 'next'
import Head from 'next/head'
import Layout from '@/components/Layout'
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
      
      <Layout>
        <main className="min-h-screen pt-20">
          {/* Projects Section */}
          <section className="py-20">
            <Projects />
          </section>
          
          {/* Experience Section */}
          <section className="py-20 bg-black/20">
            <Experience />
          </section>
        </main>
      </Layout>
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
