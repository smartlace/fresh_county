// Fresh County Comprehensive Database Types

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  mobile?: string;
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface UserAddress {
  id: number;
  user_id: number;
  type: 'home' | 'work' | 'other';
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  manage_stock: boolean;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
  category_id?: number;
  featured_image?: string;
  gallery?: string[]; // JSON array of image URLs
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  nutritional_info?: any; // JSON object
  ingredients?: string;
  allergen_info?: string;
  storage_instructions?: string;
  shelf_life?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductAttribute {
  id: number;
  product_id: number;
  attribute_name: string;
  attribute_value: string;
  price_modifier: number;
  stock_quantity: number;
  created_at: Date;
}

export interface CartItem {
  id: number;
  user_id?: number;
  session_id?: string;
  product_id: number;
  quantity: number;
  attributes?: any; // JSON object
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  guest_email?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  
  // Billing information
  billing_full_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  
  // Shipping information
  shipping_full_name: string;
  shipping_email?: string;
  shipping_phone: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  
  // Order totals
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Payment information
  payment_method: 'card' | 'transfer' | 'cash_on_delivery' | 'mobile_money';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';
  payment_reference?: string;
  
  // Delivery information
  delivery_method: 'standard' | 'express' | 'pickup';
  delivery_date?: Date;
  delivery_time?: string;
  special_instructions?: string;
  
  // Tracking
  tracking_number?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  attributes?: any; // JSON object
  created_at: Date;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimum_amount: number;
  maximum_discount?: number;
  usage_limit?: number;
  usage_limit_per_user: number;
  usage_count: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number;
  rating: number; // 1-5
  title?: string;
  review?: string;
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpful_votes: number;
  created_at: Date;
  updated_at: Date;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  status: 'active' | 'unsubscribed';
  verification_token?: string;
  verified_at?: Date;
  subscribed_at: Date;
  unsubscribed_at?: Date;
}

export interface EmailTemplate {
  id: number;
  template_key: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[]; // JSON array
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value?: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  table_name: string;
  record_id: number;
  old_values?: any; // JSON object
  new_values?: any; // JSON object
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}