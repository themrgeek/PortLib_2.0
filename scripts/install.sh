#!/bin/bash

# PortLib Installation Script
# This script installs all dependencies for the PortLib project

set -e

echo "🚀 PortLib Installation Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi

    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_VERSION="18.0.0"

    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_success "Node.js version $NODE_VERSION is compatible"
    else
        print_error "Node.js version $NODE_VERSION is not supported. Please upgrade to v18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm is available"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Backend services require Docker."
        print_warning "Please install Docker and Docker Compose to run backend services."
        return 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_warning "Docker Compose is not available. Backend services require Docker Compose."
        return 1
    fi

    print_success "Docker and Docker Compose are available"
    return 0
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."

    if [ ! -d "backend" ]; then
        print_error "Backend directory not found. Please run this script from the project root."
        exit 1
    fi

    cd backend

    # Install root dependencies
    if [ -f "package.json" ]; then
        print_status "Installing root backend dependencies..."
        npm install
    fi

    # Install service dependencies
    for service in services/*; do
        if [ -d "$service" ] && [ -f "$service/package.json" ]; then
            print_status "Installing dependencies for $(basename $service)..."
            cd "$service"
            npm install
            cd ../..
        fi
    done

    cd ..
    print_success "Backend dependencies installed"
}

# Install web frontend dependencies
install_web() {
    print_status "Installing web frontend dependencies..."

    if [ ! -d "frontend/web" ]; then
        print_error "Web frontend directory not found."
        return 1
    fi

    cd frontend/web
    npm install
    cd ../..
    print_success "Web frontend dependencies installed"
}

# Install mobile frontend dependencies
install_mobile() {
    print_status "Installing mobile frontend dependencies..."

    if [ ! -d "frontend/mobile" ]; then
        print_warning "Mobile frontend directory not found. Skipping..."
        return 0
    fi

    # Check if Expo CLI is available
    if ! command -v expo &> /dev/null && ! npx expo --version &> /dev/null; then
        print_warning "Expo CLI not found. Mobile development requires Expo CLI."
        print_warning "Install with: npm install -g @expo/cli"
    fi

    cd frontend/mobile
    npm install
    cd ../..
    print_success "Mobile frontend dependencies installed"
}

# Setup environment file
setup_env() {
    print_status "Setting up environment configuration..."

    if [ ! -f "backend/.example.env" ]; then
        print_warning "Environment template not found. Skipping..."
        return 0
    fi

    if [ ! -f "backend/.env" ]; then
        cp backend/.example.env backend/.env
        print_success "Environment file created from template"
        print_warning "Please edit backend/.env with your actual credentials:"
        echo "  - SUPABASE_URL"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        echo "  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
        echo "  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
        echo "  - JWT_SECRET"
    else
        print_status "Environment file already exists"
    fi
}

# Main installation function
main() {
    echo "Checking system requirements..."
    check_nodejs
    check_npm
    check_docker

    echo ""
    echo "Installing dependencies..."

    install_backend
    install_web
    install_mobile

    echo ""
    setup_env

    echo ""
    print_success "Installation completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in backend/.env"
    echo "2. Start the backend services: cd backend && docker-compose up --build"
    echo "3. Start the web frontend: cd frontend/web && npm run dev"
    echo "4. Start the mobile frontend: cd frontend/mobile && npm start"
    echo ""
    echo "For more information, see README.md"
}

# Run main function
main "$@"
