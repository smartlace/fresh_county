// User types
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'customer' | 'staff' | 'manager' | 'admin';
}

// Product types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  category_id?: number;
  sku?: string;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  manage_stock: boolean;
  featured_image?: string;
  gallery_images?: string;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
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

// Order types
export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  session_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'paystack' | 'bank_transfer' | 'cash_on_delivery';
  payment_reference?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: string; // JSON string
  billing_address: string; // JSON string
  tracking_number?: string;
  notes?: string;
  coupon_code?: string;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  attributes?: string; // JSON string
  line_total: number;
}

export interface Address {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
}

// Cart types
export interface CartItem {
  id: number;
  user_id?: number;
  session_id?: string;
  product_id: number;
  quantity: number;
  price: number;
  attributes?: string; // JSON string
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// JWT Payload
export interface JWTPayload {
  user_id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Paystack types
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackWebhookData {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    customer: {
      email: string;
    };
    metadata: any;
  };
}