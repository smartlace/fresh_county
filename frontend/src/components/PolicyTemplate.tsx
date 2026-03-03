import React from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { processAndSanitizeContent } from '@/lib/sanitize'

interface PolicySection {
  title: string
  content: string[]
}

interface PolicyTemplateProps {
  title: string
  lastUpdated: string
  sections?: PolicySection[]
  htmlContent?: string
  loading?: boolean
  error?: string
}

export function PolicyTemplate({ title, lastUpdated, sections, htmlContent, loading, error }: PolicyTemplateProps) {
  // SECURITY: Content is now processed through DOMPurify sanitization
  // This prevents XSS attacks by removing malicious scripts and unsafe HTML
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Header spacer */}
      <div className="h-4"></div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-left mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            {title}
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8 md:py-12">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-[#FE4501] border-t-transparent rounded-full"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-8 md:py-12">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-[#FE4501] hover:text-[#FE4501]/90 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="pb-8 md:pb-12">
            {/* HTML Content from Admin */}
            {htmlContent ? (
              <div className="space-y-6">
                <div 
                  className="
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:mb-6 [&_h1]:mt-8
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:mb-4 [&_h2]:mt-8
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:mb-3 [&_h3]:mt-6
                    [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-gray-900 [&_h4]:mb-3 [&_h4]:mt-4
                    [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-gray-700 [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:space-y-2
                    [&_ol]:text-gray-700 [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:space-y-2
                    [&_li]:text-gray-700 [&_li]:leading-relaxed
                    [&_strong]:text-gray-900 [&_strong]:font-semibold
                    [&_em]:text-gray-800 [&_em]:italic
                    [&_blockquote]:border-l-4 [&_blockquote]:border-[#FE4501] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                  "
                  dangerouslySetInnerHTML={{ __html: processAndSanitizeContent(htmlContent) }}
                />
              </div>
            ) : sections ? (
              /* Fallback to sections format */
              <div className="space-y-12">
                {sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.content.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex} className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No content available</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}