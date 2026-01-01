# PortLib - Smart Library Management System

A modern, microservices-based library management system with web and mobile applications, built with React, Node.js, and Supabase.

## ⚡ Quick Setup (2 minutes)

```bash
git clone <repository-url>
cd PORTLIB_PROTOTYPE_1.0
./setup.sh
```

That's it! Configure your `.env` file and you're ready to develop.

## 📚 Available Scripts

- `./setup.sh` - Complete automated setup
- `./scripts/install.sh` - Install all dependencies
- `./scripts/dev.sh` - Start development environment
- `./scripts/build.sh` - Build for production
- `./scripts/deploy.sh` - Deploy to production
- `./scripts/clean.sh` - Clean up resources
- `./scripts/db-setup.sh` - Database setup
- `./scripts/help.sh` - Show all commands

## 🚀 Features

- **Multi-platform Support**: Web application (React/Vite) and Mobile app (React Native/Expo)
- **User Management**: Student, Faculty, and Librarian authentication with role-based access
- **Admin Dashboard**: Comprehensive admin panel for user and book management
- **Book Management**: Add, update, search, and track book inventory
- **OTP Authentication**: Secure email and SMS verification (configurable)
- **Real-time Notifications**: Email and SMS notifications for important events
- **Responsive Design**: Modern UI with Material Design components

## 🏗️ Architecture

### Backend (Microservices)
- **API Gateway**: Centralized request routing and load balancing
- **Auth User Service**: User authentication and registration
- **Auth Admin Service**: Admin authentication and approval workflow
- **Books Service**: Book inventory and borrowing management
- **Admin Service**: Administrative operations and statistics

### Frontend
- **Web App**: React 19 with Material-UI, Vite build system
- **Mobile App**: React Native with Expo, React Navigation

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Containerization**: Docker & Docker Compose
- **Email Service**: NodeMailer with SMTP
- **SMS Service**: Twilio integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker & Docker Compose**
- **Git**
- **Expo CLI** (for mobile development)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PORTLIB_PROTOTYPE_1.0
   ```

2. **Install dependencies:**
   ```bash
   # Install all dependencies (backend + frontend)
   ./scripts/install.sh

   # Or install manually:
   # Backend dependencies
   cd backend
   npm install

   # Web frontend
   cd ../frontend/web
   npm install

   # Mobile frontend (requires Expo CLI)
   cd ../mobile
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   # Copy and configure environment variables
   cp backend/.example.env backend/.env

   # Edit the .env file with your credentials:
   # - Supabase URL and service role key
   # - SMTP settings for email
   # - Twilio credentials for SMS
   # - JWT secret
   ```

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Complete setup in one command
./setup.sh

# Then configure environment and start developing
./scripts/dev.sh all
```

### Manual Setup

#### Development Mode

```bash
# Start all components at once
./scripts/dev.sh all

# Or start individually:
./scripts/dev.sh backend    # Backend services only
./scripts/dev.sh web        # Web frontend only
./scripts/dev.sh mobile     # Mobile frontend only
```

Access URLs:
- **Web App**: http://localhost:5173
- **API Gateway**: http://localhost:8000
- **Mobile App**: Use Expo Go or press `w` in terminal for web preview

### Production Mode

```bash
# Build and start all services
./scripts/deploy.sh

# Or manually:
cd backend
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔧 Configuration

### Environment Variables

Copy `backend/.example.env` to `backend/.env` and configure:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@portlib.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

### Database Setup

1. Create a Supabase project
2. Run the SQL schema from `backend/shared/db/schema_updates.sql`
3. Configure environment variables with your Supabase credentials

## 📱 API Documentation

### User Authentication Endpoints

#### User Registration
```
POST /auth/user/signup
Content-Type: multipart/form-data

{
  "role": "student|faculty|librarian",
  "email": "user@example.com",
  "phone": "+91xxxxxxxxxx",
  "password": "password123",
  "confirm_password": "password123",
  "student_id|employee_id": "ID123", // depending on role
  "id_proof": file // image file
}
```

#### User Login
```
POST /auth/user/login
{
  "identifier": "student_id_or_employee_id",
  "password": "password123",
  "role": "student|librarian|faculty"
}
```

#### Admin Authentication
```
POST /auth/admin/signup
{
  "admin_key": "admin_key_from_db",
  "email": "admin@example.com",
  "phone": "+91xxxxxxxxxx",
  "password": "password123"
}
```

### Books Management

#### Get All Books
```
GET /books?page=1&limit=20&search=title&category=fiction
```

#### Add Book
```
POST /books
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-1234567890",
  "category": "Fiction",
  "quantity": 5,
  "price": 29.99
}
```

## 🛠️ Development Scripts

### Available Scripts

```bash
# Quick setup (installs all dependencies)
./scripts/install.sh

# Start development environment
./scripts/dev.sh

# Run tests
./scripts/test.sh

# Build for production
./scripts/build.sh

# Deploy to production
./scripts/deploy.sh

# Clean up Docker containers and volumes
./scripts/clean.sh

# Database setup and migrations
./scripts/db-setup.sh
```

### Manual Commands

```bash
# Backend services
cd backend
docker-compose up --build          # Start all services
docker-compose down               # Stop services
docker-compose logs -f            # View logs

# Web frontend
cd frontend/web
npm run dev                       # Development server
npm run build                     # Production build
npm run preview                   # Preview production build

# Mobile frontend
cd frontend/mobile
npm start                         # Expo development server
npm run android                   # Android build
npm run ios                       # iOS build
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
# Web
cd frontend/web
npm run test

# Mobile
cd frontend/mobile
npm run test
```

## 📦 Deployment

### Docker Deployment
```bash
# Production deployment
cd backend
docker-compose -f docker-compose.prod.yml up --build -d

# Check service health
docker-compose ps
docker-compose logs
```

### Manual Deployment
```bash
# Build web frontend
cd frontend/web
npm run build

# Build mobile app
cd ../mobile
expo build:android  # or build:ios
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for users, librarians, and admins
- **Password Hashing**: bcrypt for secure password storage
- **OTP Verification**: Email and SMS verification for account security
- **Input Validation**: Comprehensive validation with Yup schemas
- **Rate Limiting**: API rate limiting to prevent abuse

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code structure and naming conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section below

## 🔍 Troubleshooting

### Common Issues

**Backend services not starting:**
```bash
# Check Docker logs
cd backend
docker-compose logs

# Verify environment variables
cat .env
```

**Frontend build failures:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database connection issues:**
```bash
# Verify Supabase credentials
cd backend
node -e "require('dotenv').config(); console.log('DB connected:', !!process.env.SUPABASE_URL)"
```

**Mobile app issues:**
```bash
# Clear Expo cache
cd frontend/mobile
expo r -c
```

## 📊 Project Structure

```
PORTLIB_PROTOTYPE_1.0/
├── backend/                    # Backend microservices
│   ├── api-gateway/           # API Gateway service
│   ├── services/              # Microservices
│   │   ├── auth-user/         # User authentication
│   │   ├── auth-admin/        # Admin authentication
│   │   ├── books-service/     # Book management
│   │   └── admin-service/     # Admin operations
│   ├── shared/                # Shared utilities
│   ├── docker-compose.yml     # Docker services
│   └── .example.env          # Environment template
├── frontend/                  # Frontend applications
│   ├── web/                   # React web application
│   └── mobile/                # React Native mobile app
├── scripts/                   # Development scripts
├── postman/                   # API documentation
└── README.md                 # This file
```

---

**Happy coding! 🚀**