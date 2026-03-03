"use client"

import React from 'react'

const features = [
  {
    title: '100% FRESH PRODUCTS',
    description: 'Only real, ripe fruits—never frozen, never fake, always fresh.'
  },
  {
    title: 'DELIVERY WITHIN 40 MINUTES',
    description: 'Thirsty? Get chilled, delicious drinks at your door fast.'
  },
  {
    title: 'PRODUCED DAILY',
    description: 'Made in small batches daily for maximum flavor and freshness.'
  },
  {
    title: 'BEST VALUE FOR YOUR MONEY',
    description: 'Premium quality, fair prices—more sip for every dollar.'
  }
]

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            WHY CHOOSE US?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}