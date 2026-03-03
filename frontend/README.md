# 🌐 FreshCounty Frontend - Customer Storefront

The FreshCounty Frontend is a modern, high-performance e-commerce storefront built with Next.js 15, React 19, and Tailwind CSS v4. It provides a seamless shopping experience for customers with advanced features and optimizations.

## 🏗️ **Architecture**

### Technology Stack
- **Framework**: Next.js 15.5.3 (App Router)
- **React**: 19.1.0 with modern hooks
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React Context API + localStorage
- **HTTP Client**: Custom API service with error handling
- **Performance**: Web Vitals monitoring + optimization
- **Testing**: Jest + React Testing Library

### Key Features
- ✅ **Modern UI/UX** - Mobile-first responsive design
- ✅ **Shopping Cart** - Real-time calculations with backend integration
- ✅ **User Authentication** - JWT-based secure login/registration
- ✅ **Product Catalog** - Dynamic filtering and search
- ✅ **Order Management** - Complete order lifecycle
- ✅ **Performance Optimized** - Web Vitals monitoring
- ✅ **Accessibility** - WCAG compliance and keyboard navigation
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **PWA Ready** - Service worker and offline capabilities

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ installed
- Backend API running (see backend README)
- npm or yarn package manager

### Installation
```bash
# Navigate to frontend directory
cd web/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit environment variables
nano .env.local
```

### Environment Configuration
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Application Settings
NEXT_PUBLIC_APP_NAME=Fresh County
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Development Server
```bash
# Start development server
npm run dev

# Start on different port
npm run dev -- -p 3005

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm run test

# Generate test coverage
npm run test:coverage
```

## 📁 **Project Structure**

```
src/
├── app/                        # Next.js 13+ App Router
│   ├── (auth)/                 # Authentication routes
│   │   ├── signin/
│   │   └── signup/
│   ├── about/                  # Static pages
│   ├── blog/                   # Blog functionality
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout process
│   ├── products/               # Product catalog
│   ├── profile/                # User dashboard
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── not-found.tsx           # 404 page
├── components/                 # Reusable components
│   ├── auth/                   # Authentication components
│   │   ├── signin-modal.tsx
│   │   ├── signup-modal.tsx
│   │   └── protected-route.tsx
│   ├── cart/                   # Shopping cart components
│   │   └── cart-notification.tsx
│   ├── layout/                 # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── main-layout.tsx
│   ├── shop/                   # E-commerce components
│   │   ├── product-card.tsx
│   │   ├── categories-section.tsx
│   │   └── featured-section.tsx
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   └── error/                  # Error handling
│       ├── ErrorBoundary.tsx
│       └── ChunkErrorBoundary.tsx
├── contexts/                   # React Context providers
│   ├── AuthContext.tsx         # User authentication state
│   └── CartContext.tsx         # Shopping cart state
├── hooks/                      # Custom React hooks
│   ├── usePerformanceMonitor.ts
│   └── useWebsitePage.ts
├── lib/                        # Utilities and services
│   ├── api.ts                  # API client service
│   ├── auth-utils.ts           # Authentication helpers
│   ├── config.ts               # App configuration
│   ├── storage.ts              # Storage management
│   ├── types.ts                # TypeScript definitions
│   └── utils.ts                # General utilities
├── middleware.ts               # Next.js middleware
└── styles/                     # CSS files
    ├── globals.css
    ├── components.css
    └── utilities.css
```

## 🎨 **Design System**

### Brand Colors
```css
/* Primary Brand Colors */
--primary-500: #f97316;     /* Orange 500 - Primary brand */
--primary-600: #ea580c;     /* Orange 600 - Hover states */
--primary-700: #c2410c;     /* Orange 700 - Active states */

/* Semantic Colors */
--success: #10b981;         /* Green - Success states */
--error: #ef4444;           /* Red - Error states */
--warning: #f59e0b;         /* Yellow - Warning states */
--info: #3b82f6;            /* Blue - Info states */
```

### Typography
```css
/* Font Families */
--font-inter: 'Inter', system-ui, sans-serif;
--font-roboto-condensed: 'Roboto Condensed', system-ui, sans-serif;

/* Font Scales */
font-size: clamp(1rem, 2.5vw, 1.125rem);  /* Responsive scaling */
```

### Responsive Breakpoints
```css
/* Tailwind CSS Breakpoints */
sm: '640px',      /* Small devices */
md: '768px',      /* Medium devices */
lg: '1024px',     /* Large devices */
xl: '1280px',     /* Extra large devices */
2xl: '1536px'     /* 2X large devices */
```

## 🛍️ **E-commerce Features**

### Shopping Cart
```typescript
// Real-time cart with backend integration
const { 
  items, 
  addItem, 
  removeItem, 
  updateQuantity,
  total,
  deliveryCost,
  taxAmount 
} = useCart()

// Features:
- Real-time price calculations
- Shipping zone selection
- Discount code application
- Persistent cart state
- Mobile-optimized interface
```

### Authentication System
```typescript
// JWT-based authentication
const { 
  user, 
  login, 
  register, 
  logout, 
  isLoading,
  isAuthenticated 
} = useAuth()

// Features:
- Secure registration with validation
- Login with remember me option
- Password reset functionality
- Protected route components
- Automatic token refresh
```

### Product Catalog
```typescript
// Dynamic product browsing
- Category-based filtering
- Search functionality
- Product variations (sizes, prices)
- Image optimization
- Lazy loading
- SEO optimization
```

## 🔐 **Authentication & Security**

### User Registration
```typescript
// Registration with comprehensive validation
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678"
}

// Validation includes:
- Email format validation
- Password strength requirements
- Phone number formatting
- Duplicate email checking
- Real-time form feedback
```

### Protected Routes
```typescript
// Route protection middleware
<ProtectedRoute>
  <UserDashboard />
</ProtectedRoute>

// Features:
- Automatic redirect to login
- Loading states
- Error handling
- Route persistence after login
```

### Security Headers
Next.js configuration includes comprehensive security headers:
```typescript
// Security headers in next.config.ts
{
  'Content-Security-Policy': "default-src 'self'; ...",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000'
}
```

## 📱 **Responsive Design**

### Mobile-First Approach
```css
/* Mobile base styles */
.product-card {
  @apply p-4 rounded-lg;
}

/* Tablet styles */
@media (min-width: 768px) {
  .product-card {
    @apply p-6 rounded-xl;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .product-card {
    @apply p-8 rounded-2xl;
  }
}
```

### Touch-Friendly Interface
- Minimum 44px touch targets
- Swipe gestures for mobile
- Optimized form inputs
- Accessible navigation
- Fast tap responses

## ⚡ **Performance Optimization**

### Web Vitals Monitoring
```typescript
// Real-time performance tracking
const { measurePerformance } = usePerformanceMonitor()

// Tracks:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)
- Memory usage monitoring
```

### Image Optimization
```typescript
// Next.js Image component with optimization
<Image
  src="/product-image.jpg"
  alt="Product name"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### Code Splitting
```typescript
// Dynamic imports for performance
const ProductModal = dynamic(() => import('./ProductModal'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Build optimization
npm run build

# Performance audit
npm run lighthouse
```

## 🧪 **Testing**

### Test Structure
```bash
src/
├── components/
│   └── __tests__/
│       ├── Button.test.tsx
│       └── ProductCard.test.tsx
├── hooks/
│   └── __tests__/
│       └── useAuth.test.ts
└── lib/
    └── __tests__/
        └── api.test.ts
```

### Running Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm run test Button.test.tsx
```

### Test Examples
```typescript
// Component testing
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

test('renders button with correct text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})

// Hook testing
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

test('handles login correctly', async () => {
  const { result } = renderHook(() => useAuth())
  
  await act(async () => {
    await result.current.login({
      email: 'test@example.com',
      password: 'password'
    })
  })
  
  expect(result.current.isAuthenticated).toBe(true)
})
```

## 🌍 **Accessibility**

### WCAG Compliance
```typescript
// Semantic HTML structure
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/products" aria-current="page">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// Form accessibility
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
  required
/>
<div id="email-error" role="alert">
  {errorMessage}
</div>
```

### Keyboard Navigation
- Tab order management
- Focus indicators
- Skip links
- Escape key handling
- Arrow key navigation

### Screen Reader Support
- ARIA labels and descriptions
- Live regions for dynamic content
- Proper heading hierarchy
- Alternative text for images
- Form field associations

## 🚀 **Deployment**

### Production Build
```bash
# Build optimized production bundle
npm run build

# Analyze bundle size
npm run analyze

# Start production server
npm start
```

### Environment Variables
```env
# Production environment
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

### Static Export (Optional)
```bash
# Generate static files
npm run export

# Upload static files to hosting
# Files will be in 'out' directory
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

## 🔧 **Development Tools**

### Available Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "analyze": "ANALYZE=true next build"
}
```

### Code Quality Tools
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks for quality gates
- **Lint-staged**: Pre-commit linting

## 🔍 **SEO Optimization**

### Metadata Configuration
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Fresh County - Premium Food & Beverages',
  description: 'Discover fresh, premium food and beverages...',
  keywords: 'food, beverages, fresh, premium, organic',
  openGraph: {
    title: 'Fresh County',
    description: 'Premium food and beverages',
    images: ['/og-image.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    site: '@freshcounty'
  }
}
```

### Structured Data
```typescript
// JSON-LD structured data for products
const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "NGN"
  }
}
```

## 🧩 **Component Library**

### Base Components
```typescript
// Button component with variants
<Button variant="primary" size="lg">
  Add to Cart
</Button>

// Input component with validation
<Input
  type="email"
  placeholder="Enter email"
  error="Invalid email format"
/>

// Badge component for status
<Badge variant="success">
  In Stock
</Badge>
```

### Layout Components
```typescript
// Responsive header
<Header 
  user={user}
  cartItemCount={itemCount}
  onMenuToggle={handleMenuToggle}
/>

// Footer with links
<Footer 
  links={footerLinks}
  socialLinks={socialLinks}
/>
```

## 🤝 **Contributing**

### Development Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes with tests
3. Run quality checks: `npm run lint && npm run test`
4. Create pull request with description
5. Code review and approval
6. Merge to main branch

### Component Guidelines
- Use TypeScript for all components
- Include props documentation
- Write unit tests
- Follow accessibility guidelines
- Use Tailwind CSS for styling
- Implement error boundaries

## 🆘 **Troubleshooting**

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Hydration Errors**
```typescript
// Use dynamic imports for client-only components
const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
)
```

**Performance Issues**
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Optimize images
npm run optimize-images
```

**API Connection Issues**
```typescript
// Check environment variables
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

// Verify backend is running
curl http://localhost:3001/api/health
```

## 📚 **Resources**

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Tools & Extensions
- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Auto Rename Tag

## 📄 **License**

This project is proprietary software. All rights reserved.

---

**FreshCounty Frontend** - Modern React e-commerce storefront built for performance and user experience.