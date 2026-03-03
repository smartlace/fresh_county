'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { API_CONFIG } from '@/lib/config'

export default function MaasOrderPage() {
  const [formData, setFormData] = useState({
    email: '',
    product: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Auto-dismiss success/error messages after 5 seconds
  useEffect(() => {
    if (submitStatus.type) {
      const timer = setTimeout(() => {
        setSubmitStatus({ type: null, message: '' })
      }, 5000) // 5 seconds

      return () => clearTimeout(timer)
    }
  }, [submitStatus.type])

  const juices = [
    'Pure Oranges',
    'Watermelons', 
    'Cane Juice',
    'Spicy Pine',
    'Tiger Milk',
    'Lime Juice',
    'Lemon Juice'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/contact/maas-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Your MaaS order inquiry has been submitted successfully!'
        })
        // Reset form
        setFormData({
          email: '',
          product: '',
          message: ''
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Failed to submit your inquiry. Please try again.'
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Header spacer */}
      <div className="h-4"></div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          
          {/* Left Content - Title and Description */}
          <div className="order-1 lg:order-1">
            <h1 className="text-[48px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
              SUBMIT YOUR ORDER
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              We have the capacity to deliver any quantity you need 
              daily and would be delighted to work with you as your 
              backend juice factory.
            </p>
          </div>

          {/* Right Content - Order Form */}
          <div className="order-2 lg:order-2">
            <div className="bg-white rounded-lg shadow-xl p-8">
              
              {/* Status Message */}
              {submitStatus.type && (
                <div className={`p-4 rounded-lg mb-6 relative ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center pr-8">
                    {submitStatus.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{submitStatus.message}</span>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={() => setSubmitStatus({ type: null, message: '' })}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                    aria-label="Close message"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Product Selection Dropdown */}
                <div>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent text-gray-700 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="">Select Product</option>
                    {juices.map((juice, index) => (
                      <option key={index} value={juice}>
                        {juice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent placeholder-gray-400 resize-vertical"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#FE4501] hover:bg-[#FE4501]/90'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        SUBMITTING...
                      </div>
                    ) : (
                      'SUBMIT'
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}