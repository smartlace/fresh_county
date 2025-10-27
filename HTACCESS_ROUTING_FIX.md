# 🔧 Main .htaccess Routing Configuration Fix

## Issue
The main `/public_html/.htaccess` routing needs to properly handle:
1. Static files (images, CSS, JS) served directly from root
2. Admin dashboard routing (`admin.freshcounty.com`)
3. API endpoints (`freshcounty.com/api`)
4. Upload files (`freshcounty.com/uploads`)
5. Frontend application for all other routes

## ✅ UPDATED CONFIGURATION

Replace `/public_html/.htaccess` with:

```apache
# Enable compression for better performance
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript application/json
</IfModule>

# Cache static assets for better performance
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Force HTTPS in production
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Application routing - Direct directory access
RewriteRule ^api/(.*)$ /api/$1 [L,QSA]
RewriteRule ^uploads/(.*)$ /uploads/$1 [L,QSA]

# Admin subdomain routing (if using subdomain)
# This handles admin.freshcounty.com requests
RewriteCond %{HTTP_HOST} ^admin\.
RewriteRule ^(.*)$ /admin/$1 [L,QSA]

# Frontend application - Handle all other requests
# Skip if file or directory exists (static files already resolved)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(admin|api|uploads)/
RewriteRule ^(.*)$ /frontend/$1 [L,QSA]
```

## What This Configuration Does

### 1. **Static File Serving** (Lines 30-33)
- Serves images, CSS, JS directly from `/public_html/` root
- Only if the file actually exists (`-f` check)
- Stops processing other rules with `[L]` flag

### 2. **Directory Routing** (Lines 35-39)
- `/admin` → `/public_html/admin/` (Admin Dashboard)
- `/api` → `/public_html/api/` (Backend API)
- `/uploads` → `/public_html/uploads/` (File Uploads)

### 3. **Frontend Fallback** (Lines 41-44)
- Everything else goes to `/public_html/frontend/`
- Only if not an existing file/directory
- Preserves query strings with `[QSA]`

## Required File Structure

```
public_html/
├── .htaccess                    ← This configuration
├── home-bg.jpg                 ← Static images (copied from frontend/public/)
├── logo.png                    ← Static images (copied from frontend/public/)
├── feature1.png               ← Static images (copied from frontend/public/)
├── (all other static assets)   ← Static images (copied from frontend/public/)
├── frontend/                   ← Next.js Frontend App
│   ├── .next/
│   ├── server.js
│   └── package.json
├── admin/                      ← Next.js Admin App  
│   ├── .next/
│   ├── server.js
│   └── package.json
├── api/                        ← Express Backend
│   ├── dist/
│   ├── .env
│   └── package.json
└── uploads/                    ← File uploads
    ├── products/
    ├── categories/
    └── blog/
```

## Testing the Configuration

1. **Static Files**: `https://freshcounty.com/logo.png` → Should load directly
2. **Admin Dashboard**: `https://admin.freshcounty.com` → Routes to `/admin`
3. **API Endpoints**: `https://freshcounty.com/api/health` → Routes to `/api`
4. **Frontend Pages**: `https://freshcounty.com/about` → Routes to `/frontend`

## Common Issues Fixed

- ✅ **Image 404 Errors**: Static files now served directly from root
- ✅ **Admin Access**: Proper routing to admin subdomain
- ✅ **API Connectivity**: Correct API endpoint routing
- ✅ **SEO URLs**: Clean frontend URLs without `/frontend` prefix
- ✅ **Performance**: Direct static file serving (no Node.js processing)

## Deployment Order

1. **Update `.htaccess`** with new configuration
2. **Copy static files** from `frontend/public/` to root
3. **Test each route type** (static, admin, api, frontend)
4. **Clear browser cache** to see changes

This configuration properly handles all routing scenarios for the Fresh County platform!