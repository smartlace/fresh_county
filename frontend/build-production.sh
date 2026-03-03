#!/bin/bash

# Fresh County Frontend Production Build Script
echo "🏗️  Building Fresh County Frontend for Production..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with production environment variables."
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

# Temporarily backup .env.local to ensure only production env is used
echo "📦 Preparing environment..."
if [ -f ".env.local" ]; then
    mv .env.local .env.local.temp
    echo "   Backed up .env.local temporarily"
fi

# Set production environment
export NODE_ENV=production

# Build the application
echo "🔨 Building application..."
npm run build

# Store build result
BUILD_RESULT=$?

# Restore .env.local
if [ -f ".env.local.temp" ]; then
    mv .env.local.temp .env.local
    echo "📦 Restored .env.local for development"
fi

if [ $BUILD_RESULT -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Build artifacts created in .next/ directory"
    echo "🚀 Ready for deployment to production server"
    echo ""
    echo "Deployment instructions:"
    echo "1. Upload .next/ directory to your web server"
    echo "2. Upload .env.production file (rename to .env.local on server)"
    echo "3. Install dependencies: npm install --production"
    echo "4. Start the server: npm start or pm2 start server.js"
else
    echo "❌ Build failed!"
    exit 1
fi