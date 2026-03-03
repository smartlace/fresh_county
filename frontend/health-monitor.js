#!/usr/bin/env node
/**
 * Frontend Health Monitor and Auto-Restart Script
 * Monitors the frontend application and detects routing issues
 * Automatically restarts the Node.js app when problems are detected
 */

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const HEALTH_CHECK_URL = 'http://localhost:3000';
const CHECK_INTERVAL = 300000; // 5 minutes
const MAX_RETRIES = 3;
const LOG_FILE = path.join(__dirname, 'health-monitor.log');

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Check if response contains admin login (indicates routing issue)
function isAdminLoginResponse(html) {
  return html.includes('Admin Dashboard') || 
         html.includes('admin login') ||
         html.toLowerCase().includes('admin') && html.includes('sign in');
}

// Perform health check
async function healthCheck() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(HEALTH_CHECK_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode === 200) {
          // Check if we're getting admin login instead of homepage
          if (isAdminLoginResponse(data)) {
            log(`❌ ROUTING ISSUE DETECTED: Frontend returning admin login page`);
            resolve({ healthy: false, reason: 'routing_issue', responseTime });
          } else if (data.includes('FreshCounty') || data.includes('Fresh County')) {
            log(`✅ Health check passed (${responseTime}ms)`);
            resolve({ healthy: true, responseTime });
          } else {
            log(`⚠️ Unexpected response content (${responseTime}ms)`);
            resolve({ healthy: false, reason: 'unexpected_content', responseTime });
          }
        } else {
          log(`❌ Health check failed: HTTP ${res.statusCode} (${responseTime}ms)`);
          resolve({ healthy: false, reason: `http_${res.statusCode}`, responseTime });
        }
      });
    });
    
    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      log(`❌ Health check error: ${err.message} (${responseTime}ms)`);
      resolve({ healthy: false, reason: 'connection_error', responseTime });
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      log(`❌ Health check timeout (${responseTime}ms)`);
      resolve({ healthy: false, reason: 'timeout', responseTime });
    });
  });
}

// Restart the Node.js application
async function restartApp() {
  return new Promise((resolve) => {
    log('🔄 Attempting to restart Node.js application...');
    
    // Method 1: Try to restart via cPanel API (if available)
    // For Namecheap shared hosting, this usually requires manual restart
    // But we can try to touch the server.js file to trigger Passenger restart
    
    try {
      const serverFile = path.join(__dirname, 'server.js');
      const now = new Date();
      fs.utimesSync(serverFile, now, now);
      log('📝 Touched server.js file to trigger Passenger restart');
      
      // Wait a bit for restart to take effect
      setTimeout(() => {
        log('✅ Restart command completed');
        resolve(true);
      }, 10000);
      
    } catch (error) {
      log(`❌ Failed to restart application: ${error.message}`);
      resolve(false);
    }
  });
}

// Main monitoring loop
async function monitor() {
  log('🚀 Starting Frontend Health Monitor');
  log(`📊 Check interval: ${CHECK_INTERVAL / 1000} seconds`);
  log(`🎯 Monitoring URL: ${HEALTH_CHECK_URL}`);
  
  let consecutiveFailures = 0;
  
  while (true) {
    try {
      const result = await healthCheck();
      
      if (result.healthy) {
        consecutiveFailures = 0;
      } else {
        consecutiveFailures++;
        log(`⚠️ Consecutive failures: ${consecutiveFailures}/${MAX_RETRIES}`);
        
        if (consecutiveFailures >= MAX_RETRIES) {
          log('🚨 Maximum failures reached, triggering restart...');
          
          await restartApp();
          
          // Reset counter and wait longer before next check
          consecutiveFailures = 0;
          log('⏳ Waiting 2 minutes before next health check...');
          await new Promise(resolve => setTimeout(resolve, 120000));
          continue;
        }
      }
      
    } catch (error) {
      log(`❌ Monitor error: ${error.message}`);
    }
    
    // Wait for next check
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('🛑 Health monitor stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Health monitor terminated');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Start monitoring
monitor().catch((error) => {
  log(`💥 Monitor crashed: ${error.message}`);
  process.exit(1);
});