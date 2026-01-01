#!/bin/bash

# PortLib Cleanup Script
# This script cleans up Docker containers, images, and temporary files

set -e

echo "🧹 PortLib Cleanup Script"
echo "========================"

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

# Confirm action
confirm() {
    local message="$1"
    echo -e "${YELLOW}$message${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
}

# Clean Docker containers and images
clean_docker() {
    print_status "Cleaning Docker resources..."

    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Skipping Docker cleanup."
        return 0
    fi

    cd backend

    # Stop and remove containers
    print_status "Stopping and removing containers..."
    docker-compose down --volumes --remove-orphans 2>/dev/null || true

    # Remove unused images
    print_status "Removing unused Docker images..."
    docker image prune -f

    # Remove unused volumes
    print_status "Removing unused Docker volumes..."
    docker volume prune -f

    # Remove unused networks
    print_status "Removing unused Docker networks..."
    docker network prune -f

    cd ..
    print_success "Docker resources cleaned"
}

# Clean Node.js dependencies
clean_node_modules() {
    print_status "Cleaning Node.js dependencies..."

    # Clean backend dependencies
    if [ -d "backend" ]; then
        cd backend
        print_status "Cleaning backend dependencies..."

        # Remove node_modules and lock files
        rm -rf node_modules package-lock.json

        # Clean service dependencies
        for service in services/*; do
            if [ -d "$service" ]; then
                cd "$service"
                rm -rf node_modules package-lock.json
                cd ../..
            fi
        done

        cd ..
        print_success "Backend dependencies cleaned"
    fi

    # Clean web frontend dependencies
    if [ -d "frontend/web" ]; then
        print_status "Cleaning web frontend dependencies..."
        cd frontend/web
        rm -rf node_modules package-lock.json dist .vite
        cd ../..
        print_success "Web frontend dependencies cleaned"
    fi

    # Clean mobile frontend dependencies
    if [ -d "frontend/mobile" ]; then
        print_status "Cleaning mobile frontend dependencies..."
        cd frontend/mobile
        rm -rf node_modules package-lock.json dist
        cd ../..
        print_success "Mobile frontend dependencies cleaned"
    fi
}

# Clean build artifacts
clean_builds() {
    print_status "Cleaning build artifacts..."

    # Remove web build
    if [ -d "frontend/web/dist" ]; then
        rm -rf frontend/web/dist
        print_success "Web build artifacts removed"
    fi

    # Remove mobile build artifacts
    if [ -d "frontend/mobile/dist" ]; then
        rm -rf frontend/mobile/dist
        print_success "Mobile build artifacts removed"
    fi

    # Remove log files
    find . -name "*.log" -type f -delete 2>/dev/null || true
    print_success "Log files removed"
}

# Clean temporary files
clean_temp() {
    print_status "Cleaning temporary files..."

    # Remove OS-specific temp files
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name "*.temp" -type f -delete 2>/dev/null || true

    # Remove node temp files
    find . -name ".npm" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true

    print_success "Temporary files cleaned"
}

# Deep clean (removes everything)
deep_clean() {
    print_warning "This will remove ALL Docker containers, images, volumes, and dependencies!"
    confirm "Are you sure you want to perform a deep clean?"

    clean_docker

    # Remove all Docker images related to this project
    print_status "Removing all Docker images..."
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | grep -E "(portlib|backend|auth|books|admin)" | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true

    clean_node_modules
    clean_builds
    clean_temp

    print_success "Deep clean completed"
}

# Show disk usage
show_usage() {
    print_status "Current disk usage:"

    if command -v docker &> /dev/null; then
        echo "Docker:"
        docker system df 2>/dev/null || echo "  Unable to get Docker usage"
    fi

    echo ""
    echo "Directories:"
    du -sh backend frontend scripts 2>/dev/null || echo "  Unable to calculate directory sizes"
}

# Show usage help
show_help() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  docker      Clean Docker containers, images, and volumes"
    echo "  node        Clean Node.js dependencies (node_modules)"
    echo "  builds      Clean build artifacts (dist folders)"
    echo "  temp        Clean temporary files"
    echo "  all         Clean everything (default)"
    echo "  deep        Deep clean (removes ALL Docker resources)"
    echo "  usage       Show current disk usage"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all      # Clean everything"
    echo "  $0 docker   # Clean only Docker resources"
    echo "  $0 node     # Clean only Node.js dependencies"
}

# Main function
main() {
    local action="${1:-all}"

    case "$action" in
        "docker")
            clean_docker
            ;;
        "node")
            clean_node_modules
            ;;
        "builds")
            clean_builds
            ;;
        "temp")
            clean_temp
            ;;
        "all")
            clean_docker
            echo ""
            clean_node_modules
            echo ""
            clean_builds
            echo ""
            clean_temp
            ;;
        "deep")
            deep_clean
            ;;
        "usage")
            show_usage
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown action: $action"
            show_help
            exit 1
            ;;
    esac

    echo ""
    print_success "Cleanup completed!"
}

# Run main function
main "$@"
