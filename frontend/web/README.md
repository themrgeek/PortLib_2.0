# PortLib Web Application

React-based web application for the PortLib Smart Library Management System.

## Features

- 🔐 Secure authentication with OTP verification
- 📊 Role-based dashboard with statistics
- 👤 User profile management
- 📱 Fully responsive design (desktop, tablet, mobile)
- 🎨 Modern UI with Material-UI and TailwindCSS
- 🚀 Fast performance with Vite

## Prerequisites

- Node.js 20.19.0 or higher
- npm or yarn package manager

## Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

## Configuration

Update `.env` file with your API endpoint:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── assets/          # Images, icons, fonts
├── components/
│   ├── common/      # Reusable components (Button, Input, Card)
│   ├── auth/        # Authentication-related components
│   └── layout/      # Layout components (Header, Sidebar, Footer)
├── pages/
│   ├── Auth/        # Login, Signup pages
│   ├── Dashboard/   # Dashboard page
│   └── Profile/     # Profile page
├── services/
│   ├── api.js       # Axios instance with interceptors
│   └── auth.service.js  # Authentication API calls
├── store/
│   ├── authStore.js # Authentication state
│   └── userStore.js # User profile state
├── utils/
│   ├── constants.js # Application constants
│   ├── validators.js # Form validation schemas
│   └── helpers.js   # Helper functions
├── App.jsx          # Main application component
└── main.jsx         # Application entry point
```

## Available Pages

### Public Pages
- `/login` - User and Admin login
- `/verify-login-otp` - OTP verification
- `/forgot-password` - Password recovery

### Protected Pages (Requires Authentication)
- `/dashboard` - Main dashboard with statistics
- `/dashboard/profile` - User profile management

## Responsive Breakpoints

- **Desktop**: 1920px+
- **Laptop**: 1366px+
- **Tablet**: 768px+
- **Mobile**: 320px+

## Technologies Used

- **React 18+**: Modern React with hooks
- **Material-UI v5**: Component library
- **TailwindCSS**: Utility-first CSS
- **Zustand**: State management
- **React Router v6**: Client-side routing
- **Axios**: HTTP client
- **Formik**: Form management
- **Yup**: Schema validation
- **React Toastify**: Toast notifications

## State Management

The application uses Zustand for state management:

- **authStore**: Manages authentication state, user data, and token
- **userStore**: Manages user profile and related data

## API Integration

All API calls go through the centralized Axios instance (`src/services/api.js`) which:
- Adds authentication tokens to requests
- Handles 401 unauthorized responses
- Manages network errors
- Provides consistent error handling

## Form Validation

Forms use Formik with Yup schemas defined in `src/utils/validators.js`:
- Email validation
- Phone number validation
- Password strength validation
- OTP format validation

## Building for Production

```bash
# Build optimized production bundle
npm run build

# The dist/ folder will contain the production-ready files
# Deploy the dist/ folder to your web server
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:8000)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with React Router
- Lazy loading of routes
- Optimized bundle size with Vite
- Material-UI tree shaking
- TailwindCSS purging unused styles

## Troubleshooting

### Development server not starting
- Check if port 5173 is available
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Styles not applying
- Ensure TailwindCSS is properly configured
- Check if PostCSS config is correct
- Clear browser cache

### API requests failing
- Verify VITE_API_BASE_URL in .env
- Check if backend is running
- Inspect network tab in browser dev tools

## License

Copyright © 2024 PortLib. All Rights Reserved.
