# 🔧 Frontend Routing Issue - Permanent Fix Guide

## Problem Description
The frontend at `freshcounty.com` intermittently redirects to admin login instead of showing the customer homepage. Restarting the Node.js application temporarily fixes it, but the issue returns.

## Root Cause Analysis
- **Node.js App State Corruption**: The frontend application routing gets confused over time
- **Passenger Worker Issues**: CloudLinux Passenger worker processes become stale
- **Memory/Session Leaks**: Gradual memory leaks causing routing confusion
- **Missing Route Protection**: No explicit protection against admin route confusion

## 🛠️ Solution Components

### 1. Enhanced Server.js (Primary Fix)
The updated `server.js` includes:
- **Route Protection**: Explicit blocking of admin routes with redirect to admin.freshcounty.com
- **Health Monitoring**: Built-in health check endpoints
- **Memory Monitoring**: Automatic memory usage tracking and warnings
- **Enhanced Logging**: Detailed logs with timestamps for debugging
- **Error Handling**: Better error responses and graceful degradation

### 2. Health Monitor Script
- **Automatic Detection**: Monitors for routing issues every 5 minutes
- **Auto-Restart**: Automatically restarts the app when issues are detected
- **Rate Limiting**: Prevents restart loops with intelligent retry logic

### 3. Auto-Restart Cron Job
- **Proactive Monitoring**: Can be run via cron job every 15 minutes
- **Restart Limits**: Prevents excessive restarts (max 3 per hour)
- **Logging**: Comprehensive logging for troubleshooting

## 📋 Deployment Steps

### Step 1: Upload Enhanced Files
Upload these files to your Namecheap hosting:

1. **Enhanced server.js**
   ```bash
   # Upload to: /public_html/frontend/server.js
   # This replaces the existing server.js with enhanced version
   ```

2. **Health Monitor** (Optional)
   ```bash
   # Upload to: /public_html/frontend/health-monitor.js
   # This can run as a background process for monitoring
   ```

3. **Auto-Restart Script**
   ```bash
   # Upload to: /public_html/frontend/auto-restart.sh
   # Make executable: chmod +x auto-restart.sh
   ```

4. **Configuration File**
   ```bash
   # Upload to: /public_html/frontend/anti-redirect.config.js
   ```

### Step 2: Restart Frontend Application
1. Go to cPanel → **Node.js Selector**
2. Find your frontend application
3. Click **Restart** to load the new server.js

### Step 3: Test the Fix
1. Visit `https://freshcounty.com` - should show homepage
2. Visit `https://freshcounty.com/admin` - should redirect to admin.freshcounty.com
3. Check health endpoint: `https://freshcounty.com/health`

### Step 4: Setup Monitoring (Recommended)

#### Option A: Cron Job Monitoring
Add to your cPanel cron jobs:
```bash
# Run every 15 minutes
*/15 * * * * /home/[username]/public_html/frontend/auto-restart.sh >/dev/null 2>&1
```

#### Option B: Background Process (Advanced)
If your hosting supports background processes:
```bash
# Run health monitor in background
nohup node /home/[username]/public_html/frontend/health-monitor.js &
```

## 🔍 Monitoring and Logs

### Health Check Endpoint
Visit `https://freshcounty.com/health` to check application status:
```json
{
  "status": "healthy",
  "service": "frontend",
  "timestamp": "2024-01-XX...",
  "uptime": 3600,
  "memory": 85,
  "pid": 12345,
  "environment": "production"
}
```

### Log Files
Check these logs for monitoring:
- `/home/[username]/frontend-monitor.log` - Auto-restart script logs
- `/home/[username]/public_html/frontend/health-monitor.log` - Health monitor logs
- cPanel Node.js logs - Application server logs

## 🚨 Emergency Procedures

### If Issue Persists
1. **Manual Restart**: cPanel → Node.js Selector → Restart frontend app
2. **Check Logs**: Review log files for error patterns
3. **Memory Check**: Visit `/health` endpoint to check memory usage
4. **Full Restart**: Restart all Node.js applications (frontend, admin, backend)

### Escalation Steps
If manual restart doesn't work:
1. Check if `.next` folder is corrupted - re-upload if needed
2. Verify environment variables in cPanel
3. Check for file permission issues
4. Contact hosting support if Passenger has issues

## 📊 Key Improvements

### Immediate Benefits
- ✅ **Route Protection**: Admin routes are explicitly blocked and redirected
- ✅ **Health Monitoring**: Built-in endpoints for monitoring application health
- ✅ **Auto-Recovery**: Automatic restart when routing issues are detected
- ✅ **Better Logging**: Detailed logs with timestamps for easier debugging

### Long-term Benefits
- ✅ **Proactive Monitoring**: Issues detected before users encounter them
- ✅ **Reduced Downtime**: Automatic recovery reduces manual intervention
- ✅ **Better Diagnostics**: Enhanced logging helps identify root causes
- ✅ **Memory Management**: Memory monitoring prevents memory-related issues

## 🔧 Troubleshooting

### Common Issues After Deployment

**1. Health endpoint returns 404**
- Ensure new server.js is uploaded and app is restarted
- Check if Node.js application is running

**2. Auto-restart script fails**
- Verify script has execute permissions: `chmod +x auto-restart.sh`
- Check if curl is available on your hosting

**3. Logs not being created**
- Verify write permissions for log files
- Check if directory exists for log files

**4. Cron job not working**
- Use full paths in cron jobs
- Check cPanel cron job syntax
- Verify script permissions

### Testing the Fix
```bash
# Test health endpoint
curl https://freshcounty.com/health

# Test admin route blocking
curl -I https://freshcounty.com/admin
# Should return 302 redirect to admin.freshcounty.com

# Test homepage
curl https://freshcounty.com | grep -i "freshcounty"
# Should return content with FreshCounty branding
```

## 📈 Success Metrics

You'll know the fix is working when:
- ✅ `freshcounty.com` consistently shows the customer homepage
- ✅ `freshcounty.com/admin` redirects to `admin.freshcounty.com`
- ✅ Health endpoint returns "healthy" status
- ✅ No more intermittent admin login appearances
- ✅ Automatic restarts happen when needed (visible in logs)

This comprehensive fix addresses the root cause and provides both reactive and proactive solutions to prevent the routing issue from recurring.