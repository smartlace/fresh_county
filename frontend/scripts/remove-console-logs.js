#!/usr/bin/env node

/**
 * Script to remove console.log statements from production builds
 * This runs during build process to ensure no debug logs in production
 */

const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '..', 'src')

function removeConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Replace console.log but keep console.error for important error tracking
  const cleaned = content
    .replace(/console\.log\([^)]*\);?\n?/g, '') // Remove console.log
    .replace(/console\.info\([^)]*\);?\n?/g, '') // Remove console.info  
    .replace(/console\.debug\([^)]*\);?\n?/g, '') // Remove console.debug
    .replace(/console\.warn\([^)]*\);?\n?/g, '') // Remove console.warn in production
  
  if (cleaned !== content) {
    fs.writeFileSync(filePath, cleaned)
    console.log(`Cleaned console statements from: ${filePath}`)
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      processDirectory(fullPath)
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
      removeConsoleLogs(fullPath)
    }
  }
}

// Only run in production builds
if (process.env.NODE_ENV === 'production') {
  console.log('Removing console statements for production build...')
  processDirectory(srcDir)
  console.log('Console cleanup complete.')
} else {
  console.log('Skipping console cleanup (not production build)')
}