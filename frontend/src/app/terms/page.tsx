'use client'

import React from 'react'
import { PolicyTemplate } from '@/components/PolicyTemplate'
import { useWebsitePage } from '@/hooks/useWebsitePage'

// Fallback data in case the admin content is not available
const fallbackData = {
  title: "Terms of Service", 
  lastUpdated: "January 15, 2025",
  sections: [
    {
      title: "INTRODUCTION",
      content: [
        "Welcome to FreshCounty. These Terms of Service govern your use of our website, mobile application, and services. By accessing or using FreshCounty, you agree to be bound by these terms.",
        "FreshCounty is an online platform that connects customers with fresh, healthy food products and meal solutions. We are committed to providing high-quality products and exceptional service to our community.",
        "These terms constitute a legally binding agreement between you and FreshCounty. Please read them carefully before using our services."
      ]
    },
    {
      title: "ACCEPTANCE OF TERMS",
      content: [
        "By creating an account, placing an order, or otherwise using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
        "If you do not agree with any part of these terms, you must not use our services. We reserve the right to modify these terms at any time, and your continued use of our services constitutes acceptance of any changes.",
        "You must be at least 18 years old to use our services. If you are under 18, you may only use our services with the involvement of a parent or guardian."
      ]
    },
    {
      title: "USER ACCOUNTS",
      content: [
        "To access certain features of our service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        "You agree to provide accurate, current, and complete information when creating your account and to update such information as necessary to keep it accurate, current, and complete.",
        "We reserve the right to suspend or terminate your account if we believe you have violated these terms or engaged in fraudulent or inappropriate behavior."
      ]
    },
    {
      title: "PRODUCT INFORMATION",
      content: [
        "We strive to provide accurate product descriptions, prices, and availability information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.",
        "All prices are subject to change without notice. We reserve the right to modify or discontinue products at any time without prior notice.",
        "Product images are for illustration purposes only and may not always accurately represent the actual product. Actual products may vary in appearance from the images displayed."
      ]
    },
    {
      title: "ORDERS AND PAYMENTS",
      content: [
        "When you place an order, you are making an offer to purchase the products. We reserve the right to accept or decline your order for any reason, including product availability, errors in pricing, or payment processing issues.",
        "All payments must be made at the time of order placement using accepted payment methods. We accept major credit cards, debit cards, and other payment methods as displayed on our website.",
        "You are responsible for ensuring that your payment information is accurate and up to date. We are not liable for any issues arising from incorrect payment information provided by you."
      ]
    },
    {
      title: "DELIVERY TERMS",
      content: [
        "We will make reasonable efforts to deliver your order within the estimated delivery time provided at checkout. However, delivery times are estimates only and not guaranteed.",
        "Delivery is available within our designated service areas. You are responsible for providing accurate delivery information, including address and contact details.",
        "If you are not available to receive your delivery, we may leave the products in a safe location or reschedule delivery, subject to our delivery policies and additional fees."
      ]
    },
    {
      title: "CANCELLATION AND REFUNDS",
      content: [
        "Orders may be cancelled within a limited time frame after placement, subject to our Cancellation Policy. Please refer to our separate Cancellation Policy for detailed information.",
        "Refunds will be processed according to our refund policy and may take several business days to appear in your account, depending on your payment method.",
        "We reserve the right to refuse refunds for perishable items that have been delivered and accepted by you, except in cases of product defects or quality issues."
      ]
    },
    {
      title: "LIMITATION OF LIABILITY",
      content: [
        "To the maximum extent permitted by law, FreshCounty shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses.",
        "Our total liability to you for all claims arising out of or relating to these terms or your use of our services shall not exceed the amount you paid to us for the specific order giving rise to the claim.",
        "Some jurisdictions do not allow the exclusion or limitation of certain warranties or the limitation or exclusion of liability for incidental or consequential damages. Accordingly, some of the above limitations may not apply to you."
      ]
    },
    {
      title: "CONTACT INFORMATION",
      content: [
        "If you have any questions about these Terms of Service, please contact us:",
        "Email: legal@freshcounty.com",
        "Phone: +234-809-967-748",
        "Address: Lagos, Nigeria",
        "We are committed to addressing your concerns and will respond to your inquiries in a timely manner."
      ]
    }
  ]
}

export default function TermsOfService() {
  const { page, loading, error } = useWebsitePage('terms')

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