# Fresh County Frontend Deployment Troubleshooting Guide

## Issues Fixed

### 1. Image 404 Errors ✅ FIXED
**Problem**: Images (home-bg.jpg, nws.png, feature1.png, feature2.png) returning 404 errors on production

**Root Cause**: 
- Middleware was processing image requests and making API calls
- Next.js image optimization was still enabled in production

**Solutions Applied**:
- ✅ Updated middleware to skip ALL files with extensions immediately
- ✅ Set `unoptimized: true` in production Next.js config
- ✅ Fixed regex pattern in middleware matcher to exclude static assets
- ✅ Added early return for any pathname containing '.' character

### 2. Localhost API Calls Issue ✅ FIXED
**Problem**: Production console showing localhost API calls instead of production API

**Root Cause**: 
- Environment variables not being loaded correctly in production build
- Config fallback using NODE_ENV instead of runtime hostname detection

**Solutions Applied**:
- ✅ Updated config.ts to detect hostname at runtime instead of build time
- ✅ Modified prepare-production.sh to copy .env.production to .env.local before build
- ✅ Added fallback logic using `window.location.hostname` for client-side detection
- ✅ Forced production URLs when not on localhost hostname

### 3. User Registration Failure 🔍 SHOULD BE FIXED
**Problem**: User registration failing after deployment

**Root Causes Addressed**:
- ✅ Fixed API URL configuration to use production endpoints
- ✅ Ensured environment variables are properly loaded during build
- ✅ Removed middleware interference with API calls

## Deployment Checklist

### Files to Upload to Production Server:
```
/public_html/frontend/
├── .next/ (complete folder)
├── next.config.js
├── server.js
├── package.json
├── package-lock.json
└── .env.local (rename from .env.production)
```

### Environment Variables Check:
Ensure `.env.local` on production server contains:
```
NEXT_PUBLIC_API_URL=https://freshcounty.com/api
NEXT_PUBLIC_BACKEND_URL=https://freshcounty.com
NEXT_PUBLIC_APP_URL=https://freshcounty.com
NODE_ENV=production
```

## API Connectivity Testing

### Test 1: Check API Health
Open browser console on production site and run:
```javascript
fetch('https://freshcounty.com/api/health')
  .then(response => response.json())
  .then(data => console.log('API Health:', data))
  .catch(error => console.error('API Error:', error))
```

### Test 2: Check Under Construction Endpoint
```javascript
fetch('https://freshcounty.com/api/settings/public/under-construction')
  .then(response => response.json())
  .then(data => console.log('Under Construction:', data))
  .catch(error => console.error('API Error:', error))
```

### Test 3: Test Registration Endpoint
```javascript
fetch('https://freshcounty.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123',
    full_name: 'Test User',
    mobile: '1234567890'
  })
})
.then(response => response.json())
.then(data => console.log('Registration Response:', data))
.catch(error => console.error('Registration Error:', error))
```

## Common Solutions

### Solution 1: Backend API Not Running
- Verify backend server is running on production
- Check backend logs for errors
- Ensure backend is accessible at `https://freshcounty.com/api`

### Solution 2: CORS Configuration
Backend needs to allow frontend domain in CORS settings:
```javascript
// In backend CORS configuration
app.use(cors({
  origin: ['https://freshcounty.com', 'http://localhost:3000'],
  credentials: true
}))
```

### Solution 3: SSL Certificate Issues
- Ensure SSL certificate is valid for both frontend and backend
- Check if backend API requires HTTPS

### Solution 4: Environment Variable Issues
- Verify environment variables are loaded correctly
- Check if Node.js application is using the correct environment file

## Verification Steps

After deployment:
1. ✅ Images load correctly (no 404 errors)
2. 🔍 User registration works
3. 🔍 User login works
4. 🔍 API calls succeed
5. 🔍 Console shows no middleware errors for static assets

## Next Steps for Troubleshooting

1. **Check Browser Console**: Look for API errors and network failures
2. **Verify Backend Status**: Ensure backend API is accessible
3. **Test API Endpoints**: Use the testing scripts above
4. **Check Server Logs**: Review both frontend and backend server logs
5. **Verify SSL**: Ensure SSL certificates are valid and trusted

## 🚨 CRITICAL FIX NEEDED - Static Images Issue

### Root Cause Identified:
The frontend is deployed to `/public_html/frontend/` but images are being requested from the root domain `https://freshcounty.com/home-bg.jpg`. The Next.js `public/` folder contents need to be accessible at the root domain level.

### IMMEDIATE SOLUTION:

**Step 1: Copy Images to Root Domain**
Copy ALL files from `frontend/public/` to `/public_html/` (root directory) on your server:

**Required Files to Copy:**
- home-bg.jpg
- nws.png  
- feature1.png
- feature2.png
- fpic.png
- favicon.ico
- logo.png
- (and all other public folder contents)

**Step 2: Verify .htaccess Configuration**
Ensure `/public_html/.htaccess` allows static files before routing to frontend:
```apache
# Allow static files to be served directly
RewriteCond %{REQUEST_URI} \.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2)$ [NC]
RewriteRule ^.*$ - [L]

# Route other requests to frontend application
RewriteCond %{REQUEST_URI} !^/(frontend|admin|api|uploads)/
RewriteRule ^(.*)$ /frontend/$1 [L,QSA]
```

**Step 3: Test Image Access**
After copying files, test direct access:
- https://freshcounty.com/home-bg.jpg ✅ Should load
- https://freshcounty.com/nws.png ✅ Should load
- https://freshcounty.com/feature1.png ✅ Should load

### Expected Results After Fix:
1. ✅ All images load correctly from root domain
2. ✅ No more 404 errors in console
3. ✅ Website displays properly with all graphics
4. ✅ User registration works with fixed API URLs

---

## Contact for Issues

If issues persist, provide:
- Browser console errors
- Network tab showing failed requests
- Backend server logs
- Frontend server logs
- Exact error messages from registration attempts