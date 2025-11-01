#!/bin/bash
# Netlify Deployment Preparation Script

echo "🚀 Preparing Fee Payment Queue Management System for Netlify Deployment"
echo "=================================================================="

# Check if all required files exist
echo "📁 Checking required files..."

required_files=(
    "index.html"
    "user-register.html" 
    "user-login.html"
    "user-dashboard.html"
    "admin-login.html"
    "admin-dashboard.html"
    "styles.css"
    "queue-manager.js"
    "auth.js"
    "user-dashboard.js"
    "admin-auth.js"
    "admin-dashboard.js"
    "_redirects"
    "netlify.toml"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
        missing_files+=("$file")
    fi
done

echo ""

if [[ ${#missing_files[@]} -eq 0 ]]; then
    echo "🎉 All required files present!"
    echo ""
    echo "📋 Deployment Checklist:"
    echo "1. ✅ All HTML files present"
    echo "2. ✅ All JavaScript files present" 
    echo "3. ✅ CSS styling file present"
    echo "4. ✅ Netlify configuration files present"
    echo ""
    echo "🌐 Ready for Netlify deployment!"
    echo ""
    echo "📝 Deployment Steps:"
    echo "1. Login to Netlify (https://netlify.com)"
    echo "2. Drag and drop this entire folder"
    echo "3. Wait for deployment to complete"
    echo "4. Test the live site"
    echo ""
    echo "🔐 Default Admin Credentials:"
    echo "Username: admin"
    echo "Password: admin123"
    echo ""
    echo "🧪 Test your deployment with: test-deployment.html"
    
else
    echo "⚠️  Missing ${#missing_files[@]} required file(s):"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "❌ Please ensure all files are present before deployment"
fi

echo ""
echo "=================================================================="