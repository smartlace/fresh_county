'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { FAQSection } from '@/components/shop/faq-section'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="bg-[#f5f5f5]">
        {/* Header spacer */}
        <div className="h-4"></div>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Founded in 2014 Section */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-8">
              {/* Left Content */}
              <div>
                <p className="text-sm text-[#FE4501] uppercase tracking-wide mb-4">
                  WE ARE A NIGERIAN AGRITECH COMPANY
                </p>
                <h1 className="text-[48px] font-bold text-gray-900 uppercase tracking-wide leading-tight">
                  FOUNDED IN 2014
                </h1>
              </div>
              
              {/* Right Content - Description */}
              <div>
                <p className="text-lg text-gray-600 leading-relaxed mt-[60px]">
                  We are a company that offers freshly made natural juice for daily consumption. Fresh 
                  County Juice and Smoothies have been a successful product brand in Nigeria for some 
                  time now.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Image */}
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="/about-image-1.png"
                  alt="Fresh fruits and vegetables"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Right Image */}
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="/about-image-2.png"
                  alt="Fresh juices and smoothies"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </section>

          {/* Our Mission Section */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Image - Woman drinking */}
              <div className="order-2 lg:order-1">
                <div className="relative h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src="/about-mission.jpg"
                    alt="Woman enjoying fresh juice"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              
              {/* Right Content */}
              <div className="order-1 lg:order-2">
                <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                  OUR MISSION
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our mission is to supply your body with nutrients and 
                  promote healthy eating habits.
                </p>
              </div>
            </div>
          </section>

          {/* Our Products Section */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="order-1 lg:order-1">
                <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                  OUR PRODUCTS
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Offer a range of fresh juices, smoothies, parfaits, 
                  salads, wraps, and other healthy options.
                </p>
              </div>
              
              {/* Right Image Grid */}
              <div className="order-2 lg:order-2">
                <div className="grid grid-cols-2 gap-4">
                  {/* Top row */}
                  <div className="relative h-[210px] rounded-lg overflow-hidden">
                    <Image
                      src="/about-smoothies.jpg"
                      alt="Fresh smoothies"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative h-[210px] rounded-lg overflow-hidden">
                    <Image
                      src="/about-juices-grid.jpg"
                      alt="Colorful juices"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  
                  {/* Bottom row */}
                  <div className="relative h-[210px] rounded-lg overflow-hidden">
                    <Image
                      src="/about-salads.jpg"
                      alt="Fresh salads"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative h-[210px] rounded-lg overflow-hidden">
                    <Image
                      src="/about-meals.jpg"
                      alt="Healthy meals"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </MainLayout>
  )
}