'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Github, Linkedin, Send, CheckCircle, Download, Users } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'miaojsi@outlook.com',
      href: 'mailto:miaojsi@outlook.com',
      description: 'Send me an email'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Guangzhou, China',
      description: 'Based in China'
    },
    {
      icon: Phone,
      label: 'Response Time',
      value: '24 hours',
      description: 'Average response time'
    }
  ]

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/kylinmiao',
      username: '@kylinmiao'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/kylinmiao',
      username: '@kylinmiao'
    },
    {
      icon: Users,
      label: '脉脉',
      href: 'https://maimai.cn/contact/share/card?u=n5xkqwimcgvt&_share_channel=copy_link',
      username: '@kylinmiao'
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:miaojsi@outlook.com',
      username: 'miaojsi@outlook.com'
    }
  ]

  return (
    <section id="contact" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              AVAILABLE FOR OPPORTUNITIES
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Let's work{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                together
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              I'm always interested in new opportunities and exciting projects.
              Whether you have a question or just want to say hi, I'll get back to you within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">Send me a message</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all duration-300"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all duration-300"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 transition-all duration-300 resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`w-full px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isSubmitted
                      ? 'bg-green-500 text-white'
                      : isSubmitting
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {isSubmitted ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Message Sent!
                    </span>
                  ) : isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-8">Get in touch</h3>

                <div className="space-y-6">
                  {contactInfo.map((contact, index) => {
                    const IconComponent = contact.icon
                    const content = (
                      <div className="group p-6 bg-gray-900/50 border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-300 hover:bg-gray-900/70">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-colors">
                            <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <div className="font-semibold text-white mb-1">
                              {contact.label}
                            </div>
                            <div className="text-gray-300 mb-2">
                              {contact.value}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contact.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )

                    return contact.href ? (
                      <a key={index} href={contact.href} className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={index}>{content}</div>
                    )
                  })}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6">Connect with me</h4>

                <div className="space-y-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:border-gray-700/50 transition-all duration-300 hover:bg-gray-900/70"
                      >
                        <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                          <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {social.label}
                          </div>
                          <div className="text-sm text-gray-400">
                            {social.username}
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-800/50 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to start your project?
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                I'm currently available for freelance work and full-time opportunities.
                Let's discuss how we can bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:miaojsi@outlook.com"
                  className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Email
                </a>
                <a
                  href="/resume.pdf"
                  download="Kylin-Miao-Resume.pdf"
                  className="inline-flex items-center px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-full hover:border-gray-400 hover:text-white transition-all duration-300"
                >
                  Download Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}