# 🚨 API .htaccess Fix - Admin Dashboard Access Issue

## Problem
The API `.htaccess` configuration with wildcard CORS (`Access-Control-Allow-Origin "*"`) breaks admin dashboard authentication and creates security vulnerabilities.

## Root Cause
- Overly permissive CORS policy prevents credential-based authentication
- Wildcard origin blocks cookies and authorization headers
- Missing security headers leave API endpoints exposed

## ✅ IMMEDIATE FIX

### Replace `/public_html/api/.htaccess` with:

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

# Secure CORS headers for specific domains only
Header always set Access-Control-Allow-Origin "https://admin.freshcounty.com"
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

## Multi-Domain Support (if needed)

If you need both frontend and admin to access the API:

```apache
# Conditional CORS for multiple domains
<If "%{HTTP_HOST} == 'admin.freshcounty.com'">
    Header always set Access-Control-Allow-Origin "https://admin.freshcounty.com"
</If>
<ElseIf "%{HTTP_HOST} == 'freshcounty.com'">
    Header always set Access-Control-Allow-Origin "https://freshcounty.com"
</ElseIf>
<Else>
    Header always set Access-Control-Allow-Origin "null"
</Else>

Header always set Access-Control-Allow-Credentials "true"
Header always set Access-Control-Allow-Headers "origin, x-requested-with, content-type, authorization, x-csrftoken"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
```

## Development Configuration

For local development, create `/public_html/api/.htaccess.dev`:

```apache
# Development CORS (less secure, development only)
Header always set Access-Control-Allow-Origin "http://localhost:3000"
Header always set Access-Control-Allow-Credentials "true"
Header always set Access-Control-Allow-Headers "origin, x-requested-with, content-type, authorization"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
```

## Testing the Fix

1. **Update .htaccess file** on the server
2. **Clear browser cache** completely
3. **Test admin dashboard login**
4. **Check browser console** for CORS errors
5. **Verify API endpoints** work correctly

## Expected Results

- ✅ Admin dashboard login works
- ✅ No CORS policy errors in browser console
- ✅ API requests succeed with proper authentication
- ✅ Secure CORS policy (no wildcard origins)
- ✅ Proper security headers applied

## Security Benefits

- **Specific Origin**: Only allows requests from your domain
- **Credential Support**: Enables cookies and auth headers
- **Security Headers**: Protects against XSS and other attacks
- **File Protection**: Sensitive files (.env, logs) are protected

---

**⚠️ Important**: Always use specific domains instead of wildcards (`*`) for production CORS configuration!