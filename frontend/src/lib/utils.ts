import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatter for Nigerian Naira
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(price)
}

// Format price without currency symbol (for display purposes)
export function formatPriceSimple(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
  }).format(price)
}

// Convert backend image URL to production URL
export function getImageUrl(backendImageUrl: string | null | undefined): string {
  if (!backendImageUrl || backendImageUrl === '') {
    return '' // Return empty string to trigger fallback in components
  }
  
  // Convert localhost URLs to production URLs for images from database
  let processedUrl = backendImageUrl
  if (backendImageUrl.includes('localhost:3001')) {
    processedUrl = backendImageUrl.replace('http://localhost:3001', 'https://freshcounty.com')
  }
  
  // Return the direct URL - backend serves static files directly
  return processedUrl
}