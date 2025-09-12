# 📖 FreshCounty API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3001/api` (development) | `https://api.yourdomain.com/api` (production)  
**Authentication**: JWT Bearer Token  

## Table of Contents
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints Reference](#endpoints-reference)
  - [Authentication](#authentication-endpoints)
  - [Products & Categories](#products--categories)
  - [Shopping Cart](#shopping-cart)
  - [Orders](#orders)
  - [Admin Dashboard](#admin-dashboard)
  - [User Management](#user-management)
  - [File Upload](#file-upload)
  - [Content Management](#content-management)
  - [System Settings](#system-settings)

---

## Authentication

FreshCounty API uses JWT (JSON Web Tokens) for authentication with refresh token rotation.

### Authentication Flow
1. **Login**: POST `/auth/login` → Receive access token + refresh token
2. **Access Protected Resources**: Include `Authorization: Bearer <token>` header
3. **Token Refresh**: POST `/auth/refresh` → Receive new tokens before expiration
4. **Logout**: POST `/auth/logout` → Invalidate all tokens

### Token Information
- **Access Token Lifetime**: 1 hour
- **Refresh Token Lifetime**: 7 days
- **Token Storage**: Store securely (httpOnly cookies recommended for web)

### Role-Based Access Control
- **customer**: Default role, access to shopping features
- **staff**: Basic admin access, order management
- **manager**: Enhanced admin access, product management
- **admin**: Full system access, user management, settings

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

### Success with Pagination
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  },
  "message": "Products retrieved successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
```

---

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

### Common Error Types
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...validation errors...]
  }
}
```

---

## Rate Limiting

### Authentication Endpoints
- **Window**: 15 minutes
- **Limit**: 5 requests per window
- **Applies to**: login, register, admin-login, forgot-password, reset-password

### General Endpoints
- **Window**: 15 minutes  
- **Limit**: 1000 requests per window per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

# Endpoints Reference

## Authentication Endpoints

### POST `/auth/register`
Register a new customer account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "mobile": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "customer",
      "is_email_verified": false
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Registration successful. Please verify your email."
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Minimum 8 characters
- Full name: Minimum 2 characters
- Mobile: Valid phone number (optional)

---

### POST `/auth/login`
Login for customers and staff.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "customer"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Login successful"
}
```

---

### POST `/auth/admin-login`
**Authentication required**: None  
**Role restrictions**: admin, manager, staff only

Login specifically for admin panel access. Blocks customer accounts.

**Request Body:**
```json
{
  "email": "admin@freshcounty.ng",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@freshcounty.ng",
      "full_name": "Admin User",
      "role": "admin"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Admin login successful"
}
```

**Error Response (Customer Blocked):**
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Admin panel is restricted to authorized personnel only."
  }
}
```

---

### POST `/auth/refresh`
Refresh JWT tokens before expiration.

**Request Body:**
```json
{
  "refreshToken": "current_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  },
  "message": "Tokens refreshed successfully"
}
```

---

### POST `/auth/logout`
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### GET `/auth/profile`
**Authentication required**: Yes

Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "mobile": "+2348012345678",
    "role": "customer",
    "is_email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST `/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

---

### POST `/auth/reset-password`
Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Products & Categories

### GET `/products`
**Authentication required**: No

Get all products with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (1-50, default: 20)
- `category_id` (UUID, optional): Filter by category ID
- `category_slug` (string, optional): Filter by category slug
- `sort_by` (string, optional): Sort field (created_at, name, price, stock_quantity, featured)
- `sort_order` (string, optional): Sort direction (ASC, DESC)
- `min_price` (float, optional): Minimum price filter
- `max_price` (float, optional): Maximum price filter

**Example Request:**
```
GET /api/products?page=1&limit=10&category_slug=beverages&sort_by=price&sort_order=ASC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Premium Orange Juice",
        "slug": "premium-orange-juice",
        "description": "Fresh squeezed orange juice",
        "price": 1500.00,
        "sale_price": 1200.00,
        "stock_quantity": 50,
        "featured_image": "https://example.com/orange-juice.jpg",
        "gallery": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "category": {
          "id": "uuid",
          "name": "Beverages",
          "slug": "beverages"
        },
        "variations": [
          {
            "id": "uuid",
            "name": "500ml",
            "price": 1500.00,
            "stock_quantity": 25
          }
        ],
        "status": "active",
        "featured": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  },
  "message": "Products retrieved successfully"
}
```

---

### GET `/products/search`
**Authentication required**: No

Search products by name or description.

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)
- `limit` (integer, optional): Max results (1-50, default: 20)

**Example Request:**
```
GET /api/products/search?q=orange&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Premium Orange Juice",
        "slug": "premium-orange-juice",
        "price": 1500.00,
        "sale_price": 1200.00,
        "featured_image": "https://example.com/orange-juice.jpg",
        "category": {
          "name": "Beverages"
        }
      }
    ],
    "totalFound": 3
  },
  "message": "Search results retrieved successfully"
}
```

---

### GET `/products/featured`
**Authentication required**: No

Get featured products for homepage display.

**Query Parameters:**
- `limit` (integer, optional): Max results (1-20, default: 8)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Premium Orange Juice",
        "slug": "premium-orange-juice",
        "price": 1500.00,
        "sale_price": 1200.00,
        "featured_image": "https://example.com/orange-juice.jpg",
        "category": {
          "name": "Beverages"
        }
      }
    ]
  },
  "message": "Featured products retrieved successfully"
}
```

---

### GET `/products/:id`
**Authentication required**: No

Get detailed product information by ID or slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Premium Orange Juice",
      "slug": "premium-orange-juice",
      "description": "Fresh squeezed orange juice with no preservatives",
      "price": 1500.00,
      "sale_price": 1200.00,
      "cost_price": 800.00,
      "stock_quantity": 50,
      "featured_image": "https://example.com/orange-juice.jpg",
      "gallery": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "category": {
        "id": "uuid",
        "name": "Beverages",
        "slug": "beverages"
      },
      "variations": [
        {
          "id": "uuid",
          "name": "500ml",
          "price": 1500.00,
          "stock_quantity": 25
        },
        {
          "id": "uuid",
          "name": "1L",
          "price": 2500.00,
          "stock_quantity": 25
        }
      ],
      "status": "active",
      "featured": true,
      "manage_stock": true,
      "meta_title": "Premium Orange Juice - Fresh County",
      "meta_description": "Buy premium orange juice online",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z"
    }
  },
  "message": "Product retrieved successfully"
}
```

---

### POST `/products`
**Authentication required**: Yes  
**Required role**: admin, manager

Create a new product.

**Request Body:**
```json
{
  "name": "Premium Orange Juice",
  "description": "Fresh squeezed orange juice",
  "price": 1500.00,
  "sale_price": 1200.00,
  "cost_price": 800.00,
  "stock_quantity": 50,
  "category_id": "category-uuid",
  "featured_image": "https://example.com/orange-juice.jpg",
  "gallery": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "status": "active",
  "featured": true,
  "manage_stock": true,
  "meta_title": "Premium Orange Juice - Fresh County",
  "meta_description": "Buy premium orange juice online"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "new-uuid",
      "name": "Premium Orange Juice",
      "slug": "premium-orange-juice",
      // ... other product fields
    }
  },
  "message": "Product created successfully"
}
```

---

### PUT `/products/:id`
**Authentication required**: Yes  
**Required role**: admin, manager

Update an existing product.

**Request Body:** Same as POST, but all fields optional

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      // Updated product data
    }
  },
  "message": "Product updated successfully"
}
```

---

### DELETE `/products/:id`
**Authentication required**: Yes  
**Required role**: admin, manager

Delete a product (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Categories

### GET `/products/categories`
**Authentication required**: No

Get all product categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Beverages",
        "slug": "beverages",
        "description": "All kinds of beverages",
        "image": "https://example.com/beverages.jpg",
        "parent_id": null,
        "sort_order": 1,
        "is_active": true,
        "product_count": 25
      }
    ]
  },
  "message": "Categories retrieved successfully"
}
```

---

### GET `/products/categories/tree`
**Authentication required**: No

Get hierarchical category structure.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Beverages",
        "slug": "beverages",
        "children": [
          {
            "id": "child-uuid",
            "name": "Juices",
            "slug": "juices",
            "children": []
          }
        ]
      }
    ]
  },
  "message": "Category tree retrieved successfully"
}
```

---

## Shopping Cart

### GET `/cart`
**Authentication required**: Yes

Get user's current cart contents.

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "id": "uuid",
          "product": {
            "id": "uuid",
            "name": "Premium Orange Juice",
            "price": 1500.00,
            "sale_price": 1200.00,
            "featured_image": "https://example.com/orange-juice.jpg"
          },
          "variation": {
            "id": "uuid",
            "name": "500ml",
            "price": 1200.00
          },
          "quantity": 2,
          "unit_price": 1200.00,
          "total_price": 2400.00
        }
      ],
      "summary": {
        "subtotal": 2400.00,
        "tax_amount": 180.00,
        "delivery_cost": 500.00,
        "discount": 0.00,
        "total": 3080.00
      },
      "item_count": 2,
      "updated_at": "2024-01-01T10:30:00Z"
    }
  },
  "message": "Cart retrieved successfully"
}
```

---

### POST `/cart/add`
**Authentication required**: Yes

Add item to cart.

**Request Body:**
```json
{
  "product_id": "product-uuid",
  "variation_id": "variation-uuid",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_item": {
      "id": "uuid",
      "quantity": 2,
      "unit_price": 1200.00,
      "total_price": 2400.00
    }
  },
  "message": "Item added to cart successfully"
}
```

---

### PUT `/cart/update/:itemId`
**Authentication required**: Yes

Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_item": {
      "id": "uuid",
      "quantity": 3,
      "total_price": 3600.00
    }
  },
  "message": "Cart item updated successfully"
}
```

---

### DELETE `/cart/remove/:itemId`
**Authentication required**: Yes

Remove item from cart.

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

### DELETE `/cart/clear`
**Authentication required**: Yes

Clear all items from cart.

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Orders

### GET `/orders`
**Authentication required**: Yes

Get user's order history.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (1-50, default: 20)
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "FC-2024-001",
        "status": "delivered",
        "total_amount": 3080.00,
        "items_count": 2,
        "created_at": "2024-01-01T10:00:00Z",
        "delivery_address": {
          "street": "123 Lagos Street",
          "city": "Lagos",
          "state": "Lagos",
          "country": "Nigeria"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  },
  "message": "Orders retrieved successfully"
}
```

---

### GET `/orders/:id`
**Authentication required**: Yes

Get detailed order information.

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "FC-2024-001",
      "status": "delivered",
      "payment_status": "paid",
      "payment_method": "paystack",
      "subtotal": 2400.00,
      "tax_amount": 180.00,
      "delivery_cost": 500.00,
      "discount": 0.00,
      "total_amount": 3080.00,
      "items": [
        {
          "id": "uuid",
          "product": {
            "name": "Premium Orange Juice",
            "featured_image": "https://example.com/orange-juice.jpg"
          },
          "variation": {
            "name": "500ml"
          },
          "quantity": 2,
          "unit_price": 1200.00,
          "total_price": 2400.00
        }
      ],
      "delivery_address": {
        "full_name": "John Doe",
        "phone": "+2348012345678",
        "street": "123 Lagos Street",
        "city": "Lagos",
        "state": "Lagos",
        "postal_code": "100001",
        "country": "Nigeria"
      },
      "status_history": [
        {
          "status": "pending",
          "timestamp": "2024-01-01T10:00:00Z"
        },
        {
          "status": "processing",
          "timestamp": "2024-01-01T11:00:00Z"
        },
        {
          "status": "shipped",
          "timestamp": "2024-01-02T09:00:00Z"
        },
        {
          "status": "delivered",
          "timestamp": "2024-01-03T14:30:00Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-03T14:30:00Z"
    }
  },
  "message": "Order retrieved successfully"
}
```

---

### POST `/orders`
**Authentication required**: Yes

Create a new order from cart.

**Request Body:**
```json
{
  "delivery_address": {
    "full_name": "John Doe",
    "phone": "+2348012345678",
    "street": "123 Lagos Street",
    "city": "Lagos",
    "state": "Lagos",
    "postal_code": "100001",
    "country": "Nigeria"
  },
  "payment_method": "paystack",
  "delivery_zone_id": "zone-uuid",
  "notes": "Please ring doorbell"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "FC-2024-001",
      "status": "pending",
      "total_amount": 3080.00,
      "payment_url": "https://checkout.paystack.com/abc123"
    }
  },
  "message": "Order created successfully"
}
```

---

## Admin Dashboard

### GET `/admin/dashboard`
**Authentication required**: Yes  
**Required role**: admin, manager, staff

Get dashboard statistics and KPIs.

**Response:**
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "overview": {
        "total_orders": 150,
        "total_revenue": 450000.00,
        "total_customers": 85,
        "pending_orders": 12
      },
      "order_stats": {
        "pending": 12,
        "processing": 8,
        "shipped": 5,
        "delivered": 125,
        "cancelled": 3
      },
      "revenue_trend": {
        "today": 15000.00,
        "yesterday": 12000.00,
        "this_week": 85000.00,
        "last_week": 78000.00,
        "this_month": 320000.00,
        "last_month": 285000.00
      },
      "top_products": [
        {
          "product": {
            "id": "uuid",
            "name": "Premium Orange Juice",
            "featured_image": "https://example.com/orange-juice.jpg"
          },
          "total_sold": 45,
          "revenue": 54000.00
        }
      ],
      "recent_orders": [
        {
          "id": "uuid",
          "order_number": "FC-2024-001",
          "customer_name": "John Doe",
          "total_amount": 3080.00,
          "status": "pending",
          "created_at": "2024-01-01T10:00:00Z"
        }
      ],
      "low_stock_products": [
        {
          "id": "uuid",
          "name": "Premium Orange Juice",
          "stock_quantity": 3,
          "min_stock_level": 10
        }
      ]
    }
  },
  "message": "Dashboard data retrieved successfully"
}
```

---

### GET `/admin/orders`
**Authentication required**: Yes  
**Required role**: admin, manager, staff

Get all orders with admin filters.

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `status` (string, optional): Filter by status
- `search` (string, optional): Search by customer name, email, or order number
- `start_date` (string, optional): Start date filter (YYYY-MM-DD)
- `end_date` (string, optional): End date filter (YYYY-MM-DD)
- `sort_by` (string, optional): Sort field
- `sort_order` (string, optional): Sort direction

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "FC-2024-001",
        "customer": {
          "id": "uuid",
          "full_name": "John Doe",
          "email": "john@example.com"
        },
        "status": "pending",
        "payment_status": "pending",
        "total_amount": 3080.00,
        "items_count": 2,
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 150,
      "itemsPerPage": 10
    },
    "summary": {
      "total_orders": 150,
      "total_revenue": 450000.00,
      "status_counts": {
        "pending": 12,
        "processing": 8,
        "shipped": 5,
        "delivered": 125
      }
    }
  },
  "message": "Admin orders retrieved successfully"
}
```

---

### PUT `/admin/orders/:id`
**Authentication required**: Yes  
**Required role**: admin, manager, staff

Update order status and details.

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Order is being prepared"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "status": "processing",
      "updated_at": "2024-01-01T15:30:00Z"
    }
  },
  "message": "Order updated successfully"
}
```

---

## User Management

### GET `/admin/users`
**Authentication required**: Yes  
**Required role**: admin, manager

Get all users with filtering.

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `role` (string, optional): Filter by role
- `status` (string, optional): Filter by status
- `search` (string, optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "john@example.com",
        "full_name": "John Doe",
        "role": "customer",
        "is_active": true,
        "is_email_verified": true,
        "created_at": "2024-01-01T00:00:00Z",
        "stats": {
          "total_orders": 5,
          "total_spent": 15400.00,
          "last_order": "2024-01-15T10:00:00Z"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 9,
      "totalItems": 85,
      "itemsPerPage": 10
    }
  },
  "message": "Users retrieved successfully"
}
```

---

### POST `/admin/users`
**Authentication required**: Yes  
**Required role**: admin

Create new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "full_name": "New User",
  "role": "customer",
  "mobile": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-uuid",
      "email": "newuser@example.com",
      "full_name": "New User",
      "role": "customer"
    }
  },
  "message": "User created successfully"
}
```

---

### PUT `/admin/users/:id`
**Authentication required**: Yes  
**Required role**: admin

Update user details.

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "role": "staff",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Updated Name",
      "role": "staff"
    }
  },
  "message": "User updated successfully"
}
```

---

### DELETE `/admin/users/:id`
**Authentication required**: Yes  
**Required role**: admin

Delete user account (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## File Upload

### POST `/upload/product-images`
**Authentication required**: Yes  
**Required role**: admin, manager

Upload product images.

**Request:** Multipart form data
- `images`: File array (JPEG, PNG, WebP)
- `product_id`: UUID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded_files": [
      {
        "filename": "product-image-1704067200.jpg",
        "url": "https://example.com/uploads/products/product-image-1704067200.jpg",
        "size": 245760,
        "mimetype": "image/jpeg"
      }
    ]
  },
  "message": "Images uploaded successfully"
}
```

---

### POST `/upload/category-image`
**Authentication required**: Yes  
**Required role**: admin, manager

Upload category image.

**Request:** Multipart form data
- `image`: File (JPEG, PNG, WebP)
- `category_id`: UUID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded_file": {
      "filename": "category-image-1704067200.jpg",
      "url": "https://example.com/uploads/categories/category-image-1704067200.jpg",
      "size": 145760,
      "mimetype": "image/jpeg"
    }
  },
  "message": "Category image uploaded successfully"
}
```

---

### DELETE `/upload/:type/:filename`
**Authentication required**: Yes  
**Required role**: admin, manager

Delete uploaded file.

**Parameters:**
- `type`: File type (products, categories, blog)
- `filename`: File name to delete

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Content Management

### GET `/blog/posts`
**Authentication required**: No

Get published blog posts.

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `category` (string, optional): Filter by category slug

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "Benefits of Fresh Orange Juice",
        "slug": "benefits-fresh-orange-juice",
        "excerpt": "Discover the amazing health benefits...",
        "featured_image": "https://example.com/blog-image.jpg",
        "category": {
          "name": "Health",
          "slug": "health"
        },
        "author": "Admin",
        "published_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  },
  "message": "Blog posts retrieved successfully"
}
```

---

### GET `/blog/posts/:slug`
**Authentication required**: No

Get blog post by slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "title": "Benefits of Fresh Orange Juice",
      "slug": "benefits-fresh-orange-juice",
      "content": "<p>Full blog post content here...</p>",
      "excerpt": "Discover the amazing health benefits...",
      "featured_image": "https://example.com/blog-image.jpg",
      "category": {
        "id": "uuid",
        "name": "Health",
        "slug": "health"
      },
      "author": "Admin",
      "meta_title": "Benefits of Fresh Orange Juice - Fresh County",
      "meta_description": "Learn about the health benefits...",
      "published_at": "2024-01-01T10:00:00Z"
    }
  },
  "message": "Blog post retrieved successfully"
}
```

---

## System Settings

### GET `/admin/settings`
**Authentication required**: Yes  
**Required role**: admin

Get system configuration settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "site_name": "Fresh County",
      "site_description": "Premium food and beverages",
      "site_logo": "https://example.com/logo.png",
      "currency": "NGN",
      "currency_symbol": "₦",
      "tax_rate": "7.5",
      "tax_inclusive": false,
      "default_shipping_cost": "1500",
      "free_shipping_threshold": "10000",
      "admin_email": "admin@freshcounty.ng",
      "support_email": "support@freshcounty.ng",
      "support_phone": "+234-800-FRESH",
      "business_address": "Lagos, Nigeria",
      "email_from_name": "Fresh County",
      "email_from_address": "noreply@freshcounty.ng",
      "paystack_public_key": "pk_test_...",
      "social_links": {
        "facebook": "https://facebook.com/freshcounty",
        "twitter": "https://twitter.com/freshcounty",
        "instagram": "https://instagram.com/freshcounty"
      }
    }
  },
  "message": "Settings retrieved successfully"
}
```

---

### PUT `/admin/settings`
**Authentication required**: Yes  
**Required role**: admin

Update system settings.

**Request Body:**
```json
{
  "site_name": "Fresh County Updated",
  "currency": "NGN",
  "tax_rate": "7.5",
  "default_shipping_cost": "2000",
  "admin_email": "admin@freshcounty.ng"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      // Updated settings object
    }
  },
  "message": "Settings updated successfully"
}
```

---

## Utility Endpoints

### GET `/health`
**Authentication required**: No

Health check endpoint for monitoring.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T10:00:00Z",
    "database": "connected",
    "uptime": "2h 15m 30s",
    "version": "1.0.0"
  },
  "message": "Service is healthy"
}
```

---

## Webhooks

### POST `/webhooks/paystack`
**Authentication required**: No (verified by signature)

Paystack payment webhook for order updates.

**Headers:**
- `x-paystack-signature`: Paystack signature for verification

**Request Body:** Paystack event payload

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## Testing Endpoints

### POST `/test/email`
**Authentication required**: Yes  
**Required role**: admin

Send test email (development only).

**Request Body:**
```json
{
  "to": "test@example.com",
  "template": "welcome",
  "data": {
    "firstName": "John"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// API Client example
class FreshCountyAPI {
  private baseURL = 'https://api.freshcounty.com/api'
  private token: string | null = null

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    if (data.success) {
      this.token = data.data.token
      return data.data
    }
    throw new Error(data.error.message)
  }

  async getProducts(params = {}) {
    const url = new URL(`${this.baseURL}/products`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })

    const response = await fetch(url.toString())
    const data = await response.json()
    return data.success ? data.data : null
  }

  async addToCart(productId: string, quantity: number) {
    if (!this.token) throw new Error('Authentication required')

    const response = await fetch(`${this.baseURL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity
      })
    })

    const data = await response.json()
    return data.success ? data.data : null
  }
}

// Usage
const api = new FreshCountyAPI()
await api.login('user@example.com', 'password')
const products = await api.getProducts({ limit: 10 })
```

### Python
```python
import requests
import json

class FreshCountyAPI:
    def __init__(self, base_url='https://api.freshcounty.com/api'):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None

    def login(self, email, password):
        response = self.session.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        
        data = response.json()
        if data['success']:
            self.token = data['data']['token']
            self.session.headers.update({
                'Authorization': f'Bearer {self.token}'
            })
            return data['data']
        else:
            raise Exception(data['error']['message'])

    def get_products(self, **params):
        response = self.session.get(f'{self.base_url}/products', params=params)
        data = response.json()
        return data['data'] if data['success'] else None

    def create_order(self, delivery_address, payment_method='paystack'):
        response = self.session.post(f'{self.base_url}/orders', json={
            'delivery_address': delivery_address,
            'payment_method': payment_method
        })
        
        data = response.json()
        return data['data'] if data['success'] else None

# Usage
api = FreshCountyAPI()
api.login('user@example.com', 'password')
products = api.get_products(limit=10, category_slug='beverages')
```

---

## Error Codes Reference

| Code | Description | Common Causes |
|------|-------------|---------------|
| `AUTH_001` | Invalid credentials | Wrong email/password |
| `AUTH_002` | Token expired | JWT token needs refresh |
| `AUTH_003` | Insufficient permissions | Role doesn't have required access |
| `VALIDATION_001` | Required field missing | Missing required request field |
| `VALIDATION_002` | Invalid field format | Email format, UUID format, etc. |
| `PRODUCT_001` | Product not found | Invalid product ID |
| `PRODUCT_002` | Insufficient stock | Not enough inventory |
| `ORDER_001` | Order not found | Invalid order ID |
| `ORDER_002` | Order cannot be modified | Order status doesn't allow changes |
| `CART_001` | Empty cart | No items in cart |
| `UPLOAD_001` | File too large | Exceeds size limit |
| `UPLOAD_002` | Invalid file type | File type not allowed |

---

**API Version**: 1.0.0  
**Last Updated**: January 2025  
**Base URL**: `https://api.freshcounty.com/api`

For technical support, contact: support@freshcounty.com