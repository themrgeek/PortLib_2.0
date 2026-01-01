#!/bin/bash

# PortLib Development Environment Script
# This script starts the development environment for all components

set -e

echo "🚀 PortLib Development Environment"
echo "==================================="

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

# Check if environment is configured
check_env() {
    if [ ! -f "backend/.env" ]; then
        print_error "Environment file not found. Please run ./scripts/install.sh first."
        exit 1
    fi
}

# Start backend services
start_backend() {
    print_status "Starting backend services..."

    if [ ! -d "backend" ]; then
        print_error "Backend directory not found."
        exit 1
    fi

    cd backend

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Cannot start backend services."
        exit 1
    fi

    # Start services in detached mode
    docker-compose up --build -d

    print_success "Backend services started"
    echo "  API Gateway: http://localhost:8000"
    echo "  Auth User:   http://localhost:8001"
    echo "  Auth Admin:  http://localhost:8002"
    echo "  Books:       http://localhost:8003"
    echo "  Admin:       http://localhost:8004"
    echo ""
    echo "View logs: docker-compose logs -f"

    cd ..
}

# Start web frontend
start_web() {
    print_status "Starting web frontend..."

    if [ ! -d "frontend/web" ]; then
        print_error "Web frontend directory not found."
        exit 1
    fi

    cd frontend/web

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Installing web dependencies..."
        npm install
    fi

    print_success "Web frontend starting..."
    echo "  URL: http://localhost:5173"
    echo "  Press Ctrl+C to stop"
    echo ""

    # Start in foreground
    npm run dev
}

# Start mobile frontend
start_mobile() {
    print_status "Starting mobile frontend..."

    if [ ! -d "frontend/mobile" ]; then
        print_error "Mobile frontend directory not found."
        return 1
    fi

    cd frontend/mobile

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Installing mobile dependencies..."
        npm install
    fi

    print_success "Mobile frontend starting..."
    echo "  Use Expo Go app or press:"
    echo "  'w' for web preview"
    echo "  'i' for iOS simulator"
    echo "  'a' for Android emulator"
    echo "  Press Ctrl+C to stop"
    echo ""

    # Start in foreground
    npm start
}

# Show usage
show_usage() {
    echo "Usage: $0 [component]"
    echo ""
    echo "Components:"
    echo "  backend    Start backend services only"
    echo "  web        Start web frontend only"
    echo "  mobile     Start mobile frontend only"
    echo "  all        Start all components (default)"
    echo ""
    echo "Examples:"
    echo "  $0             # Start all components"
    echo "  $0 backend     # Start backend only"
    echo "  $0 web         # Start web frontend only"
}

# Main function
main() {
    local component="${1:-all}"

    check_env

    case "$component" in
        "backend")
            start_backend
            ;;
        "web")
            start_web
            ;;
        "mobile")
            start_mobile
            ;;
        "all")
            echo "Starting all components..."
            echo ""
            start_backend &
            BACKEND_PID=$!

            echo "Waiting 10 seconds for backend to initialize..."
            sleep 10

            echo ""
            echo "Starting frontend applications..."
            echo ""

            # Start web in background
            start_web &
            WEB_PID=$!

            # Start mobile in background
            start_mobile &
            MOBILE_PID=$!

            # Wait for all processes
            wait $WEB_PID $MOBILE_PID
            ;;
        *)
            print_error "Unknown component: $component"
            show_usage
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Shutting down...${NC}"; exit 0' INT TERM

# Run main function
main "$@"
