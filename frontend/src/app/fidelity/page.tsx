'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import Image from 'next/image'

export default function FidelityPage() {
  const steps = [
    {
      number: 1,
      title: "How to get Fresh County Card",
      description: "You can obtain the Card in a Fresh County store by simply requesting for it from our sales staff. It becomes available for pickup or delivery 24 hours from the time of request."
    },
    {
      number: 2,
      title: "Fresh County Card top-up",
      description: "You can top up your FC Card at any Fresh County store using cash, a debit/credit card, or a wire transfer, and the amount will be loaded onto your card as store credit."
    },
    {
      number: 3,
      title: "Fresh County Card top-up",
      description: "To use the funds on your card, simply bring it with you for in-store purchases where it will be swiped, tapped, or inserted at the payment machine to complete your transaction."
    },
    {
      number: 4,
      title: "Fresh County Card top-up",
      description: "Enjoy a faster, more secure way to shop, track your spending, and share the convenience with family, all while keeping your bank cards safe."
    }
  ]

  return (
    <MainLayout>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[1260px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/fidelity-bg-new.png"
            alt="Customer receiving Fresh County Fidelity Card"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 min-h-[1260px] flex items-start pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div className="col-span-2 md:col-span-2 lg:col-span-3">
                  <h1 className="text-[60px] font-bold text-white mb-6 uppercase tracking-wide leading-tight">
                    FIDELITY CARD
                  </h1>
                  <p className="text-lg md:text-xl text-white leading-relaxed max-w-lg">
                    Fresh County Fidelity Card is your hassle-free access to all 
                    our Products with just a tap. It gives you a simple, secure 
                    and seamless card alternative.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#f5f5f5]">        
        {/* Single Page Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">

        {/* Rewards Program Section */}
        <div className="text-center mb-12">
          <h2 className="text-[36px] font-bold text-gray-900 mb-6 uppercase tracking-wide leading-tight">
            JOIN OUR FRESH COUNTY<br />REWARDS PROGRAM
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto mb-16">
            Fresh County Fidelity Card is your hassle-free access to all our 
            Products with just a tap. It gives you a simple, secure and seamless 
            card alternative.
          </p>
        </div>

        {/* Steps List - Single Card */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8">
            <div className="relative">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="flex items-start py-6">
                    <div className="flex-shrink-0 mr-6 relative z-10">
                      <div className="w-14 h-14 bg-orange-50 text-black rounded-full flex items-center justify-center font-medium text-[16px]">
                        {step.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="absolute left-1/2 top-12 w-0.5 bg-orange-50 h-16 transform -translate-x-1/2"></div>
                      )}
                    </div>
                    <div className="flex-shrink-0 mr-8" style={{minWidth: '320px'}}>
                      <h3 className="text-[16px] font-medium text-gray-900 mt-5">
                        {step.title}
                      </h3>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed text-[16px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="ml-20">
                      <hr className="border-gray-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
      </div>
    </MainLayout>
  )
}