import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import { getAllPeople, type PersonSummary } from '@/lib/people'
import { PersonCard } from '@/components/stars/PersonCard'

interface PeopleIndexProps {
  people: PersonSummary[]
}

export const getStaticProps: GetStaticProps<PeopleIndexProps> = async () => {
  const people = getAllPeople()

  // Sort alphabetically by name
  people.sort((a, b) => a.name.localeCompare(b.name))

  return { props: { people } }
}

export default function PeopleIndex({ people }: PeopleIndexProps) {
  return (
    <>
      <Head>
        <title>People — Stars — Kylin Miao</title>
        <meta name="description" content={`Directory of ${people.length} tracked AI leaders with cross-platform activity from GitHub and Bluesky.`} />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-20">
          {/* Back link */}
          <Link
            href="/stars/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All Stars & Posts
          </Link>

          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">People</h1>
          <p className="text-gray-400 mb-10">
            {people.length} AI leaders tracked across GitHub and Bluesky.
          </p>

          {/* People grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {people.map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
