'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import Image from 'next/image'
import Link from 'next/link'

export default function MaasPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  
  const heroImages = [
    '/maas-hero.png',
    '/maas-hero-2.png',
    '/maas-hero-3.png'
  ]
  
  const juices = [
    'Pure Oranges',
    'Watermelons', 
    'Cane Juice',
    'Spicy Pine',
    'Tiger Milk',
    'Lime Juice',
    'Lemon Juice'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      // End transition after animation completes
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex)
        setNextImageIndex((prevNext) => 
          prevNext === heroImages.length - 1 ? 0 : prevNext + 1
        )
        setIsTransitioning(false)
      }, 700) // Match animation duration exactly
      
    }, 5700) // Total cycle: 5000ms display + 700ms transition

    return () => clearInterval(interval)
  }, [nextImageIndex, heroImages.length])

  return (
    <>
      <style jsx>{`
        @keyframes slideDownFromTop {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <MainLayout>
        <div className="bg-white">
        {/* Header spacer */}
        <div className="h-4"></div>
      
      {/* Hero Section - Manufacturing as a Service */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-1 lg:order-1">
              <h1 className="text-[50px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                MANUFACTURING<br />AS A SERVICE
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                We can produce for you with your name branded on it so we can 
                give you large quantity that you can use for your other range of 
                products such as cocktails, mocktails, shakes and more.
              </p>
            </div>
            <div className="order-2 lg:order-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                {/* Main Image Display */}
                <div className="absolute inset-0">
                  <Image
                    src={heroImages[currentImageIndex]}
                    alt="Manufacturing as a Service"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Bottom opacity fade overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Sliding Overlay for Transition */}
                {isTransitioning && (
                  <div 
                    className="absolute inset-0 transition-all duration-700 ease-in-out transform translate-y-0 opacity-100"
                    style={{ animation: 'slideDownFromTop 700ms ease-in-out forwards' }}
                  >
                    <Image
                      src={heroImages[nextImageIndex]}
                      alt="Manufacturing as a Service"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Bottom opacity fade overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliver Any Quantity Section */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-1 lg:order-1">
              <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                WE CAN DELIVER<br />ANY QUANTITY
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We have the capacity to deliver any quantity you 
                need daily and would be delighted to work with 
                you as your backend juice factory.
              </p>
            </div>
            <div className="order-2 lg:order-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/maas-quantity.png"
                  alt="Man preparing healthy smoothie"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-1 lg:order-1">
              <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                WE HAVE CREATED A SET<br />MENU
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                We can also work with you to create some more 
                interesting menu suitable for your business needs.
              </p>
              <Link href="/maas-order">
                <button className="bg-[#FE4501] text-white px-8 py-3 rounded-lg font-semibold text-[14px] hover:bg-[#FE4501]/90 transition-colors duration-200">
                  GET STARTED
                </button>
              </Link>
            </div>
            
            <div className="order-2 lg:order-2">
              <div className="bg-gray-50 rounded-lg py-8 shadow-xl text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide pb-4 border-b border-gray-200">
                  JUICES (RAW MATERIALS)
                </h3>
                <ul className="space-y-4">
                  {juices.map((juice, index) => (
                    <li key={index} className="text-lg text-gray-700 py-2 border-b border-gray-200 last:border-b-0">
                      {juice}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </MainLayout>
    </>
  )
}