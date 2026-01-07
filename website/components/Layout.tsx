import { ReactNode, useState } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import Footer from './Footer'
import ContactModal from './ContactModal'

const FaultyTerminal = dynamic(() => import('./FaultyTerminal'), { ssr: false })

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const handleBookCallClick = () => {
    setIsContactModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsContactModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-black transition-colors relative">
      {/* Faulty Terminal Background */}
      <div className="fixed inset-0 z-0">
        <FaultyTerminal
          scale={1.5}
          digitSize={1.2}
          timeScale={0.5}
          noiseAmp={1}
          brightness={0.6}
          scanlineIntensity={0.5}
          curvature={0.1}
          mouseStrength={0.5}
          mouseReact={true}
          pageLoadAnimation={false}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header onBookCallClick={handleBookCallClick} />
        <main>
          {children}
        </main>
        <Footer />
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}