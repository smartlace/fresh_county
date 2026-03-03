"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/home-bg.jpg"
        alt="FreshCounty Hero Background"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20"></div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="col-span-2 md:col-span-2 lg:col-span-3">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  PURE FRUIT MAGIC
                  <br />
                  IN EVERY SIP
                </h1>
                <p className="text-lg md:text-xl text-white mb-8 leading-relaxed max-w-lg">
                  Thirst-quenching, naturally delicious drinks made from real fruit. No additives, just pure refreshment in every sip
                </p>
                <Link href="/categories">
                  <Button className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200">
                    ORDER NOW!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}