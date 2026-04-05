import { GetStaticProps } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import { About } from '@/components/About'
import { Skills } from '@/components/Skills'
import { GitHubActivity } from '@/components/GitHubActivity'
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

interface GitHubPR {
  id: number
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  merged_at: string | null
  repository_url: string
  user: {
    login: string
  }
}

interface AboutPageProps {
  profileData: typeof profileData
  githubRepos: GitHubRepo[]
  githubPRs: GitHubPR[]
}

export default function AboutPage({ profileData, githubRepos, githubPRs }: AboutPageProps) {
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
        <title>{`About - ${profileData.name}`}</title>
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
          <GitHubActivity initialRepos={githubRepos} initialPRs={githubPRs} />
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
  let githubPRs: GitHubPR[] = []

  try {
    // Fetch repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=3`,
      { headers }
    )

    if (reposResponse.ok) {
      githubRepos = await reposResponse.json()
    } else {
      console.error('GitHub API error (repos):', reposResponse.status)
    }

    // Fetch recent PRs
    const prsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+type:pr+sort:created-desc&per_page=5`,
      { headers }
    )

    if (prsResponse.ok) {
      const prsData = await prsResponse.json()
      githubPRs = prsData.items || []
    } else {
      console.error('GitHub API error (PRs):', prsResponse.status)
    }
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error)
  }

  return {
    props: {
      profileData,
      githubRepos,
      githubPRs,
    },
  }
}
