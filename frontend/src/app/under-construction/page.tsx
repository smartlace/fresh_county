"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_CONFIG } from '@/lib/config'

export default function UnderConstruction() {
  const router = useRouter()

  useEffect(() => {
    // Check construction mode status every 5 seconds
    const checkConstructionMode = async () => {
      try {
        const apiUrl = API_CONFIG.BASE_URL
        const response = await fetch(`${apiUrl}/settings/public/under-construction`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          // If construction mode is disabled, redirect to homepage
          if (!data.underConstruction) {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Error checking construction mode:', error)
      }
    }

    // Check immediately when component mounts
    checkConstructionMode()

    // Then check every 5 seconds
    const interval = setInterval(checkConstructionMode, 5000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FE4501]/10 to-white flex items-center justify-center px-4 py-32">
      <div className="text-center max-w-2xl mx-auto">
        {/* Construction Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-[#FE4501]/10 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-16 h-16 text-[#FE4501]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-[#FE4501] mb-4">
            Under Construction
          </h1>
          <div className="w-24 h-1 bg-[#FE4501] mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            We&apos;re Building Something Amazing!
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Our website is currently undergoing scheduled maintenance and improvements.
          </p>
          <p className="text-gray-500">
            We&apos;ll be back online soon with exciting new features and a better shopping experience.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div className="bg-[#FE4501] h-3 rounded-full w-3/4 transition-all duration-1000"></div>
          </div>
          <p className="text-sm text-gray-500">75% Complete</p>
        </div>


        {/* Contact Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            For urgent inquiries, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <a 
              href="mailto:support@freshcounty.com"
              className="flex items-center text-[#FE4501] hover:text-[#FE4501]/80 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@freshcounty.com
            </a>
            <a 
              href="tel:+234123456789"
              className="flex items-center text-[#FE4501] hover:text-[#FE4501]/80 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +234 123 456 789
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Fresh County. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}