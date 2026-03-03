'use client'

import React from 'react'
import { PolicyTemplate } from '@/components/PolicyTemplate'
import { useWebsitePage } from '@/hooks/useWebsitePage'

// Fallback data in case the admin content is not available
const fallbackData = {
  title: "Frequently Asked Questions",
  lastUpdated: "January 15, 2025",
  sections: [
    {
      title: "ORDERING & PAYMENT",
      content: [
        "Q: How do I place an order?",
        "A: Simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your order.",
        "",
        "Q: What payment methods do you accept?",
        "A: We accept Paystack (card payments), bank transfers, and cash on delivery for orders within Lagos.",
        "",
        "Q: Is my payment information secure?",
        "A: Yes, all payments are processed through secure, encrypted channels. We use Paystack for card payments which is PCI DSS compliant."
      ]
    },
    {
      title: "DELIVERY & SHIPPING",
      content: [
        "Q: What are your delivery areas?",
        "A: We currently deliver within Lagos State and select areas in Nigeria. Delivery costs vary by location.",
        "",
        "Q: How long does delivery take?",
        "A: Standard delivery within Lagos takes 1-3 business days. Other areas may take 3-7 business days depending on location.",
        "",
        "Q: Do you offer same-day delivery?",
        "A: Yes, same-day delivery is available for orders placed before 2 PM within Lagos Island and Victoria Island."
      ]
    },
    {
      title: "PRODUCTS & QUALITY",
      content: [
        "Q: Are your products fresh?",
        "A: Absolutely! We source directly from farms and ensure all products meet our strict quality standards before delivery.",
        "",
        "Q: What if I receive damaged or spoiled items?",
        "A: Contact us immediately within 24 hours of delivery. We'll provide a full refund or replacement for any quality issues.",
        "",
        "Q: Do you offer organic products?",
        "A: Yes, we have a dedicated organic section with certified organic fruits, vegetables, and other products."
      ]
    },
    {
      title: "ACCOUNT & ORDERS",
      content: [
        "Q: How do I track my order?",
        "A: You can track your order status by logging into your account and viewing your order history.",
        "",
        "Q: Can I cancel or modify my order?",
        "A: Orders can be cancelled or modified within 30 minutes of placement. After that, please contact customer service.",
        "",
        "Q: How do I reset my password?",
        "A: Click 'Forgot Password' on the login page and follow the instructions sent to your email."
      ]
    },
    {
      title: "CUSTOMER SUPPORT",
      content: [
        "Q: How can I contact customer support?",
        "A: You can reach us via:",
        "• Phone: +234-809-967-748 (8 AM - 8 PM, Monday to Saturday)",
        "• Email: support@freshcounty.com",
        "• Live chat on our website",
        "",
        "Q: What are your business hours?",
        "A: Our customer service is available Monday to Saturday, 8 AM to 8 PM. Orders can be placed 24/7 through our website."
      ]
    }
  ]
}

export default function FAQ() {
  const { page, loading, error } = useWebsitePage('faq')

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