import { ReactNode, useState } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import Footer from './Footer'
import ContactModal from './ContactModal'

const FloatingLines = dynamic(() => import('./FloatingLines'), { ssr: false })

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
      {/* Floating Lines Background */}
      <div className="fixed inset-0 z-0">
        <FloatingLines
          linesGradient={['#1e3a5f', '#2d1b4e', '#1a1a2e']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[5, 6, 5]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={false}
          parallax={false}
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