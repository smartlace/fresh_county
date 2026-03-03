'use client'

import React from 'react'
import { PolicyTemplate } from '@/components/PolicyTemplate'
import { useWebsitePage } from '@/hooks/useWebsitePage'

// Fallback data in case the admin content is not available
const fallbackData = {
  title: "Privacy Policy",
  lastUpdated: "January 15, 2025",
  sections: [
    {
      title: "INTRODUCTION",
      content: [
        "FreshCounty respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services.",
        "We encourage you to read this Privacy Policy carefully to understand our practices regarding your personal information and how we will treat it.",
        "By using our services, you consent to the collection and use of your information as described in this Privacy Policy."
      ]
    },
    {
      title: "CONTACT INFORMATION",
      content: [
        "If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:",
        "Email: privacy@freshcounty.com",
        "Phone: +234-809-967-748",
        "Address: Lagos, Nigeria",
        "We will respond to your inquiries and requests in accordance with applicable privacy laws and within a reasonable timeframe."
      ]
    }
  ]
}

export default function PrivacyPolicy() {
  const { page, loading, error } = useWebsitePage('privacy-policy')

  return (
    <PolicyTemplate
      title={page?.title || fallbackData.title}
      lastUpdated={page?.updated_at ? new Date(page.updated_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : fallbackData.lastUpdated}
      htmlContent={page?.content || undefined}
      sections={!page ? fallbackData.sections : undefined}
      loading={loading}
      error={error || undefined}
    />
  )
}