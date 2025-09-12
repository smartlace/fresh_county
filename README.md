# 🍃 FreshCounty - Premium E-commerce Platform

![FreshCounty Logo](frontend/public/logo.png)

**FreshCounty** is a modern, full-stack e-commerce platform built with cutting-edge technologies, designed for premium food and beverage businesses. The platform features a customer-facing storefront, a comprehensive admin dashboard, and a robust backend API.

## 🏗️ **Architecture Overview**

```
📁 FreshCounty Web/
├── 🌐 frontend/              # Customer storefront (Next.js 15 + React 19)
├── 👨‍💼 admin-react/           # Admin dashboard (Next.js 14 + React 18)
├── 🖥️ backend/               # REST API server (Node.js + TypeScript)
├── 🗄️ database/              # MySQL schema and migrations
├── 📋 DEPLOYMENT_GUIDE.md    # Complete deployment instructions
└── 📚 API_DOCUMENTATION.md   # Comprehensive API reference
```

## ⭐ **Key Features**

### 🛍️ **Customer Experience**
- **Modern Storefront**: Next.js 15 with React 19 and Tailwind CSS v4
- **Smart Shopping Cart**: Real-time calculations with backend integration
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Responsive Design**: Mobile-first approach with accessibility features
- **Performance Optimized**: Web Vitals monitoring and optimization

### 👨‍💼 **Admin Management**
- **Enterprise Dashboard**: Comprehensive analytics with interactive charts
- **Multi-Factor Authentication**: TOTP-based security for admin access
- **Role-Based Access**: Admin, Manager, Staff permission levels
- **Real-time Analytics**: Revenue trends, order tracking, customer insights
- **Product Management**: Full CRUD operations with image handling

### 🔧 **Backend API**
- **RESTful Architecture**: Clean, documented API endpoints
- **TypeScript**: Full type safety and developer experience
- **Security First**: Rate limiting, CORS, input validation
- **Email Integration**: Automated notifications and marketing
- **File Upload**: Secure image and document handling

## 🚀 **Technology Stack**

### Frontend (Customer)
- **Framework**: Next.js 15.5.3 + React 19.1.0
- **Styling**: Tailwind CSS v4 with custom design system
- **Language**: TypeScript with strict mode
- **State**: Context API with localStorage persistence
- **Performance**: Web Vitals monitoring, bundle optimization

### Admin Dashboard
- **Framework**: Next.js 14.1.0 + React 18.2.0
- **UI Components**: Headless UI + Heroicons
- **Charts**: Recharts for data visualization
- **Security**: Multi-factor authentication (TOTP)
- **Analytics**: Real-time dashboard with period filtering

### Backend API
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: MySQL 8.0 with connection pooling
- **Authentication**: JWT with refresh token rotation
- **Email**: Nodemailer with template support
- **Security**: Rate limiting, CORS, input validation

### Database
- **Engine**: MySQL 8.0+
- **Design**: Normalized schema with proper indexing
- **Features**: UUID primary keys, soft deletes, audit trails
- **Migrations**: SQL scripts with version control

## 📋 **Prerequisites**

- **Node.js**: 18.0 or higher
- **MySQL**: 8.0 or higher
- **npm**: 9.0 or higher
- **Git**: For version control

## 🛠️ **Quick Start**

### 1. Clone Repository
```bash
git clone <repository-url>
cd fresh-county/web
```

> **Note**: All project documentation and source code is in the `web/` directory.

### 2. Database Setup
```bash
# Import database schema
mysql -u root -p < database/active-fc-database.sql

# Or use the migration scripts
cd database
./run-seed.sh
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### 5. Admin Setup
```bash
cd admin-react
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 🌐 **Application URLs**

- **Customer Store**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 📁 **Project Structure**

### Frontend (Customer)
```
frontend/
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API client
│   └── styles/             # CSS and styling
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### Admin Dashboard
```
admin-react/
├── src/
│   ├── app/                # Admin routes and pages
│   ├── components/         # Admin UI components
│   ├── contexts/          # Auth and settings contexts
│   ├── config/            # Environment configuration
│   └── utils/             # Helper utilities
├── public/                # Admin static assets
└── package.json          # Admin dependencies
```

### Backend API
```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Helper functions
├── templates/             # Email templates
└── uploads/               # File upload storage
```

## 🔐 **Security Features**

### Customer Security
- JWT authentication with refresh tokens
- Password strength validation
- Rate limiting on authentication endpoints
- CORS protection
- Input validation and sanitization

### Admin Security
- Multi-factor authentication (TOTP)
- Role-based access control (RBAC)
- Admin-specific rate limiting
- Enhanced security headers
- Session management

### API Security
- Comprehensive input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure file uploads

## 🧪 **Testing**

### Frontend Testing
```bash
cd frontend
npm run test        # Run Jest tests
npm run test:coverage  # Generate coverage report
```

### Backend Testing
```bash
cd backend
npm run test        # Run API tests
npm run test:integration  # Integration tests
```

## 📊 **Performance**

### Monitoring
- Web Vitals tracking
- Real-time performance metrics
- Error tracking and reporting
- Database query optimization

### Optimization
- Image optimization
- Code splitting
- Bundle analysis
- Database indexing

## 🚀 **Deployment**

### Production Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions including:

- Database setup and migration
- Backend API deployment
- Frontend build and deployment
- Admin panel configuration
- SSL and security setup
- Monitoring and maintenance

### Development Deployment
```bash
# Build all applications
npm run build:all

# Start production servers
npm run start:prod
```

## 📚 **Documentation**

- **[API Documentation](API_DOCUMENTATION.md)** - Complete REST API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Database Schema](database/README.md)** - Database structure and relationships

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 **License**

This project is proprietary software. All rights reserved.

## 📞 **Support**

For technical support or questions:

- **Email**: support@freshcounty.com
- **Documentation**: Check the docs folder
- **Issues**: Create an issue on the repository

## 🏷️ **Version Information**

- **Current Version**: v1.0.0
- **Node.js**: 18.x+
- **Database**: MySQL 8.0+
- **Frontend**: Next.js 15.x
- **Admin**: Next.js 14.x

---

**Built with ❤️ for premium food and beverage businesses**

*FreshCounty - Where quality meets technology*