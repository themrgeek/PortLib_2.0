#!/bin/bash

# PortLib Quick Setup Script
# Run this script immediately after cloning to get started

set -e

echo "🚀 PortLib Quick Setup"
echo "======================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo "This script will:"
echo "1. Check system requirements"
echo "2. Install all dependencies"
echo "3. Set up environment configuration"
echo "4. Provide next steps"
echo ""

# Check Node.js
print_info "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm available"
else
    print_error "npm not found"
    exit 1
fi

# Check Docker (optional for backend)
if command -v docker &> /dev/null; then
    print_success "Docker available (required for backend services)"
else
    print_warning "Docker not found. Backend services require Docker. Install from https://docker.com"
fi

echo ""

# Run the main installation script
print_info "Installing dependencies..."
if ./scripts/install.sh; then
    print_success "Dependencies installed successfully"
else
    print_error "Installation failed"
    exit 1
fi

echo ""
print_success "Setup completed!"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 📝 Configure Environment:"
echo "   Edit backend/.env with your credentials:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - SMTP settings (for email)"
echo "   - TWILIO settings (for SMS)"
echo "   - JWT_SECRET"
echo ""

echo "2. 🗄️  Setup Database:"
echo "   ./scripts/db-setup.sh all"
echo ""

echo "3. 🚀 Start Development:"
echo "   ./scripts/dev.sh all"
echo ""

echo "4. 📱 Access Applications:"
echo "   - Web App: http://localhost:5173"
echo "   - Mobile App: Use Expo Go or press 'w' in terminal"
echo "   - API Gateway: http://localhost:8000"
echo ""

echo "📚 For more information:"
echo "   ./scripts/help.sh         # Show all available scripts"
echo "   cat README.md            # Read comprehensive documentation"
echo ""

echo "🎉 Happy coding with PortLib!"
