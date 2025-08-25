'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail, Calendar, Linkedin, Github, Twitter, Send } from 'lucide-react'
import { animateModalOpen, animateModalClose, animateModalContent, animateDragClose } from '@/utils/animations'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [messageCount, setMessageCount] = useState(0)
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [startY, setStartY] = useState(0)

  // GSAP动画引用
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // 重置表单状态
  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' })
    setErrors({ name: '', email: '', message: '' })
    setMessageCount(0)
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)

      // 完全禁用所有滚动条
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      // 额外保险：隐藏所有可能的滚动条
      document.body.style.scrollbarWidth = 'none'
      ;(document.body.style as any).msOverflowStyle = 'none'
      document.documentElement.style.scrollbarWidth = 'none'
      ;(document.documentElement.style as any).msOverflowStyle = 'none'

      // 清理之前的动画
      if (closeTimelineRef.current) {
        closeTimelineRef.current.kill()
      }

      // 启动打开动画
      if (modalRef.current && backdropRef.current) {
        // 在动画开始前立即禁用弹窗滚动
        modalRef.current.style.overflow = 'hidden'

        // 在弹窗动画开始前，先隐藏内容元素
        const modalHeader = modalRef.current.querySelector('.modal-header')
        const modalTabs = modalRef.current.querySelector('.modal-tabs')
        const modalContent = modalRef.current.querySelector('.modal-content')

        if (modalHeader) (modalHeader as HTMLElement).style.opacity = '0'
        if (modalTabs) (modalTabs as HTMLElement).style.opacity = '0'
        if (modalContent) (modalContent as HTMLElement).style.opacity = '0'

        openTimelineRef.current = animateModalOpen(
          modalRef.current,
          backdropRef.current,
          () => {
            // 动画完成后恢复滚动并启动内容动画
            if (modalRef.current) {
              modalRef.current.style.overflow = 'auto'
            }
            setIsAnimating(false)
            // 立即播放内容动画，无需等待
            animateModalContent()
          }
        )
      }
    } else if (modalRef.current && backdropRef.current) {
      setIsAnimating(true)

      // 清理之前的动画
      if (openTimelineRef.current) {
        openTimelineRef.current.kill()
      }

      // 在关闭动画开始前禁用滚动
      modalRef.current.style.overflow = 'hidden'

      // 启动关闭动画
      closeTimelineRef.current = animateModalClose(
        modalRef.current,
        backdropRef.current,
        () => {
          // 恢复页面滚动
          document.body.style.overflow = 'unset'
          document.documentElement.style.overflow = 'unset'
          document.body.style.scrollbarWidth = 'auto'
          ;(document.body.style as any).msOverflowStyle = 'auto'
          document.documentElement.style.scrollbarWidth = 'auto'
          ;(document.documentElement.style as any).msOverflowStyle = 'auto'

          // 重置内容元素状态，为下次打开做准备
          if (modalRef.current) {
            const modalHeader = modalRef.current.querySelector('.modal-header')
            const modalTabs = modalRef.current.querySelector('.modal-tabs')
            const modalContent = modalRef.current.querySelector('.modal-content')

            if (modalHeader) (modalHeader as HTMLElement).style.opacity = '0'
            if (modalTabs) (modalTabs as HTMLElement).style.opacity = '0'
            if (modalContent) (modalContent as HTMLElement).style.opacity = '0'
          }

          setIsAnimating(false)
          setDragY(0) // 重置拖拽状态
          resetForm() // 重置表单状态
        }
      )
    }

    return () => {
      // 清理样式
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.style.scrollbarWidth = 'auto'
      ;(document.body.style as any).msOverflowStyle = 'auto'
      document.documentElement.style.scrollbarWidth = 'auto'
      ;(document.documentElement.style as any).msOverflowStyle = 'auto'

      // 清理动画
      if (openTimelineRef.current) {
        openTimelineRef.current.kill()
      }
      if (closeTimelineRef.current) {
        closeTimelineRef.current.kill()
      }
    }
  }, [isOpen])

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientY)
      }
      
      const handleGlobalMouseUp = () => {
        handleDragEnd()
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, startY, dragY])

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Name is required'
        }
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters'
        }
        return ''
      case 'email':
        if (!value.trim()) {
          return 'Email is required'
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value.trim())) {
          return 'Invalid email address'
        }
        return ''
      case 'message':
        if (!value.trim()) {
          return 'Message is required'
        }
        if (value.trim().length < 10) {
          return 'Message must be at least 10 characters'
        }
        return ''
      default:
        return ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    if (name === 'message') {
      setMessageCount(value.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      message: validateField('message', formData.message)
    }

    setErrors(newErrors)

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '')

    if (hasErrors) {
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Form submitted:', formData)
      alert('Message sent successfully!')

      // Reset form
      setFormData({ name: '', email: '', message: '' })
      setMessageCount(0)
      setErrors({ name: '', email: '', message: '' })
      onClose()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理触摸/鼠标拖拽事件
  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    setStartY(clientY)
    setDragY(0)
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return
    const deltaY = clientY - startY
    if (deltaY > 0) { // 只允许向下拖拽
      setDragY(deltaY)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // 如果拖拽距离超过100px，关闭弹窗
    if (dragY > 100) {
      // 使用GSAP动画关闭
      if (modalRef.current && backdropRef.current) {
        animateDragClose(
          modalRef.current,
          backdropRef.current,
          () => {
            onClose()
          }
        )
      } else {
        onClose()
      }
    } else {
      // 平滑回弹到原位
      setDragY(0)
    }
  }

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
  }

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@aayushbharti.in'
  }

  const handleCalendarClick = () => {
    // 这里可以集成日历预约系统，比如 Calendly
    window.open('https://calendly.com/your-calendar', '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        style={{ visibility: 'hidden' }}
        onClick={onClose}
      />
      
      {/* Modal Container - positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center px-4">
        <div
          ref={modalRef}
          className={`modal-container relative bg-black border-t border-l border-r border-gray-700 rounded-t-3xl w-full max-w-xl max-h-[70vh] shadow-2xl ${
            isAnimating ? '' : 'overflow-y-auto'
          }`}
          style={{
            visibility: 'hidden',
            transform: isDragging ? `translateY(${dragY}px)` : undefined,
            transition: isDragging ? 'none' : undefined,
            overflow: isAnimating ? 'hidden' : 'auto',
            // 完全隐藏滚动条
            scrollbarWidth: 'none',
            msOverflowStyle: 'none' as any
          }}
        >
          {/* Drag Handle */}
          <div 
            className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1 bg-white/30 rounded-full"></div>
          </div>
          
          <div className="p-6 pt-4">
            {/* Social Links */}
            <div className="modal-header flex justify-center space-x-6 mb-6" style={{ opacity: 0 }}>
              <a
                href="https://linkedin.com/in/kylin-miao"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/kylin-miao"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/kylin_miao"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Tab Switcher */}
            <div className="modal-tabs flex justify-center mb-6 gap-3" style={{ opacity: 0 }}>
              <button
                onClick={() => setActiveTab('quick')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                  activeTab === 'quick'
                    ? 'text-white tab-selected'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{ minWidth: '120px' }}
              >
                Quick connect
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                  activeTab === 'form'
                    ? 'text-white tab-selected'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{ minWidth: '100px' }}
              >
                Fill a form
              </button>
            </div>

            {/* Content */}
            <div className="modal-content relative overflow-hidden" style={{ opacity: 0 }}>
              {/* Quick Connect Content */}
              <div
                className={`transition-all duration-500 ease-out ${
                  activeTab === 'quick'
                    ? 'opacity-100 translate-x-0 relative'
                    : 'opacity-0 -translate-x-4 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="space-y-4">
                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Email Card */}
                    <div
                      onClick={handleEmailClick}
                      className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 cursor-pointer hover:bg-blue-600/20 transition-all duration-300 group"
                    >
                      <div className="flex items-center mb-3">
                        <Mail className="w-5 h-5 text-blue-400 mr-2" />
                        <h3 className="text-base font-semibold text-white">Email</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white text-sm font-medium">hello@aayushbharti.in</p>
                        <p className="text-gray-400 text-xs">Send me an email directly</p>
                      </div>
                    </div>

                    {/* Calendar Card */}
                    <div
                      onClick={handleCalendarClick}
                      className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4 cursor-pointer hover:bg-purple-600/20 transition-all duration-300 group"
                    >
                      <div className="flex items-center mb-3">
                        <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                        <h3 className="text-base font-semibold text-white">Book a Call</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white text-sm font-medium">Schedule a time slot</p>
                        <p className="text-gray-400 text-xs">Book a call on my calendar</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center mt-6">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-breathing-pulse text-green-400" />
                      <span className="text-green-400 text-xs font-medium">Currently available for new opportunities</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div
                className={`transition-all duration-500 ease-out ${
                  activeTab === 'form'
                    ? 'opacity-100 translate-x-0 relative'
                    : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
                }`}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${errors.name ? 'text-red-400' : 'text-white'}`}>
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                          errors.name
                            ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                            : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${errors.email ? 'text-red-400' : 'text-white'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                          errors.email
                            ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                            : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`block text-sm font-medium ${errors.message ? 'text-red-400' : 'text-white'}`}>
                        Message
                      </label>
                      <span className="text-gray-400 text-xs">{messageCount}/1000</span>
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="What would you like to discuss?"
                      rows={4}
                      maxLength={1000}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 resize-none text-sm ${
                        errors.message
                          ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                          : 'border-white/10 focus:border-white/30'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-sm ${
                      isSubmitting
                        ? 'bg-blue-600/50 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 全局样式来隐藏滚动条 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .modal-container::-webkit-scrollbar {
            display: none !important;
          }
          .modal-container {
            -webkit-scrollbar: none !important;
          }
        `
      }} />
    </div>
  )
}
