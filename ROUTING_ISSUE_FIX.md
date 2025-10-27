# 🔧 Routing Issue Fix - Frontend Serving Admin Login Page

## Problem Description

**Issue**: After running for a while on Namecheap shared hosting, `freshcounty.com` starts displaying the admin login page from `admin.freshcounty.com/login`. Restarting temporarily fixes it but the issue recurs.

**Impact**:
- Customers see admin login instead of the store homepage
- Poor user experience and potential security confusion
- Requires manual intervention to restart the app

## Root Cause Analysis

After thorough investigation, the root cause is **route collision between frontend and admin applications**:

### 1. **Shared Server Environment**
- Both frontend (`freshcounty.com`) and admin (`admin.freshcounty.com`) run on the same Namecheap server
- Both use Next.js and similar routing structures
- Over time, routing state can become corrupted or confused

### 2. **Port/Process Confusion**
- If processes restart or memory leaks occur, route handlers can get mixed up
- The frontend server might start serving admin routes due to:
  - Memory corruption
  - Passenger worker process issues
  - Next.js router cache confusion
  - Process state leakage

### 3. **Missing Route Protection**
- Original `server.js` only blocked `/admin` routes
- Did not block `/login` which is the admin login page
- Many other admin-specific routes were unprotected:
  - `/dashboard`, `/users`, `/products`, `/orders`, etc.

### 4. **Cache Issues**
- Browser and server caching without proper cache-control headers
- Next.js internal routing cache persisting incorrect routes
- No cache busting for route redirects

## Solution Implementation

### Phase 1: Enhanced Frontend Server Protection

**File**: `/frontend/server.js`

**Changes Made**:

1. **Expanded Blocked Paths List**
   ```javascript
   const blockedPaths = [
     '/admin', '/login', '/dashboard', '/settings', '/users',
     '/products', '/orders', '/analytics', '/categories',
     '/coupons', '/newsletters', '/blog', '/shipping',
     '/website-pages', '/profile'
   ]
   ```

2. **Improved Path Matching**
   ```javascript
   const isBlockedPath = blockedPaths.some(path => {
     return req.url === path ||
            req.url.startsWith(path + '/') ||
            req.url.startsWith(path + '?')
   })
   ```

3. **Enhanced Cache Control**
   ```javascript
   res.writeHead(302, {
     'Location': 'https://admin.freshcounty.com',
     'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
     'Pragma': 'no-cache',
     'Expires': '0'
   })
   ```

4. **Better Logging**
   ```javascript
   log(`🚨 BLOCKED admin/login route request: ${req.url}`, 'warn')
   ```

### Phase 2: Enhanced Admin Server Protection

**File**: `/admin-react/server.js`

**Changes Made**:

1. **Block Frontend-Only Routes**
   ```javascript
   const frontendOnlyPaths = [
     '/cart', '/checkout', '/payment', '/auth', '/about',
     '/faq', '/maas', '/maas-order', '/detox', '/catering',
     '/fidelity', '/under-construction', '/privacy-policy',
     '/terms', '/cancellation-policy'
   ]
   ```

2. **Health Check Endpoint**
   ```javascript
   if (req.url === '/health' || req.url === '/_health') {
     return handleHealthCheck(req, res)
   }
   ```

3. **Memory Monitoring**
   ```javascript
   setInterval(() => {
     const memUsedMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
     if (memUsedMB > 150) {
       log(`Memory usage: ${memUsedMB}MB`)
     }
   }, 60000)
   ```

4. **Enhanced Error Handling**
   - Uncaught exception handlers
   - Unhandled rejection handlers
   - Graceful shutdown on SIGTERM/SIGINT

## Deployment Steps

### Step 1: Backup Current Files
```bash
# SSH into your Namecheap server
ssh username@freshcounty.com

# Backup current server files
cd ~/public_html
cp frontend/server.js frontend/server.js.backup
cp admin/server.js admin/server.js.backup
```

### Step 2: Upload New Server Files

**Upload Enhanced Frontend Server**:
1. Upload updated `/frontend/server.js` to `/public_html/frontend/server.js`
2. Verify file permissions: `chmod 644 server.js`

**Upload Enhanced Admin Server**:
1. Upload updated `/admin-react/server.js` to `/public_html/admin/server.js`
2. Verify file permissions: `chmod 644 server.js`

### Step 3: Restart Applications

**Via cPanel**:
1. Go to **Node.js Selector** or **Setup Node.js App**
2. Find **Frontend Application**
   - Click **Restart**
   - Wait for restart confirmation
3. Find **Admin Application**
   - Click **Restart**
   - Wait for restart confirmation

**Via SSH** (if you have PM2 or similar):
```bash
pm2 restart frontend
pm2 restart admin
pm2 save
```

### Step 4: Verify Fix

**Test Frontend**:
```bash
# Should show homepage, NOT login page
curl -I https://freshcounty.com

# Should redirect to admin.freshcounty.com
curl -I https://freshcounty.com/login

# Health check
curl https://freshcounty.com/health
```

**Expected Response for /login**:
```
HTTP/2 302
location: https://admin.freshcounty.com
cache-control: no-store, no-cache, must-revalidate, proxy-revalidate
```

**Test Admin**:
```bash
# Should show admin login
curl -I https://admin.freshcounty.com/login

# Should redirect to freshcounty.com
curl -I https://admin.freshcounty.com/cart

# Health check
curl https://admin.freshcounty.com/health
```

### Step 5: Browser Testing

1. **Clear Browser Cache**:
   - Chrome/Edge: `Ctrl+Shift+Delete`
   - Firefox: `Ctrl+Shift+Delete`
   - Safari: `Cmd+Option+E`

2. **Test Frontend Routes**:
   - Visit `https://freshcounty.com` → Should show homepage
   - Visit `https://freshcounty.com/login` → Should redirect to admin
   - Visit `https://freshcounty.com/dashboard` → Should redirect to admin
   - Visit `https://freshcounty.com/products` → Should redirect to admin

3. **Test Admin Routes**:
   - Visit `https://admin.freshcounty.com` → Should redirect to /login
   - Visit `https://admin.freshcounty.com/login` → Should show admin login
   - Visit `https://admin.freshcounty.com/cart` → Should redirect to frontend

## Monitoring and Maintenance

### Health Checks

**Frontend Health**:
```bash
curl https://freshcounty.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "frontend",
  "timestamp": "2024-10-15T...",
  "uptime": 3600,
  "memory": 85,
  "pid": 12345,
  "environment": "production"
}
```

**Admin Health**:
```bash
curl https://admin.freshcounty.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "admin",
  "timestamp": "2024-10-15T...",
  "uptime": 3600,
  "memory": 90,
  "pid": 12346,
  "environment": "production"
}
```

### Log Monitoring

**Check Application Logs** (via cPanel):
1. Go to **Node.js Selector**
2. Click **View Logs** for each app
3. Look for these log entries:
   - `✅ Frontend server ready on...` or `✅ Admin server ready on...`
   - `🚨 BLOCKED admin/login route request...` (indicates fix is working)
   - `⚠️ High memory usage detected...` (may indicate need for restart)

**Via SSH**:
```bash
# Frontend logs
tail -f ~/logs/frontend.log

# Admin logs
tail -f ~/logs/admin.log

# Look for blocking messages
grep "BLOCKED" ~/logs/frontend.log
grep "BLOCKED" ~/logs/admin.log
```

### Proactive Monitoring (Optional)

**Setup Cron Job for Health Checks**:
```bash
# Add to cPanel Cron Jobs
# Check every 15 minutes and restart if unhealthy
*/15 * * * * /home/username/check-health.sh >/dev/null 2>&1
```

**Create `/home/username/check-health.sh`**:
```bash
#!/bin/bash

# Check frontend health
FRONTEND_HEALTH=$(curl -s https://freshcounty.com/health | grep -o '"status":"healthy"')
if [ -z "$FRONTEND_HEALTH" ]; then
  echo "[$(date)] Frontend unhealthy, restarting..." >> /home/username/health-check.log
  # Restart frontend via cPanel API or PM2
fi

# Check admin health
ADMIN_HEALTH=$(curl -s https://admin.freshcounty.com/health | grep -o '"status":"healthy"')
if [ -z "$ADMIN_HEALTH" ]; then
  echo "[$(date)] Admin unhealthy, restarting..." >> /home/username/health-check.log
  # Restart admin via cPanel API or PM2
fi
```

## Troubleshooting

### Issue Still Persists After Fix

**1. Clear All Caches**:
```bash
# Clear Next.js cache
cd ~/public_html/frontend
rm -rf .next/cache

cd ~/public_html/admin
rm -rf .next/cache

# Restart applications
```

**2. Check Process IDs**:
```bash
# Ensure only one instance is running
ps aux | grep "node.*frontend"
ps aux | grep "node.*admin"

# Kill duplicate processes if found
kill -9 [PID]
```

**3. Check Memory Usage**:
```bash
# Via health endpoint
curl https://freshcounty.com/health | jq '.memory'
curl https://admin.freshcounty.com/health | jq '.memory'

# If memory > 200MB, restart is recommended
```

**4. Verify Server Files**:
```bash
# Check if new server.js is being used
cd ~/public_html/frontend
head -20 server.js | grep "CRITICAL: Prevent admin routing"

cd ~/public_html/admin
head -20 server.js | grep "Enhanced Admin Server"
```

### Routes Not Blocking Properly

**Check Logs**:
```bash
# Should see blocking messages
tail -100 ~/logs/frontend.log | grep "BLOCKED"
```

**Test Specific Route**:
```bash
curl -v https://freshcounty.com/login 2>&1 | grep -i "location"
# Should show: location: https://admin.freshcounty.com
```

**Verify Headers**:
```bash
curl -I https://freshcounty.com/login
# Should include: cache-control: no-store, no-cache
```

### High Memory Usage

**Symptoms**:
- Health endpoint shows memory > 200MB
- Application becomes slow
- Routing issues reappear

**Solutions**:
1. **Immediate**: Restart the application
2. **Short-term**: Schedule regular restarts (every 24 hours)
3. **Long-term**: Investigate memory leaks in application code

**Schedule Regular Restarts** (cron job):
```bash
# Restart frontend daily at 3 AM
0 3 * * * /path/to/restart-frontend.sh

# Restart admin daily at 3:30 AM
30 3 * * * /path/to/restart-admin.sh
```

## Prevention Best Practices

### 1. Regular Restarts
- Schedule daily or weekly restarts during low-traffic periods
- Prevents memory leaks from accumulating
- Clears routing cache and state

### 2. Monitor Health Endpoints
- Set up automated monitoring (Pingdom, UptimeRobot, etc.)
- Alert when health status changes or memory spikes
- Track uptime and response times

### 3. Keep Logs Clean
- Rotate logs regularly to prevent disk space issues
- Archive old logs for analysis
- Monitor for unusual patterns

### 4. Update Dependencies
- Keep Next.js and Node.js up to date
- Security patches often include memory management improvements
- Test updates in development first

### 5. Resource Monitoring
- Watch memory usage trends
- Monitor CPU usage
- Track disk space
- Set alerts for resource thresholds

## Success Indicators

The fix is working correctly when:

✅ `freshcounty.com` always shows the customer homepage
✅ `freshcounty.com/login` redirects to `admin.freshcounty.com`
✅ All admin routes redirect from frontend to admin domain
✅ All frontend routes redirect from admin to frontend domain
✅ Health endpoints return `"status": "healthy"`
✅ Logs show blocking messages for cross-domain requests
✅ No admin login page appears on frontend domain
✅ Memory usage stays below 200MB

## Additional Resources

- **Previous Fix**: See `/web/ROUTING_FIX_DEPLOYMENT.md` for context
- **Deployment Guide**: See `/web/NAMECHEAP_DEPLOYMENT_GUIDE.md`
- **Server Configuration**: Check `server.js` files for inline comments

## Support

If issues persist after applying this fix:

1. Check all deployment steps were completed
2. Verify new `server.js` files are in place
3. Confirm applications were restarted
4. Review logs for error patterns
5. Check Namecheap support for Passenger/Node.js issues
6. Consider upgrading hosting plan if resource limits are being hit

---

**Last Updated**: October 15, 2024
**Fix Version**: 2.0 - Enhanced Route Protection
**Status**: Production Ready
