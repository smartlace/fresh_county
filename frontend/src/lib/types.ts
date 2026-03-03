/**
 * TypeScript interfaces for Fresh County application
 * Centralized type definitions to eliminate 'any' usage
 */

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Shipping Zone Types
export interface ShippingZone {
  id: string
  name: string
  price: number
  description?: string
  is_active: boolean
}

export interface ShippingZonesResponse {
  zones: ShippingZone[]
  total: number
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  sizes: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariation {
  id: string
  product_id: string
  size: string
  price: number
  stock_quantity: number
  is_active: boolean
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  is_active: boolean
  product_count: number
}

// Order Types
export interface Order {
  id: string
  order_number?: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'confirmed' | 'shipped' | 'delivered'
  total_amount: number
  delivery_type: 'pickup' | 'delivery'
  delivery_info?: {
    address?: string
    phone?: string
    notes?: string
    delivery_date?: string
    delivery_time?: string
  }
  items: OrderItem[]
  created_at: string
  updated_at: string
  // Optional fields for modal display
  subtotal?: number
  shipping_fee?: number
  tax_amount?: number
  discount_amount?: number
  coupon_code?: string
  tracking_number?: string
  notes?: string
  estimated_delivery?: string
  shipping_address?: {
    address: string
    city: string
    state: string
    country: string
    postal_code: string
    phone?: string
    first_name?: string
    last_name?: string
    email?: string
  }
  order_tracking?: {
    placed_at: string
    confirmed_at?: string
    processing_at?: string
    shipped_at?: string
    delivered_at?: string
    cancelled_at?: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  size: string
  quantity: number
  price: number
  total: number
  // Additional fields for modal display
  line_total?: number
  product_image?: string
  variation_name?: string
  variation_id?: string
  variation_details?: Record<string, string | number | boolean | undefined>
  attributes?: Record<string, string | number | boolean | undefined>
}

// Order API Response Types
export interface OrdersResponse {
  orders: Order[]
  pagination: {
    total_pages: number
    total_orders: number
    current_page: number
    per_page: number
  }
}

export interface OrderDetailsResponse {
  order: Order
}

// User Types
export interface User {
  id: string
  email: string
  full_name: string
  mobile_number?: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    user: User
    token: string
    refreshToken: string
  }
}

// Coupon/Discount Types
export interface Coupon {
  id: string
  code: string
  name: string
  type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_amount?: number
  maximum_discount?: number
  usage_limit?: number
  used_count: number
  is_active: boolean
  expires_at?: string
  created_at: string
}

export interface CouponValidationResponse {
  coupon: Coupon
  discount_amount: number
  is_valid: boolean
  message?: string
}

// Blog Types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  is_featured: boolean
  view_count: number
  reading_time?: number
  published_at?: string
  category_name?: string
  category_color?: string
  tags?: string
  created_at: string
  updated_at: string
}

// Settings Types
export interface AppSettings {
  id: string
  key: string
  value: string | boolean | number
  type: 'string' | 'boolean' | 'number' | 'json'
  description?: string
  is_public: boolean
  updated_at: string
}

// Pagination Types
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: {
    first: string
    last: string
    prev?: string
    next?: string
  }
}

// Form Types
export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// Component Props Types
export interface ProductCardProps {
  product: Product
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

// Search and Filter Types
export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  size?: string
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  filters?: SearchFilters
}

// Delivery and Checkout Types
export interface DeliveryInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  mobileNumber: string
  email: string
  saveInfo: boolean
}

export interface CheckoutTotals {
  subtotal: number
  shipping: number
  discount: number
  tax: number
  total: number
}

export interface CartTotals {
  subtotal: number
  tax_amount: number
  tax_rate: number
  shipping_cost: number
  total_amount: number
}

export interface CartTotalsResponse {
  totals: {
    subtotal: number
    tax_amount: number
    tax_rate: number
  }
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type Theme = 'light' | 'dark' | 'system'

// Re-export commonly used types
export type { CartItem, DiscountInfo } from '@/lib/storage'