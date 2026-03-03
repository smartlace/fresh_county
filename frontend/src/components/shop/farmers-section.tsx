import React from 'react'
import Image from 'next/image'

export function FarmersSection() {
  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/fpic.png"
        alt="Small holder farmers"
        fill
        className="object-cover"
        priority
      />
      
      {/* Content with consistent grid */}
      <div className="relative z-10 h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="relative h-full">
            {/* Black Overlay - Fixed 450px width */}
            <div className="absolute top-0 left-0 w-[450px] h-full bg-black/80 flex items-center justify-center">
              <div className="px-8 text-left">
                <h2 className="text-[40px] font-bold text-white mb-6 leading-tight">
                  WE HELP SMALL
                  <br />
                  HOLDER FARMERS
                </h2>
                <p className="text-base text-white leading-relaxed max-w-lg opacity-95">
                  We help small holder farmers distribute their produce more efficiently through partnerships. Creating sustainable livelihoods, supporting local communities and boosting food security in rural areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}