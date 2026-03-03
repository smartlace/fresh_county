'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { FAQSection } from '@/components/shop/faq-section'
import Image from 'next/image'

export default function CateringPage() {
  return (
    <MainLayout>
      
      {/* Hero Section with Background Image */}
      <section className="relative h-[450px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/catering-bg.png"
            alt="Catering background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div className="col-span-2 md:col-span-2 lg:col-span-3">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    FRESH, FLAVORFUL<br />EVENT CATERING
                  </h1>
                  <p className="text-lg md:text-xl text-white mb-8 leading-relaxed max-w-lg">
                    Vibrant fruit drinks and delicious bites for<br />
                    weddings, corporate events, and parties
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Corporate Events Section */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src="/catering-corporate.png"
                    alt="Corporate events catering"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                  CORPORATE EVENTS
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Keep meetings lively and productive with long lasting 
                  energy from our many healthy choices. Either a 
                  nutritious smoothie, freshly- squeezed juice or 
                  sandwich, there is an option for the entire office.
                </p>
              </div>
            </div>
          </section>

          {/* Family Reunion Section */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1 lg:order-1">
                <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                  FAMILY REUNION
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Why spend all day prepping meals in the kitchen 
                  when Fresh County can do it for you? Let us take 
                  away the stress of preparing a family reunion 
                  menu and focus on what&apos;s important your 
                  family!
                </p>
              </div>
              <div className="order-2 lg:order-2">
                <div className="relative h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src="/catering-family.png"
                    alt="Family reunion catering"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* FAQ Section */}
      <FAQSection />
    </MainLayout>
  )
}