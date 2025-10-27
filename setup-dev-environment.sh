#!/bin/bash

# LMS Development Environment Setup Script
# This script sets up the complete development environment

echo "🚀 Setting up LMS Development Environment..."
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️ MongoDB is not installed. Please install MongoDB first."
    echo "   Visit: https://docs.mongodb.com/manual/installation/"
else
    echo "✅ MongoDB is installed"
fi

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd server

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "✅ Created .env file from template"
    echo "   Please update the values in .env as needed"
else
    echo "✅ .env file already exists"
fi

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../client

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp env.example .env.local
    echo "✅ Created .env.local file from template"
    echo "   Please update the values in .env.local as needed"
else
    echo "✅ .env.local file already exists"
fi

# Go back to root
cd ..

echo ""
echo "🎉 Development Environment Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update environment variables in:"
echo "   - server/.env"
echo "   - client/.env.local"
echo ""
echo "2. Start MongoDB (if not already running):"
echo "   mongod"
echo ""
echo "3. Start the backend server:"
echo "   cd server && npm run dev"
echo ""
echo "4. Start the frontend (in a new terminal):"
echo "   cd client && npm run dev"
echo ""
echo "5. Run tests to verify everything works:"
echo "   cd server && node verify-complete-system.js"
echo ""
echo "🌐 Access Points:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5000"
echo "   - Health Check: http://localhost:5000/health"
echo ""
echo "✅ Setup complete! Happy coding!"

