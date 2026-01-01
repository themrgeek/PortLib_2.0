#!/bin/bash

# PortLib Deployment Script
# This script deploys the application to production

set -e

echo "🚀 PortLib Production Deployment"
echo "================================="

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Deployment requires Docker."
        exit 1
    fi

    # Check if builds exist
    if [ ! -d "frontend/web/dist" ]; then
        print_error "Web frontend build not found. Run ./scripts/build.sh web first."
        exit 1
    fi

    if [ ! -f "backend/.env" ]; then
        print_error "Environment file not found. Please configure backend/.env"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Deploy backend services
deploy_backend() {
    print_status "Deploying backend services..."

    cd backend

    # Create production docker-compose override if needed
    if [ ! -f "docker-compose.prod.yml" ]; then
        print_warning "Creating production docker-compose configuration..."
        cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  api-gateway:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  auth-user:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  auth-admin:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  books-service:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  admin-service:
    environment:
      - NODE_ENV=production
    restart: unless-stopped
EOF
    fi

    # Stop any existing containers
    print_status "Stopping existing services..."
    docker-compose down || true

    # Build and start services
    print_status "Building and starting production services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

    # Wait for services to be healthy
    print_status "Waiting for services to start..."
    sleep 30

    # Check service health
    if docker-compose ps | grep -q "Up"; then
        print_success "Backend services deployed successfully"
        echo "Services running on:"
        echo "  API Gateway: http://localhost:8000"
        echo "  Auth User:   http://localhost:8001"
        echo "  Auth Admin:  http://localhost:8002"
        echo "  Books:       http://localhost:8003"
        echo "  Admin:       http://localhost:8004"
    else
        print_error "Some services failed to start. Check logs:"
        docker-compose logs
        exit 1
    fi

    cd ..
}

# Deploy web frontend
deploy_web() {
    print_status "Deploying web frontend..."

    # For static hosting, you would typically copy the dist folder to your web server
    # This example assumes nginx or similar static hosting

    if [ ! -d "frontend/web/dist" ]; then
        print_error "Web build not found. Run ./scripts/build.sh web first."
        exit 1
    fi

    print_success "Web frontend ready for deployment"
    echo "Static files available at: $(pwd)/frontend/web/dist"
    echo ""
    echo "To deploy to a web server:"
    echo "1. Copy frontend/web/dist to your web server's document root"
    echo "2. Configure your web server (nginx/apache) to serve static files"
    echo "3. Update API_BASE_URL in the built files to point to your backend"
    echo ""
    echo "Example nginx configuration:"
    echo "  server {"
    echo "    listen 80;"
    echo "    root /path/to/frontend/web/dist;"
    echo "    index index.html;"
    echo "    location / {"
    echo "      try_files \$uri \$uri/ /index.html;"
    echo "    }"
    echo "  }"
}

# Show deployment status
show_status() {
    print_status "Deployment Status"
    echo "=================="

    if [ -d "backend" ]; then
        cd backend
        echo "Backend Services:"
        docker-compose ps
        cd ..
    fi

    echo ""
    echo "Web Frontend:"
    if [ -d "frontend/web/dist" ]; then
        echo "  ✓ Built and ready"
        echo "  Location: $(pwd)/frontend/web/dist"
    else
        echo "  ✗ Not built"
    fi

    echo ""
    echo "Mobile App:"
    echo "  Build separately using ./scripts/build.sh mobile"
    echo "  Deploy through app stores or Expo"
}

# Show usage
show_usage() {
    echo "Usage: $0 [component]"
    echo ""
    echo "Components:"
    echo "  backend    Deploy backend services only"
    echo "  web        Deploy web frontend only"
    echo "  status     Show deployment status"
    echo "  all        Deploy all components (default)"
    echo ""
    echo "Examples:"
    echo "  $0             # Deploy all components"
    echo "  $0 backend     # Deploy backend only"
    echo "  $0 status      # Show current deployment status"
}

# Main function
main() {
    local component="${1:-all}"

    case "$component" in
        "backend")
            check_prerequisites
            deploy_backend
            ;;
        "web")
            deploy_web
            ;;
        "status")
            show_status
            ;;
        "all")
            check_prerequisites
            deploy_backend
            echo ""
            deploy_web
            echo ""
            show_status
            ;;
        *)
            print_error "Unknown component: $component"
            show_usage
            exit 1
            ;;
    esac

    echo ""
    print_success "Deployment process completed!"

    if [ "$component" = "all" ] || [ "$component" = "backend" ]; then
        echo ""
        echo "Monitor services:"
        echo "  cd backend && docker-compose logs -f"
        echo ""
        echo "Stop services:"
        echo "  cd backend && docker-compose down"
    fi
}

# Run main function
main "$@"
