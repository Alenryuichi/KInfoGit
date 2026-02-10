import { GetStaticProps } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import About from '@/components/About'
import Skills from '@/components/Skills'
import GitHubActivity from '@/components/GitHubActivity'
import { profileData } from '@/lib/config'

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  pushed_at: string
}

interface AboutPageProps {
  profileData: typeof profileData
  githubRepos: GitHubRepo[]
}

export default function AboutPage({ profileData, githubRepos }: AboutPageProps) {
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

        {/* GitHub Activity Section */}
        <div className="relative z-10">
          <GitHubActivity initialRepos={githubRepos} />
        </div>

        {/* Skills Section */}
        <div className="relative z-10">
          <Skills />
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const GITHUB_USERNAME = 'Alenryuichi'

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'KInfoGit-Portfolio',
  }

  // Use GitHub token if available (increases rate limit from 60 to 5000/hour)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  let githubRepos: GitHubRepo[] = []

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=3`,
      { headers }
    )

    if (response.ok) {
      githubRepos = await response.json()
    } else {
      console.error('GitHub API error:', response.status)
    }
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error)
  }

  return {
    props: {
      profileData,
      githubRepos,
    },
  }
}
