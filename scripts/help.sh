#!/bin/bash

# PortLib Help Script
# This script shows information about all available scripts and commands

echo "🚀 PortLib Development Scripts"
echo "=============================="
echo ""

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Available Scripts:${NC}"
echo ""

echo -e "${GREEN}./scripts/install.sh${NC} - Install all dependencies"
echo "  Sets up the entire development environment"
echo "  Installs backend, web, and mobile dependencies"
echo "  Creates environment configuration"
echo ""

echo -e "${GREEN}./scripts/dev.sh [component]${NC} - Start development environment"
echo "  Components: backend, web, mobile, all (default)"
echo "  Examples:"
echo "    ./scripts/dev.sh          # Start all components"
echo "    ./scripts/dev.sh backend  # Start backend only"
echo "    ./scripts/dev.sh web      # Start web frontend only"
echo ""

echo -e "${GREEN}./scripts/build.sh [component]${NC} - Build for production"
echo "  Components: backend, web, mobile, all (default)"
echo "  Creates optimized production builds"
echo ""

echo -e "${GREEN}./scripts/deploy.sh [component]${NC} - Deploy to production"
echo "  Components: backend, web, all (default)"
echo "  Deploys services and shows status"
echo ""

echo -e "${GREEN}./scripts/clean.sh [option]${NC} - Clean up resources"
echo "  Options: docker, node, builds, temp, all (default), deep"
echo "  Examples:"
echo "    ./scripts/clean.sh all    # Clean everything"
echo "    ./scripts/clean.sh docker # Clean Docker resources only"
echo ""

echo -e "${GREEN}./scripts/db-setup.sh [command]${NC} - Database setup and management"
echo "  Commands: test, schema, keys, all (default), info"
echo "  Examples:"
echo "    ./scripts/db-setup.sh all     # Complete database setup"
echo "    ./scripts/db-setup.sh test    # Test database connection"
echo ""

echo -e "${BLUE}Quick Start Workflow:${NC}"
echo "1. Clone the repository"
echo "2. Run: ./scripts/install.sh"
echo "3. Configure: backend/.env with your credentials"
echo "4. Setup database: ./scripts/db-setup.sh"
echo "5. Start development: ./scripts/dev.sh"
echo ""

echo -e "${BLUE}Environment Setup:${NC}"
echo "Copy backend/.example.env to backend/.env and configure:"
echo "- SUPABASE_URL"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
echo "- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
echo "- JWT_SECRET"
echo ""

echo -e "${BLUE}Project Structure:${NC}"
echo "├── backend/              # Microservices backend"
echo "│   ├── api-gateway/      # API Gateway service"
echo "│   ├── services/         # Individual microservices"
echo "│   └── shared/           # Shared utilities"
echo "├── frontend/             # Frontend applications"
echo "│   ├── web/              # React web application"
echo "│   └── mobile/           # React Native mobile app"
echo "├── scripts/              # Development scripts"
echo "└── postman/              # API documentation"
echo ""

echo -e "${BLUE}Common Issues:${NC}"
echo ""

echo -e "${YELLOW}Backend services not starting:${NC}"
echo "  Check Docker logs: cd backend && docker-compose logs"
echo "  Verify environment variables in backend/.env"
echo ""

echo -e "${YELLOW}Frontend build failures:${NC}"
echo "  Clean and reinstall: ./scripts/clean.sh node && ./scripts/install.sh"
echo ""

echo -e "${YELLOW}Database connection issues:${NC}"
echo "  Test connection: ./scripts/db-setup.sh test"
echo "  Verify Supabase credentials"
echo ""

echo -e "${YELLOW}Mobile app issues:${NC}"
echo "  Clear Expo cache: cd frontend/mobile && npx expo r -c"
echo ""

echo -e "${BLUE}For more information, see README.md${NC}"
echo ""
echo "Happy coding! 🚀"
