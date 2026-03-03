'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import Image from 'next/image'

export default function DetoxProgramPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50">
        {/* Header spacer */}
        <div className="h-4"></div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image Grid Section */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              {/* Top Left - Woman eating */}
              <div className="space-y-4 mt-8">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src="/detox-1.png"
                    alt="Woman enjoying healthy meal"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                {/* Bottom Left - Man with grocery basket */}
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src="/detox-3.png"
                    alt="Man with fresh groceries"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                {/* Top Right - Man preparing smoothie */}
                <div className="aspect-[4/5] relative rounded-lg overflow-hidden">
                  <Image
                    src="/detox-2.png"
                    alt="Man preparing healthy smoothie"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                {/* Bottom Right - Woman eating bowl */}
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src="/detox-4.png"
                    alt="Woman eating healthy bowl"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="order-1 lg:order-2 lg:pl-8">
            <div className="max-w-lg">
              <h1 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide">
                REBOOT PROGRAM
              </h1>
              
              <div className="prose prose-lg text-gray-700 leading-relaxed">
                <p className="mb-4">
                  It&apos;s a period of time where you commit to drinking and 
                  eating fruits and vegetables that will help optimize 
                  your vitality, lose weight and kick-start healthy habits that 
                  will help your body and your diet back in alignment for 
                  optimal wellness.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
      </div>
    </MainLayout>
  )
}