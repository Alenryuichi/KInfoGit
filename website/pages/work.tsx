import { GetStaticProps } from 'next'
import Head from 'next/head'
import Projects from '@/components/Projects'
import Experience from '@/components/Experience'
import { profileData } from '@/lib/config'
import { getCoreProjects, type Project } from '@/lib/data'

interface WorkPageProps {
	profileData: typeof profileData
	projects: Project[]
}

export default function WorkPage({ profileData, projects }: WorkPageProps) {
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

      <main className="min-h-screen text-white relative overflow-hidden">
        {/* Projects Section */}
        <section className="py-20 pt-32 relative z-10">
	          <Projects projects={projects} />
	        </section>

        {/* Experience Section */}
        <section className="py-20 relative z-10">
          <Experience />
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<WorkPageProps> = async () => {
	const projects = await getCoreProjects()
	return {
		props: {
			profileData,
			projects: projects ?? [],
		},
	}
}
