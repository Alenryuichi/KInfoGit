import { useState, useCallback } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { Projects } from '@/components/Projects'
import { Experience } from '@/components/Experience'
import { WorkAuthGate } from '@/components/WorkAuthGate'
import { profileData } from '@/lib/config'
import { getCoreProjects, type Project } from '@/lib/data'
import type { EncryptedPayload } from '@/lib/crypto'

interface WorkPageProps {
	profileData: typeof profileData
	/** Present when WORK_PASSWORD is set — encrypted projects JSON */
	encryptedPayload?: EncryptedPayload
	/** Present when WORK_PASSWORD is NOT set — plain projects (dev mode) */
	projects?: Project[]
}

export default function WorkPage({ profileData, encryptedPayload, projects }: WorkPageProps) {
  const [decryptedProjects, setDecryptedProjects] = useState<Project[] | null>(
    projects ?? null,
  )

  const handleDecrypted = useCallback((json: string) => {
    try {
      setDecryptedProjects(JSON.parse(json))
    } catch {
      // Invalid JSON
    }
  }, [])

  const isLocked = !decryptedProjects && encryptedPayload

  return (
    <>
      <Head>
        <title>{`Work - ${profileData.name}`}</title>
        <meta name="description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
        <meta property="og:title" content={`Work - ${profileData.name}`} />
        <meta property="og:description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Work - ${profileData.name}`} />
        <meta name="twitter:description" content={`Explore ${profileData.name}'s professional work, projects, and experience`} />
      </Head>

      <main className="min-h-screen text-white relative overflow-hidden">
        {isLocked ? (
          <section className="py-20 pt-32 relative z-10">
            <WorkAuthGate
              encryptedPayload={encryptedPayload!}
              onDecrypted={handleDecrypted}
              hint="Work experience is access-controlled."
            />
          </section>
        ) : (
          <>
            {/* Projects Section */}
            <section className="py-20 pt-32 relative z-10">
              <Projects projects={decryptedProjects ?? []} />
            </section>

            {/* Experience Section */}
            <section className="py-20 relative z-10">
              <Experience />
            </section>
          </>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<WorkPageProps> = async () => {
	const projects = await getCoreProjects()
	const password = process.env.WORK_PASSWORD

	if (password) {
		const { getEncryptedPayload } = await import('@/lib/crypto')
		const encryptedPayload = getEncryptedPayload(projects ?? [], password)
		return {
			props: {
				profileData,
				encryptedPayload,
			},
		}
	}

	// Dev mode: no encryption
	return {
		props: {
			profileData,
			projects: projects ?? [],
		},
	}
}
