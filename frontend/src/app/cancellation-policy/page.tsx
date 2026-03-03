'use client'

import React from 'react'
import { PolicyTemplate } from '@/components/PolicyTemplate'
import { useWebsitePage } from '@/hooks/useWebsitePage'

// Fallback data in case the admin content is not available
const fallbackData = {
  title: "Cancellation Policy",
  lastUpdated: "January 15, 2025",
  sections: [
    {
      title: "INTRODUCTION",
      content: [
        "This Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.",
        "Please read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.",
        "This policy should be read in conjunction with our Terms of Service and other applicable policies."
      ]
    },
    {
      title: "ORDER CANCELLATION WINDOW",
      content: [
        "Orders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.",
        "Once an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.",
        "For scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees."
      ]
    },
    {
      title: "HOW TO CANCEL YOUR ORDER",
      content: [
        "To cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.",
        "You may also cancel your order through your account dashboard if the cancellation window is still open. Look for the 'Cancel Order' button next to your active orders.",
        "For urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request."
      ]
    },
    {
      title: "CANCELLATION FEES",
      content: [
        "Orders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.",
        "Orders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.",
        "Orders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared."
      ]
    },
    {
      title: "REFUND PROCESSING",
      content: [
        "Eligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.",
        "For orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.",
        "We will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account."
      ]
    },
    {
      title: "NON-CANCELLABLE ORDERS",
      content: [
        "Orders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.",
        "Custom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.",
        "Orders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times."
      ]
    },
    {
      title: "FORCE MAJEURE AND SERVICE DISRUPTIONS",
      content: [
        "In cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.",
        "If we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.",
        "We are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control."
      ]
    },
    {
      title: "SUBSCRIPTION AND RECURRING ORDERS",
      content: [
        "For subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.",
        "Cancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.",
        "Individual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status."
      ]
    },
    {
      title: "CONTACT INFORMATION",
      content: [
        "For any questions about cancellations, refunds, or this Cancellation Policy, please contact us:",
        "Customer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)",
        "Email: support@freshcounty.com",
        "Live Chat: Available on our website and mobile app during business hours",
        "Our customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation."
      ]
    }
  ]
}

export default function CancellationPolicy() {
  const { page, loading, error } = useWebsitePage('cancellation-policy')

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