import { ReactNode, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import ContactModal from './ContactModal'

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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header onBookCallClick={handleBookCallClick} />
      <main>
        {children}
      </main>
      <Footer />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}