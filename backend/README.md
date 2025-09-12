# 🖥️ FreshCounty Backend API

The FreshCounty Backend API is a robust, TypeScript-based REST API server built with Express.js, providing secure and scalable endpoints for the e-commerce platform.

## 🏗️ **Architecture**

### Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript with strict mode
- **Framework**: Express.js
- **Database**: MySQL 8.0 with connection pooling
- **Authentication**: JWT with refresh token rotation
- **Email**: Nodemailer with HTML templates
- **File Upload**: Multer with security validation
- **Validation**: Express-validator

### Key Features
- ✅ **RESTful API Design** - Clean, consistent endpoints
- ✅ **TypeScript Safety** - Full type coverage
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access** - Admin, Manager, Staff, Customer roles
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Email Integration** - Automated notifications
- ✅ **File Upload** - Secure image/document handling
- ✅ **Error Handling** - Centralized error management
- ✅ **CORS Support** - Cross-origin request handling

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ running
- npm or yarn package manager

### Installation
```bash
# Clone repository and navigate to backend
cd web/backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### Environment Configuration
```env
# Database
DB_HOST=localhost
DB_NAME=freshcounty_dev
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=3306

# Server
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# JWT Secrets
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_different
JWT_EXPIRE_TIME=1h
JWT_REFRESH_EXPIRE_TIME=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@freshcounty.com
FROM_NAME=Fresh County

# Session & Security
SESSION_SECRET=your_session_secret_min_32_chars
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Origins
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002
```

### Development Server
```bash
# Start development server with hot reload
npm run dev

# Or start without hot reload
npm start

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📁 **Project Structure**

```
src/
├── config/              # Configuration files
│   ├── database.ts      # MySQL connection setup
│   ├── email.ts         # Email service configuration
│   └── session.ts       # Session configuration
├── controllers/         # Request handlers
│   ├── authController.ts      # Authentication endpoints
│   ├── productController.ts   # Product management
│   ├── orderController.ts     # Order processing
│   ├── userController.ts      # User management
│   ├── adminController.ts     # Admin dashboard
│   └── ...
├── middleware/          # Express middleware
│   ├── auth.ts          # Authentication middleware
│   ├── adminAuth.ts     # Admin authorization
│   ├── rateLimiter.ts   # Rate limiting
│   ├── upload.ts        # File upload handling
│   └── errorHandler.ts  # Global error handling
├── routes/              # API route definitions
│   ├── auth.ts          # Authentication routes
│   ├── products.ts      # Product routes
│   ├── orders.ts        # Order routes
│   ├── admin.ts         # Admin routes
│   └── ...
├── services/            # Business logic services
│   ├── emailService.ts  # Email sending logic
│   └── orderStatusService.ts
├── types/               # TypeScript type definitions
│   ├── database.ts      # Database types
│   └── index.ts         # Common types
├── utils/               # Helper functions
│   └── auth.ts          # Authentication utilities
├── templates/           # Email templates
│   └── email/
│       ├── welcome.hbs
│       ├── order-confirmation.hbs
│       └── ...
└── index.ts             # Application entry point
```

## 🔐 **Authentication & Authorization**

### JWT Authentication
The API uses JSON Web Tokens for stateless authentication:

```typescript
// Login endpoint returns tokens
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Routes
```typescript
// Authorization header required
Authorization: Bearer <token>

// Middleware automatically validates JWT
app.get('/api/protected-route', authenticate, handler)
```

### Role-Based Access Control
```typescript
// Admin-only endpoints
app.get('/api/admin/*', adminAuth, handler)

// Role hierarchy: admin > manager > staff > customer
const roles = ['customer', 'staff', 'manager', 'admin']
```

## 📡 **API Endpoints Overview**

### Authentication Routes (`/api/auth`)
```
POST   /register          # User registration
POST   /login             # User login
POST   /admin-login       # Admin login
POST   /logout            # User logout
POST   /refresh           # Refresh JWT token
POST   /forgot-password   # Request password reset
POST   /reset-password    # Reset password with token
GET    /verify-email/:token # Email verification
GET    /profile           # Get user profile
PUT    /change-password   # Change password
```

### Product Routes (`/api/products`)
```
GET    /                  # List products with filters
GET    /:id               # Get product details
POST   /                  # Create product (admin)
PUT    /:id               # Update product (admin)
DELETE /:id               # Delete product (admin)
GET    /:id/variations    # Get product variations
POST   /:id/variations    # Create variation (admin)
PUT    /variations/:id    # Update variation (admin)
```

### Order Routes (`/api/orders`)
```
GET    /                  # List user orders
POST   /                  # Create new order
GET    /:id               # Get order details
PUT    /:id/status        # Update order status (admin)
POST   /:id/cancel        # Cancel order
```

### Admin Routes (`/api/admin`)
```
GET    /dashboard         # Dashboard analytics
GET    /users             # List all users
GET    /orders            # List all orders
GET    /products          # Admin product management
GET    /analytics         # Advanced analytics
GET    /settings          # System settings
PUT    /settings          # Update settings
```

### Category Routes (`/api/categories`)
```
GET    /                  # List categories
GET    /:id               # Get category details
POST   /                  # Create category (admin)
PUT    /:id               # Update category (admin)
DELETE /:id               # Delete category (admin)
```

### Upload Routes (`/api/upload`)
```
POST   /product-image     # Upload product image
POST   /category-image    # Upload category image
POST   /blog-image        # Upload blog image
DELETE /:type/:filename   # Delete uploaded file
```

## 🛡️ **Security Features**

### Input Validation
```typescript
// Express-validator middleware
[
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().isLength({ min: 2 })
]
```

### Rate Limiting
```typescript
// Different limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts'
})
```

### CORS Configuration
```typescript
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
```

### File Upload Security
```typescript
// Multer configuration with validation
const upload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowedTypes.includes(file.mimetype))
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})
```

## 📧 **Email Integration**

### Email Templates
The API supports HTML email templates using Handlebars:

```typescript
// Email service usage
await emailService.sendWelcomeEmail(user.email, {
  firstName: user.first_name,
  verificationToken: token
})

// Available templates
- welcome.hbs           # User registration
- order-confirmation.hbs # Order placed
- order-shipped.hbs     # Order shipped
- order-delivered.hbs   # Order delivered
- password-reset.hbs    # Password reset
```

### SMTP Configuration
Supports various email providers:
- Gmail (recommended for development)
- SendGrid (production)
- Amazon SES (enterprise)
- Custom SMTP servers

## 🗄️ **Database Integration**

### Connection Pool
```typescript
// MySQL connection with pooling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

### Query Examples
```typescript
// Parameterized queries prevent SQL injection
const [users] = await pool.execute(
  'SELECT * FROM users WHERE email = ? AND is_active = 1',
  [email]
)

// Transaction support
const connection = await pool.getConnection()
await connection.beginTransaction()
try {
  // Multiple queries
  await connection.commit()
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  connection.release()
}
```

## 🧪 **Testing**

### Test Structure
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run specific test file
npm test -- authController.test.js
```

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Database operation testing
- **Email Tests**: Email sending verification

## 📈 **Performance & Monitoring**

### Database Optimization
- Connection pooling for scalability
- Proper indexing on frequently queried columns
- Query optimization and analysis
- Connection limit management

### Logging
```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### Health Check Endpoint
```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-12-12T10:30:00Z",
  "database": "connected",
  "uptime": "2h 15m"
}
```

## 🚀 **Production Deployment**

### Build Process
```bash
# Install production dependencies only
npm ci --production

# Build TypeScript
npm run build

# Start production server
npm run start:prod
```

### Environment Variables
Ensure all production environment variables are properly configured:
- Database credentials
- JWT secrets (different from development)
- SMTP configuration
- CORS origins
- File upload paths

### Process Management
Use PM2 for production process management:
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# View logs
pm2 logs
```

## 🔧 **Development Tools**

### Available Scripts
```json
{
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "start:prod": "NODE_ENV=production node dist/index.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Code Quality
- **ESLint**: Code linting and style consistency
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for pre-commit validation
- **TypeScript**: Static type checking

## 📚 **API Documentation**

For complete API documentation with request/response examples, see:
- **[API_DOCUMENTATION.md](../../API_DOCUMENTATION.md)** - Complete endpoint reference
- **Postman Collection**: Available in `/docs/postman/`
- **OpenAPI Specification**: Available at `/api/docs` when server is running

## 🤝 **Contributing**

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests: `npm run test`
4. Create pull request with description
5. Code review and approval
6. Merge to main branch

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write unit tests for new features
- Document public API methods
- Use conventional commit messages

## 🆘 **Troubleshooting**

### Common Issues

**Database Connection Failed**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Verify credentials in .env file
# Ensure database exists and user has permissions
```

**JWT Token Issues**
```bash
# Verify JWT secrets in environment
# Check token expiration times
# Ensure consistent secret across restarts
```

**Email Not Sending**
```bash
# Verify SMTP configuration
# Check email provider app password
# Test connection with email service
```

**File Upload Errors**
```bash
# Check upload directory permissions
chmod 755 uploads/

# Verify file size limits
# Check allowed file types
```

## 📄 **License**

This project is proprietary software. All rights reserved.

---

**FreshCounty Backend API** - Built with TypeScript, Express.js, and MySQL for scalable e-commerce solutions.