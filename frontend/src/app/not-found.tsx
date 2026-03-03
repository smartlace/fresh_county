"use client"

import React from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-32">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-[#FE4501] mb-4">404</h1>
            <div className="w-24 h-1 bg-[#FE4501] mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <p className="text-gray-500">
              Don&apos;t worry, it happens to the best of us!
            </p>
          </div>

          {/* Illustration/Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
                {/* Broken link indicator - diagonal line through it */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6"
                />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button className="bg-[#FE4501] hover:bg-[#FE4501]/90 text-white px-8 py-3 cursor-pointer">
                Go Home
              </Button>
            </Link>
            
            <Link href="/categories">
              <Button 
                variant="outline" 
                className="border-[#FE4501] text-[#FE4501] hover:bg-[#FE4501] hover:text-white px-8 py-3 cursor-pointer"
              >
                Shop Now
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}