import { GetStaticProps } from 'next'
import Head from 'next/head'
import Layout from '@/components/Layout'
import Contact from '@/components/Contact'
import { profileData } from '@/lib/config'

interface ContactPageProps {
  profileData: typeof profileData
}

export default function ContactPage({ profileData }: ContactPageProps) {
  return (
    <>
      <Head>
        <title>Contact - {profileData.name}</title>
        <meta name="description" content={`Get in touch with ${profileData.name}. Let's discuss opportunities and collaborations.`} />
        <meta property="og:title" content={`Contact - ${profileData.name}`} />
        <meta property="og:description" content={`Get in touch with ${profileData.name}. Let's discuss opportunities and collaborations.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Contact - ${profileData.name}`} />
        <meta name="twitter:description" content={`Get in touch with ${profileData.name}. Let's discuss opportunities and collaborations.`} />
      </Head>
      
      <Layout>
        <main className="min-h-screen pt-20">
          <Contact />
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
