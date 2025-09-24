# 🚨 URGENT: Fix Admin Dashboard "Failed to Fetch" Error

## Issue
Admin dashboard shows "Failed to Fetch" on login due to incorrect CORS configuration.

## ⚡ IMMEDIATE FIX

Replace the entire content of `/public_html/api/.htaccess` with:

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

## Steps:
1. **Log into cPanel File Manager**
2. **Navigate to `/public_html/api/`**
3. **Edit `.htaccess` file**
4. **Replace entire content** with the code above
5. **Save the file**
6. **Clear browser cache completely**
7. **Try admin login again**

## What This Fixes:
- ✅ Allows both `admin.freshcounty.com` and `freshcounty.com` to access API
- ✅ Enables credential-based authentication for admin dashboard
- ✅ Maintains security with domain-specific CORS
- ✅ Handles preflight OPTIONS requests properly

## Test After Fix:
1. Open browser developer tools (F12)
2. Go to admin dashboard login page
3. Check Console tab - should be no CORS errors
4. Try logging in - should work without "Failed to Fetch"

**This configuration supports both the frontend website and admin dashboard!**