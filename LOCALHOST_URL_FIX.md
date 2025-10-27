# 🔧 Localhost URL Fix - Production Server Returning localhost:3001 URLs

## Problem Description

**Issue**: The live production server at `freshcounty.com` is returning API responses with hardcoded `localhost:3001` URLs, found in:
- `http://localhost:3001/api/shipping-zones`
- `http://localhost:3001/api/products/8b84d1ae-b726-4eaa-84a6-11f2154487be`

**Impact**:
- Images and resources fail to load on production
- API calls reference incorrect URLs
- Poor user experience due to broken links

## Root Cause Analysis

### 1. **Backend Environment Configuration**
The backend server on Namecheap is likely **not using the correct `.env.production` file** or has environment variables with localhost values.

**Expected Backend Environment**:
```env
API_BASE_URL=https://freshcounty.com/api
BACKEND_URL=https://freshcounty.com
NODE_ENV=production
```

**What's probably happening**:
- Backend is using development `.env` with `API_BASE_URL=http://localhost:3001/api`
- Or the `.env` file on the server hasn't been updated

### 2. **Database Contains Localhost URLs**
Product images and other resources in the database may have been saved with `localhost:3001` URLs during development/testing.

## Frontend Protection (Already in Place)

The frontend already has protective code to handle this:

**File**: `/frontend/src/lib/utils.ts` (lines 32-33)
```typescript
if (backendImageUrl.includes('localhost:3001')) {
  processedUrl = backendImageUrl.replace('http://localhost:3001', 'https://freshcounty.com')
}
```

**File**: `/frontend/src/lib/config.ts` (lines 17-26)
```typescript
BASE_URL: process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://freshcounty.com/api'
    : 'http://localhost:3001/api'),
```

✅ **Frontend is correctly configured** - it only uses localhost as a development fallback.

## Solution: Fix Backend Environment

### Step 1: Verify Backend Environment Variables

**SSH into your Namecheap server**:
```bash
ssh username@freshcounty.com
cd ~/public_html/api  # Or wherever your backend is located
```

**Check current environment**:
```bash
cat .env
```

**Verify these variables are set correctly**:
```env
API_BASE_URL=https://freshcounty.com/api
BACKEND_URL=https://freshcounty.com
NODE_ENV=production
FRONTEND_URL=https://freshcounty.com
ADMIN_URL=https://admin.freshcounty.com
```

### Step 2: Update Backend .env File

**If `.env` has localhost values, update it**:
```bash
cd ~/public_html/api
nano .env
```

**Replace any localhost references with**:
```env
API_BASE_URL=https://freshcounty.com/api
BACKEND_URL=https://freshcounty.com
```

**Save**: `Ctrl + X`, then `Y`, then `Enter`

### Step 3: Restart Backend Application

**Via cPanel**:
1. Go to **Node.js Selector** or **Setup Node.js App**
2. Find the **Backend API** application
3. Click **Restart**
4. Wait for restart confirmation

**Via SSH** (if using PM2):
```bash
pm2 restart backend
pm2 save
```

### Step 4: Clean Database URLs (Optional but Recommended)

If the database has saved localhost URLs, you need to update them:

**Connect to MySQL via cPanel phpMyAdmin**:
```sql
-- Update product image URLs
UPDATE products
SET image_url = REPLACE(image_url, 'http://localhost:3001', 'https://freshcounty.com')
WHERE image_url LIKE '%localhost:3001%';

-- Update category image URLs
UPDATE categories
SET image_url = REPLACE(image_url, 'http://localhost:3001', 'https://freshcounty.com')
WHERE image_url LIKE '%localhost:3001%';

-- Check if there are any other tables with URLs
-- Run this query to see which tables might need updating:
SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'your_database_name'
AND (COLUMN_NAME LIKE '%url%' OR COLUMN_NAME LIKE '%image%' OR COLUMN_NAME LIKE '%path%');
```

### Step 5: Verify Fix

**Test API endpoints**:
```bash
# Should return production URLs, NOT localhost
curl https://freshcounty.com/api/shipping-zones | grep -i "localhost"
# Should return nothing

curl https://freshcounty.com/api/products/8b84d1ae-b726-4eaa-84a6-11f2154487be | grep -i "localhost"
# Should return nothing
```

**Test in browser**:
1. Visit `https://freshcounty.com/categories`
2. Open Browser DevTools → Network tab
3. Check API responses - should show `https://freshcounty.com` URLs, not `localhost:3001`

## Prevention Best Practices

### 1. **Environment-Specific Configuration**

Always use environment-specific `.env` files:

**Development** (`backend/.env.local`):
```env
API_BASE_URL=http://localhost:3001/api
BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

**Production** (`backend/.env` on server):
```env
API_BASE_URL=https://freshcounty.com/api
BACKEND_URL=https://freshcounty.com
NODE_ENV=production
```

### 2. **Use Dynamic URL Generation**

**Backend should use environment variables for URLs**:

```javascript
// ❌ BAD - Hardcoded
const imageUrl = 'http://localhost:3001/uploads/image.jpg'

// ✅ GOOD - Dynamic
const imageUrl = `${process.env.BACKEND_URL}/uploads/image.jpg`
```

### 3. **Database Seeding**

When seeding the database for production:
```bash
# Set environment first
export NODE_ENV=production
export BACKEND_URL=https://freshcounty.com

# Then run seeder
node seed.js
```

### 4. **Pre-Deployment Checklist**

Before deploying to production:
- [ ] Verify `.env` on server has correct production URLs
- [ ] Check no hardcoded localhost in backend code
- [ ] Test API responses don't contain localhost
- [ ] Verify database records use production URLs
- [ ] Restart backend after environment changes

## Quick Reference

### Finding Hardcoded Localhost in Backend

```bash
cd ~/public_html/api
grep -r "localhost:3001" . --exclude-dir=node_modules
```

### Updating Environment on Server

```bash
# Edit environment
nano ~/public_html/api/.env

# Verify changes
grep "API_BASE_URL\|BACKEND_URL" ~/public_html/api/.env

# Restart backend
# (Use cPanel Node.js Selector or PM2)
```

### Testing After Fix

```bash
# Test API endpoint
curl -s https://freshcounty.com/api/products | jq '.[0].image_url'
# Should show: "https://freshcounty.com/uploads/..."

# Test shipping zones
curl -s https://freshcounty.com/api/shipping-zones
# Should NOT contain "localhost:3001"
```

## Troubleshooting

### Issue: Still seeing localhost URLs after restart

**Possible causes**:
1. Backend not using the updated `.env` file
2. Environment variables cached
3. Database still has old URLs

**Solutions**:
```bash
# 1. Check which env file backend is using
cd ~/public_html/api
node -e "console.log(require('dotenv').config())"

# 2. Kill and restart backend completely
pkill -f "node.*backend"
# Then restart via cPanel

# 3. Clear any caching
rm -rf ~/public_html/api/.next/cache  # If using Next.js for backend
```

### Issue: Some URLs fixed, others still showing localhost

**Solution**: Different tables/columns need updating. Run comprehensive database search:

```sql
-- Find all columns with localhost URLs
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COUNT(*) as count
FROM INFORMATION_SCHEMA.COLUMNS c
INNER JOIN (
    -- Add table queries here for each table
    SELECT 'products' as TABLE_NAME, 'image_url' as COLUMN_NAME, image_url as value FROM products WHERE image_url LIKE '%localhost%'
    UNION ALL
    SELECT 'categories', 'image_url', image_url FROM categories WHERE image_url LIKE '%localhost%'
) as data ON c.TABLE_NAME = data.TABLE_NAME AND c.COLUMN_NAME = data.COLUMN_NAME
GROUP BY TABLE_NAME, COLUMN_NAME;
```

### Issue: Frontend still shows broken images

**Check in browser DevTools**:
1. Network tab → Filter by "Img"
2. Look for failed requests
3. Check the URL being requested

**If frontend is requesting localhost**:
- Frontend `.env.production` might not be deployed
- Check browser is not caching old requests (hard refresh: Ctrl+Shift+R)

**If frontend requests production but backend returns localhost**:
- Backend environment not updated
- Database URLs need cleaning (see Step 4 above)

## Success Indicators

Fix is successful when:

✅ API responses contain `https://freshcounty.com` URLs only
✅ No `localhost:3001` found in API JSON responses
✅ Product images load correctly on frontend
✅ Shipping zones API returns production URLs
✅ Database queries show no localhost references
✅ Browser DevTools shows all resources loaded successfully

## Additional Notes

### Why Frontend Has Localhost Fallbacks

The frontend code has localhost fallbacks for **development only**:

```typescript
// This code runs on the browser
(typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://freshcounty.com/api'   // Production
  : 'http://localhost:3001/api')    // Development
```

When deployed to `freshcounty.com`:
- `window.location.hostname` = `"freshcounty.com"`
- Condition evaluates to `true`
- Uses production URL ✅

This is **correct and safe** - the frontend will always use production URLs when deployed.

### Backend Must Never Use Localhost in Production

The backend should **never** have localhost in:
- Environment variables (`.env`)
- Hardcoded strings
- Database records
- Configuration files

Always use:
- Environment variables from `.env`
- Dynamic URL construction
- Relative paths where appropriate

---

**Last Updated**: October 15, 2024
**Status**: Production Fix Required
**Priority**: High - Affects user experience
