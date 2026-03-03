"use client"

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  display_order?: number
  view_count?: number
  helpful_count?: number
  not_helpful_count?: number
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [faqData, setFaqData] = useState<FAQItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch FAQ data
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/faqs/public')
        const data = await response.json()
        
        if (data.success && data.data?.faqs) {
          setFaqData(data.data.faqs)
        } else {
          setError('Failed to load FAQ data')
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error)
        setError('Failed to load FAQ data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-gray-900 mb-6">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-lg text-gray-600">
            Want to know more about FreshCounty. Kindly go
            <br />
            through the FAQs.
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#FE4501] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading FAQ...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-gray-600">FAQ content is currently unavailable.</p>
            </div>
          ) : faqData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No FAQ items available at the moment.</p>
            </div>
          ) : (
            faqData.map((item) => (
              <div key={item.id} className={`rounded-2xl shadow-sm border transition-all duration-300 ${
                openItems.includes(item.id) 
                  ? 'bg-[#FE4501]/5 border-[#FE4501]/20' 
                  : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-gray-900 text-lg">
                    {item.question}
                  </span>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="w-6 h-6 text-gray-600 flex-shrink-0 cursor-pointer" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600 flex-shrink-0 cursor-pointer" />
                  )}
                </button>
                
                {openItems.includes(item.id) && (
                  <div className="px-8 pb-6">
                    <p className="text-base text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}