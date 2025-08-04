#!/bin/bash

# 🚀 KampusKart Render Deployment Setup Script

echo "🚀 Setting up KampusKart for Render deployment..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please create it first."
    exit 1
fi

# Check if Procfile exists
if [ ! -f "Procfile" ]; then
    echo "❌ Error: Procfile not found. Please create it first."
    exit 1
fi

echo "✅ All required files found!"

# Check package.json scripts
if grep -q '"start"' package.json; then
    echo "✅ Start script found in package.json"
else
    echo "❌ Error: No start script found in package.json"
    exit 1
fi

# Check if server.js exists
if [ -f "server.js" ]; then
    echo "✅ server.js found"
else
    echo "❌ Error: server.js not found"
    exit 1
fi

# Check if health endpoint exists
if grep -q "/api/health" server.js; then
    echo "✅ Health check endpoint found"
else
    echo "❌ Error: Health check endpoint not found in server.js"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your backend is ready for Render deployment."
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Create a new Web Service"
echo "4. Connect your GitHub repository"
echo "5. Set the root directory to: S72_Gaurav_Capstone/backend"
echo "6. Configure environment variables"
echo "7. Deploy!"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md" 