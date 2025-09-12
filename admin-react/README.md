# Fresh County Admin Dashboard

A comprehensive, enterprise-grade React admin dashboard for Fresh County e-commerce platform. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring real-time analytics, complete order management, and robust security.

## 🏗️ Architecture Overview

```
admin-react/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── analytics/          # Advanced analytics dashboard
│   │   ├── blog/               # Blog management system
│   │   ├── categories/         # Product category management
│   │   ├── coupons/            # Coupon and discount management
│   │   ├── dashboard/          # Main dashboard with KPIs
│   │   ├── login/              # Admin authentication
│   │   ├── newsletters/        # Newsletter management
│   │   ├── orders/             # Order management with stats
│   │   ├── products/           # Product catalog management
│   │   ├── profile/            # Admin profile management
│   │   ├── settings/           # System configuration
│   │   ├── users/              # User account management
│   │   └── website-pages/      # Content management
│   ├── components/             # Reusable React components
│   │   ├── AuthenticatedLayout.tsx    # Main layout wrapper
│   │   ├── EmptyState.tsx             # Empty state component
│   │   ├── ImageUpload.tsx            # File upload component
│   │   └── Navigation.tsx             # Sidebar navigation
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx            # Authentication state
│   │   └── SettingsContext.tsx        # System settings state
│   ├── config/                 # Configuration files
│   │   └── env.ts              # Environment configuration
│   ├── utils/                  # Utility functions
│   │   ├── auth.ts             # Authentication helpers
│   │   └── imageProxy.ts       # Image proxy utilities
│   └── middleware.ts           # Next.js middleware for auth
├── public/                     # Static assets
│   ├── logo.png               # Application logo
│   └── fav.png                # Favicon
└── package.json               # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **npm or yarn**
- **Fresh County Backend API** running on port 3001
- **Valid admin credentials** (admin@freshcounty.ng / admin123 by default)

### Installation & Setup

1. **Navigate to admin dashboard:**
   ```bash
   cd web/admin-react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   ```bash
   cp .env.example .env.local
   ```

   Configure `.env.local`:
   ```env
   # API Configuration (Required)
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # Optional Configuration
   NEXT_PUBLIC_APP_NAME=Fresh County Admin
   NEXT_PUBLIC_SESSION_TIMEOUT=3600000
   NEXT_PUBLIC_PAGINATION_LIMIT=20
   NEXT_PUBLIC_MAX_FILE_SIZE=5242880
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   **Admin Dashboard**: http://localhost:3002

5. **Login with default admin:**
   - **Email**: admin@freshcounty.ng
   - **Password**: admin123
   - **Note**: Change default password immediately

## 📊 Complete Feature Set

### 🏠 **Dashboard & Analytics**
- **Real-time KPIs**: Revenue, orders, customers, growth metrics
- **Order Statistics**: Pending, processing, delivered, cancelled tracking with visual charts
- **Revenue Analytics**: Daily, weekly, monthly revenue trends with interactive charts
- **Top Products**: Best-selling products with sales data
- **Recent Orders**: Latest order activity with customer details
- **Low Stock Alerts**: Products requiring inventory attention
- **Quick Actions**: Direct access to create orders, products, users

### 📈 **Advanced Analytics**
- **Revenue Trends**: Historical revenue analysis with date range filters
- **Customer Insights**: Registration trends, repeat customer analysis
- **Payment Analytics**: Payment method distribution and success rates
- **Geographic Data**: Sales distribution by location
- **Performance Metrics**: Conversion rates, average order value
- **Custom Date Ranges**: Flexible reporting periods
- **Export Capabilities**: Download reports in multiple formats

### 🛒 **Order Management**
- **Complete Order Listing**: All orders with advanced filtering and search
- **Order Status Management**: Update status (pending → processing → shipped → delivered)
- **Customer Information**: Full customer details and order history
- **Payment Tracking**: Payment status, method, and transaction details
- **Order Search**: Search by customer name, email, order number, status
- **Bulk Operations**: Mass status updates and bulk actions
- **Order Details**: Comprehensive order view with line items and pricing
- **Status History**: Complete timeline of order status changes

### 📦 **Product & Inventory Management**
- **Product CRUD**: Create, read, update, delete products with full validation
- **Category Management**: Hierarchical category structure with nested categories
- **Image Management**: Multiple product images with drag-and-drop upload
- **Stock Control**: Real-time inventory tracking with automatic status updates
- **Featured Products**: Homepage product highlighting
- **Product Status**: Active, inactive, draft status management
- **SEO Optimization**: Meta titles, descriptions, and URL slugs
- **Bulk Operations**: Mass product updates and operations
- **Import/Export**: Product data management capabilities

### 🏷️ **Coupon & Discount System**
- **Coupon Creation**: Percentage and fixed amount discounts
- **Usage Limits**: Per-customer and total usage restrictions
- **Date Validity**: Start and end date configuration
- **Minimum Order**: Minimum purchase amount requirements
- **Usage Analytics**: Track redemption rates and effectiveness
- **Bulk Management**: Create and manage multiple coupons
- **Search & Filter**: Find coupons by code, type, status, dates
- **Active/Inactive**: Enable or disable coupons instantly

### 👥 **User Management**
- **Customer Overview**: All customer accounts with activity metrics
- **Staff Management**: Admin, manager, and staff account management
- **Role-Based Access**: Granular permissions (admin/manager/staff/customer)
- **Account Controls**: Activate, deactivate, and delete user accounts
- **User Analytics**: Customer spending, order count, registration date
- **Search & Filter**: Find users by name, email, role, status
- **Profile Management**: Edit user information and roles
- **Activity Tracking**: User login and activity monitoring

### 🎯 **Content Management**
- **Blog System**: 
  - Create, edit, delete blog posts
  - Category and tag management
  - SEO optimization with meta fields
  - Featured image upload
  - Content status (draft/published/archived)
  - Comment moderation and management
- **Newsletter Management**:
  - Subscriber list management
  - Campaign creation and tracking
  - Open rate and click-through analytics
  - Subscription status management
- **Website Pages**:
  - FAQ section management
  - Custom page creation (policies, terms, etc.)
  - Page status and visibility controls
  - SEO metadata management

### ⚙️ **System Configuration**
- **Site Settings**: Company name, contact information, branding
- **Dynamic Branding**: Site name appears throughout the interface
- **Tax & Shipping**: Tax rates and shipping cost configuration
- **Email Settings**: SMTP configuration and email templates
- **Payment Settings**: Paystack configuration and webhook setup
- **Security Settings**: Password policies, session timeouts
- **User Preferences**: Admin profile and notification settings

### 🔐 **Security & Authentication**

#### **Multi-Layer Security**
- **Role-Based Access Control**: 4-tier permission system
- **Admin-Only Access**: Customers completely blocked from dashboard login
- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Session Management**: Configurable session timeouts and security
- **Password Security**: Strong password requirements and bcrypt hashing
- **Brute Force Protection**: Login attempt limiting and account lockout

#### **Advanced Security Features**
- **Input Validation**: Comprehensive client and server-side validation
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Headers**: Content Security Policy and security headers
- **File Upload Security**: MIME type validation and size limits
- **Audit Logging**: Admin activity tracking and monitoring

## 🌐 Complete API Integration

### Authentication & Session Management
```
POST   /api/auth/admin-login        # Admin/staff login (role-restricted)
POST   /api/auth/logout             # Secure logout with session cleanup
POST   /api/auth/refresh            # JWT token refresh
GET    /api/auth/profile            # Get admin profile information
PUT    /api/auth/profile            # Update admin profile
```

### Dashboard & Analytics
```
GET    /api/admin/dashboard         # Main dashboard statistics and KPIs
GET    /api/admin/analytics         # Advanced analytics with date filtering
GET    /api/admin/activity          # Recent admin activity logs
GET    /api/admin/orders/stats      # Order statistics for dashboard
```

### Order Management
```
GET    /api/admin/orders            # List all orders with filtering
  ?page=1&limit=20                 # Pagination
  ?status=pending                  # Filter by status
  ?search=customer-name            # Search orders
  ?start_date=2024-01-01          # Date range filtering
  ?end_date=2024-12-31
  ?sort_by=created_at&sort_order=DESC

GET    /api/admin/orders/:id        # Get detailed order information
PUT    /api/admin/orders/:id        # Update order status and details
GET    /api/admin/orders/stats      # Order statistics and metrics
```

### User Management
```
GET    /api/admin/users             # List all users with filtering
  ?page=1&limit=20                 # Pagination
  ?role=customer                   # Filter by role
  ?status=active                   # Filter by status
  ?search=user-name                # Search users

POST   /api/admin/users             # Create new user account
PUT    /api/admin/users/:id         # Update user details
DELETE /api/admin/users/:id         # Delete user account (hard delete)
PUT    /api/admin/users/:id/status  # Update user status (activate/deactivate)
```

### Product Management
```
GET    /api/products                # List all products with admin details
  ?page=1&limit=20                 # Pagination
  ?category=category-id            # Filter by category
  ?status=active                   # Filter by status
  ?search=product-name             # Search products
  ?sort_by=created_at              # Sort options

GET    /api/products/:id            # Get detailed product information
POST   /api/products                # Create new product
PUT    /api/products/:id            # Update product details
DELETE /api/products/:id            # Delete product
```

### Category Management
```
GET    /api/products/categories     # List all categories
GET    /api/products/categories/tree # Get hierarchical category structure
GET    /api/products/categories/:id # Get category details
POST   /api/products/categories     # Create new category
PUT    /api/products/categories/:id # Update category
DELETE /api/products/categories/:id # Delete category
```

### Coupon Management
```
GET    /api/admin/coupons           # List all coupons with filtering
  ?page=1&limit=20                 # Pagination
  ?status=active                   # Filter by status
  ?type=percentage                 # Filter by discount type
  ?search=coupon-code              # Search coupons

GET    /api/admin/coupons/:id       # Get coupon details
POST   /api/admin/coupons           # Create new coupon
PUT    /api/admin/coupons/:id       # Update coupon
DELETE /api/admin/coupons/:id       # Delete coupon
GET    /api/admin/coupons/stats     # Coupon usage analytics
```

### Content Management
```
# Blog Management
GET    /api/admin/blog/posts        # List blog posts
POST   /api/admin/blog/posts        # Create blog post
PUT    /api/admin/blog/posts/:id    # Update blog post
DELETE /api/admin/blog/posts/:id    # Delete blog post
GET    /api/admin/blog/categories   # Blog categories
POST   /api/admin/blog/categories   # Create blog category

# Newsletter Management
GET    /api/admin/newsletter/subscribers # List subscribers
GET    /api/admin/newsletter/campaigns   # List campaigns
POST   /api/admin/newsletter/campaigns   # Create campaign
GET    /api/admin/newsletter/stats       # Newsletter analytics

# Website Pages
GET    /api/admin/pages             # List website pages
POST   /api/admin/pages             # Create page
PUT    /api/admin/pages/:id         # Update page
DELETE /api/admin/pages/:id         # Delete page
```

### File Upload Management
```
POST   /api/upload/product-images   # Upload product images
POST   /api/upload/category-image   # Upload category image
POST   /api/upload/blog-image       # Upload blog post image
DELETE /api/upload/:filename        # Delete uploaded file
```

### System Settings
```
GET    /api/admin/settings          # Get all system settings
PUT    /api/admin/settings          # Update system configuration
  {
    "site_name": "Fresh County",
    "currency": "NGN",
    "tax_rate": "7.5",
    "shipping_cost": "1500",
    "admin_email": "admin@freshcounty.ng"
  }
```

## 🎨 Technology Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router and TypeScript
- **React 18** - Component-based UI with hooks and context
- **TypeScript** - Type safety and enhanced development experience

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework with custom configurations
- **Heroicons** - Modern icon library for consistent iconography
- **Responsive Design** - Mobile-first approach with breakpoint optimization

### State Management & Data
- **React Context API** - Global state management for auth and settings
- **Custom Hooks** - Reusable logic for data fetching and state management
- **Local Storage** - Persistent storage for user preferences and tokens

### Forms & Validation
- **React Hook Form** - Performant forms with minimal re-renders
- **Client-side Validation** - Real-time form validation with error handling
- **TypeScript Interfaces** - Type-safe form data and validation schemas

### Authentication & Security
- **JWT Tokens** - Secure authentication with automatic refresh
- **Role-Based Access** - Component-level permission controls
- **Secure Storage** - Encrypted token storage and session management
- **CSRF Protection** - Cross-site request forgery prevention

## 🔧 Development Tools & Scripts

### Available Scripts
```bash
# Development
npm run dev          # Start development server on port 3002
npm run build        # Create optimized production build
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run type-check   # TypeScript type checking
```

### Development Environment
```bash
# Environment setup
cp .env.example .env.local
npm install
npm run dev

# Code quality
npm run lint         # Check code style and errors
npm run type-check   # Verify TypeScript types
```

### Build & Production
```bash
# Production build
npm run build        # Optimize for production
npm run start        # Start production server

# Environment variables for production
NEXT_PUBLIC_API_URL=https://api.yourproductiondomain.com
```

## 🔐 Security Implementation

### Authentication Flow
1. **Admin Login**: POST `/api/auth/admin-login` with credentials
2. **Token Storage**: JWT stored securely with httpOnly cookies
3. **Automatic Refresh**: Tokens refreshed before expiration
4. **Role Validation**: Each route validates user permissions
5. **Secure Logout**: Complete session cleanup on logout

### Permission Levels
- **Admin**: Full system access, user management, system settings
- **Manager**: Order management, product management, analytics
- **Staff**: Limited order management, basic analytics
- **Customer**: Blocked from admin dashboard entirely

### Security Headers
```javascript
// Implemented security headers
"Content-Security-Policy": "default-src 'self'",
"X-Frame-Options": "DENY",
"X-Content-Type-Options": "nosniff",
"Referrer-Policy": "strict-origin-when-cross-origin",
"Strict-Transport-Security": "max-age=31536000"
```

### Input Validation
- **Client-side**: Real-time validation with TypeScript types
- **Server-side**: Express-validator for all API endpoints
- **File Upload**: MIME type and size validation
- **XSS Prevention**: Input sanitization and output encoding

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile devices
- **Tablet**: `md:` breakpoint (768px and up)
- **Desktop**: `lg:` breakpoint (1024px and up)
- **Large Desktop**: `xl:` breakpoint (1280px and up)

### Navigation
- **Desktop**: Full sidebar navigation with icons and labels
- **Mobile**: Collapsible hamburger menu with overlay
- **Tablet**: Condensed sidebar with icon-only navigation

### Data Tables
- **Desktop**: Full table with all columns
- **Tablet**: Priority columns with responsive hiding
- **Mobile**: Card-based layout for optimal mobile experience

## 🚀 Production Deployment

### Build Configuration
```bash
# Production build
npm run build

# Environment variables
NEXT_PUBLIC_API_URL=https://api.freshcounty.com
NEXT_PUBLIC_APP_NAME=Fresh County Admin
NODE_ENV=production
```

### Deployment Platforms

#### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.freshcounty.com
```

#### **Netlify**
```bash
# Build command: npm run build
# Publish directory: out
# Environment variables in Netlify dashboard
```

#### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

### Production Security Checklist
- [ ] **HTTPS Only**: Enforce SSL/TLS for all connections
- [ ] **Environment Variables**: All secrets in environment, not code
- [ ] **API URLs**: Production API endpoints configured
- [ ] **CSP Headers**: Content Security Policy implemented
- [ ] **Token Security**: Secure JWT storage and transmission
- [ ] **Rate Limiting**: API rate limiting configured
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Monitoring**: Error tracking and performance monitoring
- [ ] **Backup Strategy**: Regular database and file backups
- [ ] **Access Logs**: Comprehensive audit logging enabled

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist
```bash
# Authentication
[ ] Admin login with valid credentials
[ ] Customer login blocked (shows error)
[ ] Token refresh on expiration
[ ] Secure logout and session cleanup

# Dashboard
[ ] KPIs load correctly
[ ] Charts render with real data
[ ] Recent orders display
[ ] Quick actions work

# Order Management
[ ] Order list loads with pagination
[ ] Filtering and search functions
[ ] Status updates save correctly
[ ] Order details view complete

# User Management
[ ] User list loads and filters
[ ] User creation with validation
[ ] Role updates save correctly
[ ] User deletion confirms

# Product Management
[ ] Product CRUD operations
[ ] Image upload functions
[ ] Category assignment works
[ ] Stock tracking updates
```

### Performance Testing
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:3002

# Bundle analysis
npm install --save-dev @next/bundle-analyzer
npm run build && npm run analyze
```

## 🔧 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check backend is running
curl http://localhost:3001/health

# Verify environment variables
echo $NEXT_PUBLIC_API_URL

# Check network connectivity
ping localhost
```

**2. Authentication Issues**
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Check JWT token format
console.log(localStorage.getItem('fresh_county_token'))

# Verify admin credentials
# Default: admin@freshcounty.ng / admin123
```

**3. Build Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check TypeScript errors
npm run type-check

# Verify dependencies
rm -rf node_modules package-lock.json
npm install
```

**4. Permission Errors**
```bash
# Check user role in database
SELECT email, role FROM users WHERE email = 'admin@freshcounty.ng';

# Verify JWT payload
# Check browser console for token decode errors
```

### Development Debugging
```javascript
// Enable debug mode in .env.local
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true

// Access debug info in browser console
window.debugInfo = {
  user: currentUser,
  token: localStorage.getItem('fresh_county_token'),
  apiUrl: process.env.NEXT_PUBLIC_API_URL
}
```

## 📞 Support & Documentation

### Getting Help
1. **Check API Documentation**: Verify endpoint availability and parameters
2. **Browser Console**: Check for JavaScript errors and network failures
3. **Network Tab**: Inspect API requests and responses
4. **Backend Logs**: Check backend server logs for errors
5. **Database Connection**: Verify database connectivity and permissions

### Additional Resources
- **Backend API**: http://localhost:3001/health
- **Database Schema**: `../database/schema-complete.sql`
- **Environment Config**: `src/config/env.ts`
- **Authentication Flow**: `src/contexts/AuthContext.tsx`

---

**Fresh County Admin Dashboard** - Complete administrative control for your e-commerce platform.  
Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.