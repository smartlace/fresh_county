# 🚨 UPLOAD IMAGES FIX - Backend & Frontend Updates

## Issues Fixed

### ✅ Backend Static File Serving
**Problem**: Backend was serving uploads from wrong directory
**Fix**: Updated `src/index.ts` to use `UPLOAD_PATH` environment variable

### ✅ Frontend Proxy-Image Removal  
**Problem**: Frontend was routing all images through proxy-image API causing 404s
**Fix**: Updated `getImageUrl()` function to serve images directly from backend

---

## Deployment Instructions

### 1. Backend Deployment (REQUIRED)

**Upload to `/public_html/api/`:**
- ✅ New `dist/` folder (contains fixed static file serving)
- ✅ Updated `.env` file with correct `UPLOAD_PATH`

**Backend Environment Variable (verify in .env):**
```env
UPLOAD_PATH=/home/fresyzgq/public_html/uploads
```

**Restart Backend:**
- Go to cPanel → Node.js Selector → API Application → Restart

### 2. Frontend Deployment (REQUIRED)

**Upload to `/public_html/frontend/`:**
- ✅ New `.next/` folder (contains updated image handling)
- ✅ Updated files (see prepare-production.sh output)

**Restart Frontend:**
- Go to cPanel → Node.js Selector → Frontend Application → Restart

### 3. Verify Upload Directory Structure

**Ensure this structure exists on server:**
```
/public_html/uploads/
├── categories/
│   └── category-1758564804976-671429720-Screenshot_2025-09-22_at_6.55.39___pm.png
├── products/
│   └── product-1758568218367-113674018-Screenshot_2025-09-22_at_6.55.39___pm.png
└── blog/
```

---

## Expected Results After Deployment

### ✅ Category Images Work
- Direct URL: `https://freshcounty.com/uploads/categories/category-xxx.png`
- No more proxy-image 404 errors

### ✅ Product Images Work  
- Direct URL: `https://freshcounty.com/uploads/products/product-xxx.png`
- No more proxy-image 404 errors

### ✅ Performance Improved
- Images served directly from backend (no proxy overhead)
- Faster loading times
- Reduced server requests

---

## Testing URLs

After deployment, test these directly in browser:

**Category Images:**
```
https://freshcounty.com/uploads/categories/category-1758564804976-671429720-Screenshot_2025-09-22_at_6.55.39___pm.png
```

**Product Images:**
```
https://freshcounty.com/uploads/products/product-1758568218367-113674018-Screenshot_2025-09-22_at_6.55.39___pm.png
```

**Backend Health:**
```
https://freshcounty.com/api/health
```

---

## Files Changed

### Backend Files:
- ✅ `src/index.ts` - Fixed static file serving path
- ✅ `dist/index.js` - Compiled version with fix

### Frontend Files:
- ✅ `src/lib/utils.ts` - Updated `getImageUrl()` function
- ✅ `.next/` - Rebuilt with changes

---

## Troubleshooting

**If images still don't work:**

1. **Check Upload Directory Permissions:**
   ```bash
   chmod 755 /public_html/uploads
   chmod 755 /public_html/uploads/categories
   chmod 755 /public_html/uploads/products
   ```

2. **Verify Backend Environment:**
   - Confirm `UPLOAD_PATH=/home/fresyzgq/public_html/uploads` in .env
   - Restart backend application

3. **Check File Existence:**
   - Confirm files exist in upload directories
   - Verify file permissions (644 for files)

4. **Backend Logs:**
   - Check Node.js application logs in cPanel
   - Look for static file serving errors

---

## 🎉 Both Backend and Frontend Must Be Redeployed for This Fix!