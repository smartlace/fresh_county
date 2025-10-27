# 🚀 Fresh County - Complete Namecheap Deployment Guide

**Platform**: Namecheap Shared Hosting with cPanel  
**Target**: Production deployment of Fresh County e-commerce platform  
**Architecture**: Frontend (Next.js 15.5.3) + Backend (Node.js/Express) + Admin (Next.js 14.2.31) + Database (MySQL)

---

## 📋 **Prerequisites & System Requirements**

### Namecheap Hosting Requirements
- **Plan**: Stellar Plus or Business Hosting (Node.js support required)
- **Node.js Version**: 18.x or higher
- **Database**: MySQL 8.0+
- **Storage**: Minimum 5GB for application files and uploads
- **Domain**: SSL certificate enabled (AutoSSL)

### Local Development Requirements
- ✅ Node.js 18+ installed locally
- ✅ All code tested and committed
- ✅ Database schema ready (`active-fc-database.sql`)
- ✅ Environment variables documented
- ✅ Domain DNS configured

---

## 🗄️ **Phase 1: Database Setup**

### 1.1 Create MySQL Database
**Via Namecheap cPanel:**
1. Login to cPanel (`yourdomain.com/cpanel`)
2. Navigate to **"MySQL Databases"**
3. Create database: `[username]_freshcounty_prod`
4. Create user: `[username]_fcuser`
5. Set strong password (save securely)
6. Add user to database with **ALL PRIVILEGES**

### 1.2 Import Database Schema
**Using phpMyAdmin:**
1. Access phpMyAdmin from cPanel
2. Select database: `[username]_freshcounty_prod`
3. Go to **Import** tab
4. Upload `/database/active-fc-database.sql` (max 50MB)
5. Execute import and verify all tables created

**Database Connection Details (save these):**
```env
DB_HOST=localhost
DB_NAME=[username]_freshcounty_prod
DB_USER=[username]_fcuser
DB_PASSWORD=[your_secure_password]
DB_PORT=3306
```

---

## 🖥️ **Phase 2: Backend API Deployment**

### 2.1 Enable Node.js Support
**In cPanel:**
1. Navigate to **"Node.js Selector"** or **"Setup Node.js App"**
2. Create Node.js application:
   - **Node.js Version**: 18.x or higher
   - **Application Root**: `api`
   - **Application URL**: `/api`
   - **Application Startup File**: `dist/index.js`

### 2.2 Prepare Backend Environment
**Create backend `.env` file locally:**
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=[username]_freshcounty_prod
DB_USER=[username]_fcuser
DB_PASSWORD=your_secure_database_password
DB_PORT=3306

# Server Configuration
NODE_ENV=production
PORT=3001
API_BASE_URL=https://yourdomain.com/api

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_token_secret_different_from_jwt
JWT_EXPIRE_TIME=1h
JWT_REFRESH_EXPIRE_TIME=7d

# Email Configuration (Namecheap Email)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Fresh County

# Upload Configuration
UPLOAD_PATH=/home/[username]/public_html/uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Session Configuration
SESSION_SECRET=your_session_secret_minimum_32_characters

# Redis Configuration (Optional - will use memory store if Redis not available)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 2.3 Build and Upload Backend
**Local Build Process:**
```bash
cd backend
npm install
npm run build
```

**Upload Files via cPanel File Manager:**
1. Navigate to `/public_html/api/`
2. Upload these files/folders:
   - `dist/` folder (compiled TypeScript)
   - `node_modules/` folder (production dependencies)
   - `package.json`
   - `package-lock.json`
   - `.env` (with production values)

### 2.4 Configure Backend Application
**In Node.js App Manager:**
1. Go to **Node.js Selector**
2. Click on your API application
3. Set **Startup File**: `dist/index.js`
4. Set **Environment**: `production`
5. **Restart App**

### 2.5 Create Upload Directory
**In File Manager:**
1. Create: `/public_html/uploads/`
2. Set permissions: `755`
3. Create subdirectories:
   ```
   uploads/
   ├── products/
   ├── categories/
   ├── blog/
   └── temp/
   ```

---

## 🌐 **Phase 3: Frontend Deployment (Next.js 15.5.3)**

### 3.1 Configure Frontend Environment
**Create `.env.local` in frontend folder:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Fresh County
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3.2 Build Frontend Application
**Local Build Process:**
```bash
cd frontend
npm ci --production
npm run build
```

**Build Output:**
- Creates `.next/` folder with optimized application
- 26 static pages pre-rendered
- Vendor chunks optimized (~262kB)
- All TypeScript compiled and validated

### 3.3 Setup Frontend Node.js Application
**Create Frontend Node.js App in cPanel:**
1. Go to **Node.js Selector**
2. Create new application:
   - **Node.js Version**: 18.x
   - **Application Root**: `frontend`
   - **Application URL**: `/` (main domain)
   - **Application Startup File**: `server.js`

### 3.4 Upload Frontend Files
**Upload to `/public_html/frontend/`:**
- `.next/` folder (complete build output)
- `package.json` and `package-lock.json`
- `.env.local` (production environment)
- `next.config.js` (production configuration)
- `server.js` (create this file below)

**⚠️ IMPORTANT: Static Files for Root Domain**
**Also copy ALL files from `frontend/public/` to `/public_html/` (root directory):**
- `home-bg.jpg`, `nws.png`, `feature1.png`, `feature2.png`
- `logo.png`, `favicon.ico`, and all other static assets
- This makes images accessible at `https://yourdomain.com/home-bg.jpg`

**Create `/public_html/frontend/server.js`:**
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### 3.5 Install Dependencies and Start
**In Node.js App Manager:**
1. Click on frontend application
2. Install dependencies (or upload node_modules)
3. Set **Startup File**: `server.js`
4. Set **Environment**: `production`
5. **Restart App**

---

## 👨‍💼 **Phase 4: Admin Dashboard Deployment (Next.js 14.2.31)**

### 4.1 Configure Admin Environment
**Create `.env.local` in admin-react folder:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Fresh County Admin
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
NEXT_PUBLIC_ENVIRONMENT=production
```

### 4.2 Build Admin Dashboard
**Local Build Process:**
```bash
cd admin-react
npm ci --production
npm run build
```

**Build Features:**
- ✅ Enterprise security headers (HSTS, CSP, XSS protection)
- ✅ Optimized vendor chunks (~395kB)
- ✅ 18 static pages pre-rendered
- ✅ Standalone deployment configuration
- ✅ Admin-specific redirects and security policies

### 4.3 Setup Admin Subdomain
**Create Subdomain:**
1. In cPanel, go to **"Subdomains"**
2. Create: `admin.yourdomain.com`
3. Document root: `/public_html/admin/`

**Create Admin Node.js App:**
1. Go to **Node.js Selector**
2. Create new application:
   - **Node.js Version**: 18.x
   - **Application Root**: `admin`
   - **Application URL**: `admin.yourdomain.com`
   - **Application Startup File**: `server.js`

### 4.4 Upload Admin Files
**Upload to `/public_html/admin/`:**
- `.next/` folder (complete build with optimizations)
- `public/` folder (contains logo.png and static assets)
- `package.json` and `package-lock.json`
- `next.config.js` (shared hosting optimized configuration)
- `.env.local` (production environment)
- `server.js` (same as frontend server.js)

### 4.5 Install Dependencies and Start
**In Node.js App Manager:**
1. Click on admin application
2. Install dependencies
3. Set **Startup File**: `server.js`
4. Set **Environment**: `production`
5. **Enable Production Optimizations**
6. **Restart App**

---

## 🔧 **Phase 5: Configuration & Security**

### 5.1 Main .htaccess Configuration
**Note**: CloudLinux Passenger automatically handles frontend routing. The existing `.htaccess` file created by your hosting provider should remain unchanged:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/[username]/public_html/frontend"
PassengerBaseURI "/"
PassengerNodejs "/home/[username]/nodevenv/public_html/frontend/22/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION BEGIN
<IfModule Litespeed>
</IfModule>
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION END
```

**⚠️ Important**: Do not modify the main `/public_html/.htaccess` file. CloudLinux Passenger handles all routing automatically.

### 5.2 Configure API .htaccess
**Create `/public_html/api/.htaccess`:**
```apache
# Protect sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>

# CORS headers for both frontend and admin domains
SetEnvIf Origin "https://(www\.)?freshcounty\.com$" CORS_ALLOW_ORIGIN=$0
SetEnvIf Origin "https://admin\.freshcounty\.com$" CORS_ALLOW_ORIGIN=$0
Header always set Access-Control-Allow-Origin "%{CORS_ALLOW_ORIGIN}e" env=CORS_ALLOW_ORIGIN
Header always set Access-Control-Allow-Credentials "true"
Header always set Access-Control-Allow-Headers "origin, x-requested-with, content-type, authorization, x-csrftoken"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
Header always set Access-Control-Max-Age "3600"

# Handle preflight OPTIONS requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Security headers for API
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
```

**⚠️ IMPORTANT**: Replace `https://freshcounty.com` with your actual domain. For development, also add:
```apache
# Development CORS (add to above configuration during development)
Header always set Access-Control-Allow-Origin "http://localhost:3000"
```

### 5.3 SSL Certificate Setup
**Enable AutoSSL:**
1. In cPanel → **"SSL/TLS"**
2. Enable **AutoSSL** for domain and subdomains
3. Verify certificates installed:
   - `https://yourdomain.com`
   - `https://admin.yourdomain.com`

### 5.4 Email Configuration
**Setup Email Accounts:**
1. In cPanel → **"Email Accounts"**
2. Create: `noreply@yourdomain.com`
3. Create: `admin@yourdomain.com`
4. Configure SMTP settings in backend .env

---

## 🎯 **Phase 6: Testing & Verification**

### 6.1 Frontend Testing
- ✅ Homepage: `https://yourdomain.com`
- ✅ Products: `https://yourdomain.com/categories`
- ✅ User registration/login
- ✅ Cart and checkout functionality
- ✅ Order placement and confirmation

### 6.2 Backend API Testing
- ✅ Health check: `https://yourdomain.com/api/health`
- ✅ Products API: `https://yourdomain.com/api/products`
- ✅ Authentication: `https://yourdomain.com/api/auth/signin`
- ✅ File uploads working

### 6.3 Admin Dashboard Testing
- ✅ Admin login: `https://admin.yourdomain.com`
- ✅ Dashboard analytics loading
- ✅ Product management functionality
- ✅ Order management system
- ✅ User management features

---

## 🚨 **Phase 7: Monitoring & Maintenance**

### 7.1 Application Monitoring
**Monitor Application Health:**
- Backend logs: `/public_html/api/logs/`
- Frontend performance metrics
- Admin dashboard accessibility
- Database connection status

### 7.2 Security Monitoring
**Regular Security Tasks:**
- Monitor failed login attempts
- Review uploaded files
- Update Node.js dependencies monthly
- Rotate passwords quarterly

### 7.3 Backup Strategy
**Database Backups:**
- Setup automated MySQL backups in cPanel
- Download weekly manual backups
- Test restore procedures

**File Backups:**
- Backup `/public_html/uploads/` regularly
- Version control for code changes
- Configuration file backups

---

## 🔗 **Phase 8: DNS & Final Configuration**

### 8.1 DNS Configuration
**In Namecheap DNS Management:**
```
Type    Host      Value                TTL
A       @         [Server IP]          300
A       www       [Server IP]          300  
A       admin     [Server IP]          300
CNAME   api       yourdomain.com       300
```

### 8.2 Final Application URLs
**Live Application URLs:**
- **Customer Store**: `https://yourdomain.com`
- **Admin Dashboard**: `https://admin.yourdomain.com`
- **API Endpoints**: `https://yourdomain.com/api`
- **Upload Assets**: `https://yourdomain.com/uploads`

### 8.3 Application Architecture Summary
**Three Independent Node.js Applications:**
1. **Frontend** (`/public_html/frontend/`) - Customer-facing store
2. **Admin** (`/public_html/admin/`) - Management dashboard  
3. **Backend** (`/public_html/api/`) - API server

**Directory Structure:**
```
public_html/
├── frontend/                 ← Next.js 15.5.3 Customer Store
│   ├── .next/               ← Build output (26 pages, 264kB vendor)
│   ├── server.js            ← Node.js startup file
│   ├── next.config.js       ← Production configuration
│   └── .env.local           ← Environment variables
├── admin/                   ← Next.js 14.2.31 Admin Dashboard
│   ├── .next/               ← Build output (18 pages, 395kB vendor)
│   ├── server.js            ← Node.js startup file
│   ├── next.config.mjs      ← Enhanced security configuration
│   └── .env.local           ← Environment variables
├── api/                     ← Node.js/Express Backend
│   ├── dist/                ← Compiled TypeScript
│   ├── .env                 ← Backend environment variables
│   └── package.json         ← Backend dependencies
└── uploads/                 ← Shared upload directory
    ├── products/
    ├── categories/
    └── blog/
```

---

## 📞 **Troubleshooting**

### Common Issues

**Node.js App Won't Start:**
1. Check Node.js version (18.x+ required)
2. Verify startup file path: `dist/index.js` (backend), `server.js` (frontend/admin)
3. Check environment variables syntax
4. Review application logs in cPanel

**Redis Connection Errors:**
1. Set `REDIS_HOST=` (empty) in backend .env to disable Redis
2. Backend will automatically use memory store for sessions
3. Redeploy updated backend files to fix connection errors
4. Look for "Redis disabled - continuing without Redis" in logs

**Rate Limiter X-Forwarded-For Errors:**
1. Backend automatically trusts proxy headers for shared hosting
2. Errors should stop after deploying updated backend
3. This is normal for Namecheap/shared hosting environments

**Database Connection Failed:**
1. Verify database credentials in .env
2. Check MySQL user has ALL PRIVILEGES
3. Confirm database name format: `[username]_freshcounty_prod`
4. Test connection via phpMyAdmin

**Admin Dashboard Access Issues:**
1. **CORS Configuration**: Update `/public_html/api/.htaccess` with secure CORS headers:
   ```apache
   # Replace wildcard (*) with specific domain
   Header always set Access-Control-Allow-Origin "https://admin.freshcounty.com"
   Header always set Access-Control-Allow-Credentials "true"
   ```
2. **Authentication Errors**: Check browser console for "blocked by CORS policy" errors
3. **API Connectivity**: Verify admin can reach backend API at `/api/health`
4. **Environment Variables**: Confirm `NEXT_PUBLIC_API_URL` points to correct backend
5. **Session Issues**: Clear browser cache and cookies for admin domain

**Static Files (Images) Not Loading (404 Errors):**
1. **Copy Static Files**: Copy ALL files from `frontend/public/` to `/public_html/` root directory
2. **Check File Permissions**: Set permissions to 644 for files, 755 for directories
3. **Verify .htaccess**: Ensure main `/public_html/.htaccess` has static file rules:
   ```apache
   # Serve static files directly
   RewriteCond %{REQUEST_URI} \.(jpg|jpeg|png|gif|svg|ico|css|js)$ [NC]
   RewriteCond %{REQUEST_FILENAME} -f
   RewriteRule ^(.*)$ - [L]
   ```
4. **Test Direct Access**: Try accessing `https://yourdomain.com/logo.png` directly
5. **Clear CDN/Cache**: If using Cloudflare or similar, purge cache

**Frontend/Admin Not Loading:**
1. Check `.next` folder uploaded completely
2. Verify Node.js application running
3. Check server.js file present
4. Review browser console for errors

**TypeScript Config Errors (Frontend):**
1. Use `next.config.js` instead of `next.config.ts` for production
2. TypeScript is not needed in production Node.js environment
3. Upload the JavaScript version of the config file
4. Restart the Node.js application after upload

**Bundle Analyzer Module Errors (Frontend):**
1. Use `next.config.production.js` for shared hosting deployment
2. This version removes dev dependencies like @next/bundle-analyzer
3. Copy `next.config.production.js` to `next.config.js` for upload
4. Dev dependencies are not available in shared hosting environments

**Admin Standalone Output Errors:**
1. Use `next.config.production.js` for admin-react deployment
2. Removes `output: standalone` which doesn't work with shared hosting
3. Fixes deprecated `images.domains` configuration
4. Upload `public/` folder with logo.png and static assets
5. Use regular SSR mode instead of standalone mode

**Admin Logo/Asset Loading Issues:**
1. Ensure `public/` folder is uploaded to `/public_html/admin/public/`
2. Check that logo.png exists in the public folder
3. Verify static assets are accessible via browser
4. Use unoptimized: false for better image handling

**Admin Missing Dependencies (@tailwindcss/forms):**
1. Admin requires `@tailwindcss/forms` in devDependencies for proper Tailwind styling
2. Use `npm install --no-workspaces` to bypass workspace configuration issues
3. This installs dependencies directly in admin-react folder ignoring monorepo structure
4. Verify dev server works: `npm run dev` should start without module errors
5. Build process confirms all dependencies resolved: 18 static pages generated successfully

**Admin "Failed to Fetch" Login Errors:**
1. Admin API URL configuration was incorrect (double /api paths)
2. `.env.production` was pointing to wrong domain (api.freshcounty.ng vs freshcounty.com/api)
3. AuthContext and other components were using `env.API_URL + /api` instead of `env.API_BASE_URL`
4. Hardcoded localhost:3001 fallbacks in multiple components and config files
5. Components using `${API_BASE_URL}/api/...` creating double /api paths
6. Content Security Policy blocking API calls due to incorrect paths
7. Fixed by updating `.env.production` to use `https://freshcounty.com/api`
8. Fixed all components to use `env.API_BASE_URL` instead of `env.API_URL + /api`
9. Replaced all hardcoded `localhost:3001` with `https://freshcounty.com/api`
10. Corrected components to use `NEXT_PUBLIC_API_BASE_URL` instead of `NEXT_PUBLIC_API_URL`
11. Removed extra `/api` from all `${API_BASE_URL}/api/...` calls → `${API_BASE_URL}/...`
12. Updated CSP to allow `https://freshcounty.com` (all paths)
13. Clean rebuild required: `rm -rf .next && NODE_ENV=production npm run build`
14. Upload new `.next` folder and `.env.production` to live server
15. Restart Node.js application in cPanel after upload

**API Endpoints Not Working:**
1. Verify backend application running
2. Check CORS configuration in .htaccess
3. Test API health endpoint
4. Review backend logs

**File Upload Issues:**
1. Check uploads directory permissions (755)
2. Verify UPLOAD_PATH in backend .env
3. Check disk space availability
4. Review MAX_FILE_SIZE setting

---

## 🎉 **Deployment Complete!**

**Production Checklist:**
- ✅ Database imported and configured
- ✅ Backend API running (Node.js 18+)
- ✅ Frontend deployed (Next.js 15.5.3 SSR)
- ✅ Admin dashboard functional (Next.js 14.2.31)
- ✅ SSL certificates installed
- ✅ Email system configured
- ✅ File uploads working
- ✅ Security headers active
- ✅ Performance optimizations enabled

**Next Steps:**
1. Configure payment gateways
2. Setup Google Analytics
3. Implement SEO optimizations
4. Plan maintenance schedule
5. Monitor application performance

**🚀 Your Fresh County e-commerce platform is now live on Namecheap hosting with full Next.js SSR functionality!**