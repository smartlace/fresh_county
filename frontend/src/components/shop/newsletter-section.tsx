"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | ''>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        // Check if it's a duplicate subscription based on the message
        const isDuplicate = data.message.includes('already subscribed')
        
        setMessage(data.message || 'Thank you for subscribing!')
        // Show as warning for duplicates, success for new subscriptions
        setMessageType(isDuplicate ? 'warning' : 'success')
        
        // Only clear email if it's a new subscription
        if (!isDuplicate) {
          setEmail('')
        }

        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setMessage('')
          setMessageType('')
        }, 5000)
      } else {
        setMessage(data.message || 'Something went wrong. Please try again.')
        setMessageType('error')

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setMessage('')
          setMessageType('')
        }, 5000)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setMessage('Failed to subscribe. Please check your connection and try again.')
      setMessageType('error')

      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              GET OUR LATEST<br />UPDATES
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join our subscribers list to get the latest news, updates and 
              special offers delivered directly in your inbox.
            </p>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 max-w-lg">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex-1 h-12 px-4 text-base text-black border-0 bg-transparent focus:ring-0 focus:outline-none focus:border focus:border-[#FE4501] rounded disabled:opacity-50"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !email.trim()}
                  className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-8 py-3 h-12 rounded text-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                </Button>
              </form>
              
              {/* Success/Error/Warning Messages */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  messageType === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : messageType === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Smoothie Image */}
          <div className="flex-shrink-0 ml-auto">
            <div className="w-80 relative" style={{ height: '614px' }}>
              <Image
                src="/nws.png"
                alt="FreshCounty Smoothie"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}