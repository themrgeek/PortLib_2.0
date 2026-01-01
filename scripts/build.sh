#!/bin/bash

# PortLib Build Script
# This script builds all components for production

set -e

echo "🔨 PortLib Production Build Script"
echo "=================================="

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

# Build backend services
build_backend() {
    print_status "Building backend services..."

    if [ ! -d "backend" ]; then
        print_error "Backend directory not found."
        exit 1
    fi

    cd backend

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Cannot build backend services."
        exit 1
    fi

    # Build all services
    print_status "Building Docker images..."
    docker-compose build

    print_success "Backend services built successfully"
    cd ..
}

# Build web frontend
build_web() {
    print_status "Building web frontend..."

    if [ ! -d "frontend/web" ]; then
        print_error "Web frontend directory not found."
        exit 1
    fi

    cd frontend/web

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Installing dependencies..."
        npm install
    fi

    # Build for production
    print_status "Building web application..."
    npm run build

    if [ -d "dist" ]; then
        print_success "Web frontend built successfully"
        echo "  Build output: $(pwd)/dist"
    else
        print_error "Web frontend build failed"
        exit 1
    fi

    cd ../..
}

# Build mobile frontend
build_mobile() {
    print_status "Building mobile frontend..."

    if [ ! -d "frontend/mobile" ]; then
        print_warning "Mobile frontend directory not found. Skipping..."
        return 0
    fi

    cd frontend/mobile

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Installing dependencies..."
        npm install
    fi

    # Build for production (this creates native binaries)
    print_status "Building mobile application..."
    print_warning "Note: Mobile build requires Expo CLI and may take several minutes"

    # For Android APK
    echo "Building Android APK..."
    if npx expo build:android --type app-bundle --no-publish > build_android.log 2>&1; then
        print_success "Android build completed"
        echo "  Check build_android.log for details"
    else
        print_warning "Android build failed. Check build_android.log for details"
    fi

    # For iOS (only on macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Building iOS archive..."
        if npx expo build:ios --type archive --no-publish > build_ios.log 2>&1; then
            print_success "iOS build completed"
            echo "  Check build_ios.log for details"
        else
            print_warning "iOS build failed. Check build_ios.log for details"
        fi
    else
        print_warning "iOS build skipped (not on macOS)"
    fi

    cd ../..
}

# Show usage
show_usage() {
    echo "Usage: $0 [component]"
    echo ""
    echo "Components:"
    echo "  backend    Build backend services only"
    echo "  web        Build web frontend only"
    echo "  mobile     Build mobile frontend only"
    echo "  all        Build all components (default)"
    echo ""
    echo "Examples:"
    echo "  $0             # Build all components"
    echo "  $0 backend     # Build backend only"
    echo "  $0 web         # Build web frontend only"
}

# Main function
main() {
    local component="${1:-all}"

    echo "Starting build process..."
    echo ""

    case "$component" in
        "backend")
            build_backend
            ;;
        "web")
            build_web
            ;;
        "mobile")
            build_mobile
            ;;
        "all")
            build_backend
            echo ""
            build_web
            echo ""
            build_mobile
            ;;
        *)
            print_error "Unknown component: $component"
            show_usage
            exit 1
            ;;
    esac

    echo ""
    print_success "Build process completed!"

    if [ "$component" = "all" ] || [ "$component" = "backend" ]; then
        echo ""
        echo "To start production services:"
        echo "  cd backend && docker-compose -f docker-compose.prod.yml up -d"
    fi

    if [ "$component" = "all" ] || [ "$component" = "web" ]; then
        echo ""
        echo "Web build output: frontend/web/dist"
        echo "Serve with: cd frontend/web && npx serve dist"
    fi
}

# Run main function
main "$@"
