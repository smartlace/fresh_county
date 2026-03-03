"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function FeaturedSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            YOU DESERVE THE BEST!
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Fruit Drinks & More */}
          <div className="bg-white rounded border border-gray-300 overflow-hidden min-h-80">
            <div className="flex flex-col lg:flex-row h-full">
              <div className="flex-1 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  FRUIT DRINKS &<br />MORE
                </h3>
                <p className="text-base text-gray-600 mb-6 leading-relaxed" style={{ marginBottom: '100px' }}>
                  From energizing smoothies to hydrating juices, salad etc—each drink is crafted with ripe, natural ingredients for flavor that never compromises on health.
                </p>
                <Link href="/categories">
                  <Button 
                    className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-6 py-3 rounded-lg text-sm w-fit"
                  >
                    ORDER NOW
                  </Button>
                </Link>
              </div>
              <div className="lg:w-64 h-64 lg:h-auto relative overflow-hidden">
                <Image
                  src="/feature1.png"
                  alt="Fruit Drinks & More"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Catering Services */}
          <div className="bg-white rounded border border-gray-300 overflow-hidden min-h-80">
            <div className="flex flex-col lg:flex-row h-full">
              <div className="flex-1 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  CATERING<br />SERVICES
                </h3>
                <p className="text-base text-gray-600 mb-6 leading-relaxed" style={{ marginBottom: '100px' }}>
                  Make your gatherings unforgettable with our vibrant, fresh fruit drink catering—perfect for weddings, offices, or special celebrations.
                </p>
                <Link href="/catering">
                  <Button 
                    className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-6 py-3 rounded-lg text-sm w-fit"
                  >
                    GET STARTED
                  </Button>
                </Link>
              </div>
              <div className="lg:w-64 h-64 lg:h-auto relative overflow-hidden">
                <Image
                  src="/feature2.png"
                  alt="Catering Services"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}