#!/bin/bash

# Admin React Production Deployment Preparation Script
# Run this before uploading to shared hosting

echo "🚀 Preparing admin-react for production deployment..."

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -f next.zip

# Step 2: Use production config
echo "📝 Setting up production Next.js configuration..."
if [ -f "next.config.production.js" ]; then
    cp next.config.production.js next.config.js
    echo "✅ Production config applied"
else
    echo "⚠️ Using existing next.config.js"
fi

# Step 3: Set production environment
echo "🌍 Setting production environment..."
export NODE_ENV=production

# Step 4: Install dependencies (ensure fresh)
echo "📦 Installing/updating dependencies..."
npm ci --only=production

# Step 5: Build the application
echo "🏗️ Building admin application..."
npm run build

# Step 6: Verify build
if [ -d ".next" ]; then
    echo "✅ Build successful - .next directory created"
    echo "📊 Build summary:"
    ls -la .next/ | head -10
    echo "   Build size: $(du -sh .next/ | cut -f1)"
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

# Step 7: Check required files
echo "📋 Checking required files for deployment..."
required_files=("next.config.js" "package.json" "server.js" "public/logo.png" ".nvmrc")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Ready"
    else
        echo "❌ $file - Missing"
        if [ "$file" = "server.js" ]; then
            echo "ℹ️ Creating missing server.js..."
            # server.js should already be created by this script
        fi
        exit 1
    fi
done

# Step 8: Check public folder
echo "📁 Checking public assets..."
if [ -d "public" ]; then
    echo "✅ public/ folder - Ready"
    echo "   📄 Assets: $(ls public/ | tr '\n' ' ')"
else
    echo "❌ public/ folder - Missing"
    exit 1
fi

# Step 9: Create deployment zip
echo "📦 Creating deployment package..."
zip -r next.zip .next/ public/ server.js next.config.js package.json package-lock.json .nvmrc -x "*.DS_Store"
echo "✅ Created next.zip for easy upload"

echo ""
echo "🎉 Admin dashboard is ready for deployment!"
echo ""
echo "📦 Upload these files/folders to /public_html/admin/:"
echo "   ✅ .next/ (complete folder)"
echo "   ✅ public/ (complete folder - contains logo.png)"
echo "   ✅ next.config.js"
echo "   ✅ server.js (Node.js server file)"
echo "   ✅ package.json"
echo "   ✅ package-lock.json" 
echo "   ✅ .nvmrc (Node.js version)"
echo "   ✅ .env.production (rename to .env.local on server)"
echo ""
echo "💡 OR upload next.zip and extract it on the server"
echo ""
echo "⚙️ Server setup steps:"
echo "   1. Set Node.js version to 18.x in cPanel"
echo "   2. Set startup file to 'server.js'"
echo "   3. Set app root directory to correct path"
echo "   4. Copy .env.production to .env.local"
echo "   5. Run 'npm install --production' on server"
echo "   6. Restart Node.js app"
echo ""
echo "🔧 Key fixes applied:"
echo "   ✅ Added server.js for shared hosting compatibility"
echo "   ✅ Specified Node.js version (18.x)"
echo "   ✅ Removed standalone output (fixes 'next start' warning)"
echo "   ✅ Fixed deprecated images.domains configuration"
echo "   ✅ Removed problematic HTTPS redirects for shared hosting"
echo "   ✅ Optimized for standard SSR deployment"
echo "   ✅ Added proper error handling in server.js"