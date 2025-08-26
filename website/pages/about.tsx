import { GetStaticProps } from 'next'
import Head from 'next/head'
import Layout from '@/components/Layout'
import About from '@/components/About'
import Skills from '@/components/Skills'
import { profileData } from '@/lib/config'

interface AboutPageProps {
  profileData: typeof profileData
}

export default function AboutPage({ profileData }: AboutPageProps) {
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
      
      <Layout>
        <main className="min-h-screen pt-20">
          {/* About Section */}
          <section className="py-20">
            <About />
          </section>

          {/* Skills Section */}
          <section className="py-20 bg-black/20">
            <Skills />
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
