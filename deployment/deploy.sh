#!/bin/bash
# Deployment Script for LMS-Ibn-Mailk
# Location: /var/www/LMS-Ibn-Mailk/deploy.sh
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="/var/www/LMS-Ibn-Mailk"
BACKEND_DIR="$PROJECT_ROOT/server"
FRONTEND_DIR="$PROJECT_ROOT/client"
LOG_DIR="/var/log/pm2"

# Create log directory if it doesn't exist
mkdir -p $LOG_DIR

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Navigate to project directory
cd $PROJECT_ROOT || exit 1

print_status "Current directory: $(pwd)"

# Step 1: Pull latest code from Git
print_status "Pulling latest code from Git..."
git pull origin master || {
    print_error "Failed to pull from Git"
    exit 1
}

# Step 2: Install/update backend dependencies
print_status "Installing backend dependencies..."
cd $BACKEND_DIR
npm install --production || {
    print_error "Failed to install backend dependencies"
    exit 1
}

# Step 3: Verify backend .env file exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning ".env file not found. Copying from .env.production..."
    if [ -f "$BACKEND_DIR/.env.production" ]; then
        cp "$BACKEND_DIR/.env.production" "$BACKEND_DIR/.env"
    else
        print_error ".env file not found. Please create it manually."
        exit 1
    fi
fi

# Step 4: Build frontend
print_status "Building frontend..."
cd $FRONTEND_DIR
npm install || {
    print_error "Failed to install frontend dependencies"
    exit 1
}

# Set production environment variables for build
export VITE_API_URL=https://ibnmailku.cloud
export VITE_API_BASE_URL=https://ibnmailku.cloud
export VITE_SOCKET_URL=https://ibnmailku.cloud

npm run build || {
    print_error "Failed to build frontend"
    exit 1
}

# Step 5: Restart PM2 application
print_status "Restarting PM2 application..."
pm2 restart lms-api || {
    print_warning "PM2 application not running. Starting it..."
    cd $PROJECT_ROOT
    pm2 start ecosystem.config.js || {
        print_error "Failed to start PM2 application"
        exit 1
    }
}

# Step 6: Check PM2 status
print_status "Checking PM2 status..."
pm2 status lms-api

# Step 7: Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t || {
    print_error "Nginx configuration test failed"
    exit 1
}

# Step 8: Reload Nginx
print_status "Reloading Nginx..."
sudo systemctl reload nginx || {
    print_error "Failed to reload Nginx"
    exit 1
}

# Step 9: Show logs
print_status "Recent PM2 logs:"
pm2 logs lms-api --lines 20 --nostream

echo ""
print_status "✅ Deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "  1. Check PM2 logs: pm2 logs lms-api"
echo "  2. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  3. Test the API: curl https://ibnmailku.cloud/api/health"
echo "  4. Visit: https://ibnmailku.cloud"

