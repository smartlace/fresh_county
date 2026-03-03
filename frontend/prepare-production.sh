#!/bin/bash

# Frontend Production Deployment Preparation Script
# Run this before uploading to shared hosting

echo "🚀 Preparing frontend for production deployment..."

# Step 1: Use production config
echo "📝 Setting up production Next.js configuration..."
cp next.config.production.js next.config.js

# Step 1.5: Ensure production environment
echo "🔧 Setting up production environment..."
export NODE_ENV=production
if [ -f ".env.production" ]; then
    cp .env.production .env.local
    echo "   ✅ Production environment variables copied"
else
    echo "   ⚠️  .env.production not found"
fi

# Step 2: Build the application
echo "🏗️ Building frontend application..."
npm run build

# Step 3: Verify build
if [ -d ".next" ]; then
    echo "✅ Build successful - .next directory created"
    echo "📊 Build summary:"
    ls -la .next/ | grep -E "(server|static|app-build)"
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

# Step 4: Check required files
echo "📋 Checking required files for deployment..."
required_files=("next.config.js" "server.js" "package.json")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Ready"
    else
        echo "❌ $file - Missing"
        exit 1
    fi
done

echo ""
echo "🎉 Frontend is ready for deployment!"
echo ""
echo "📦 Upload these files/folders to production server:"
echo ""
echo "🔹 To /public_html/frontend/:"
echo "   ✅ .next/ (complete folder)"
echo "   ✅ next.config.js"
echo "   ✅ server.js"
echo "   ✅ package.json"
echo "   ✅ package-lock.json"
echo "   ✅ .env.local (with production values)"
echo ""
echo "🔹 To /public_html/ (root domain - for static images):"
echo "   ✅ All files from public/ folder (home-bg.jpg, nws.png, etc.)"
echo ""
echo "⚙️ Then restart your Node.js application in cPanel"
echo ""
echo "📋 IMPORTANT: Copy all files from 'public/' folder to '/public_html/'"
echo "   This makes images accessible at https://freshcounty.com/home-bg.jpg"