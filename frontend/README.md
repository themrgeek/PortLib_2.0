# PortLib Frontend

This folder contains both the web and mobile applications for the PortLib Smart Library Management System.

## Structure

```
frontend/
├── web/          # React Web Application (Vite + Material-UI + TailwindCSS)
└── mobile/       # React Native Mobile Application (Expo + React Native Paper)
```

## Features

- **Authentication**: User and Admin login with OTP verification
- **Dashboard**: Role-based dashboard with statistics and quick actions
- **Profile Management**: View and edit user profile information
- **Responsive Design**: Web app is fully responsive across all devices
- **Modern UI**: Beautiful, intuitive interfaces following Material Design principles

## Technology Stack

### Web App
- React 18+ (latest, no React.FC)
- Material-UI v5 for components
- TailwindCSS for utility styling
- Zustand for state management
- Axios for API calls
- React Router v6 for navigation
- Formik + Yup for form validation

### Mobile App
- React Native (latest)
- Expo for development and build
- React Native Paper for Material Design components
- Zustand for state management
- Axios for API calls
- React Navigation v6 for navigation
- Formik + Yup for form validation

## Getting Started

### Web Application

```bash
cd web
npm install
npm run dev
```

The web app will be available at `http://localhost:5173`

### Mobile Application

```bash
cd mobile
npm install
npm start
```

Follow the Expo CLI instructions to run on:
- Android emulator: Press `a`
- iOS simulator: Press `i`
- Web browser: Press `w`
- Physical device: Scan QR code with Expo Go app

## API Configuration

Both applications are configured to connect to the backend API at `http://localhost:8000` by default.

**Web**: Update `VITE_API_BASE_URL` in `.env` file
**Mobile**: Update `API_BASE_URL` in `src/utils/constants.js`

## Available Scripts

### Web App
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Mobile App
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## Architecture

Both applications follow clean architecture principles:

- **Components**: Reusable UI components
- **Pages/Screens**: Page-level components
- **Services**: API integration layer
- **Store**: State management with Zustand
- **Utils**: Helper functions and constants
- **Navigation**: Routing configuration

## Authentication Flow

1. User selects role (Student/Faculty for users, Admin/Librarian for admins)
2. Enters credentials (ID + password for users, email + access key for admins)
3. Receives OTP via email (and SMS for users)
4. Verifies OTP to complete login
5. Redirected to role-based dashboard

## Role-Based Access

- **Students**: Browse books, view borrowed books, manage profile
- **Faculty**: Same as students with additional faculty features
- **Librarians**: Manage books, view users, generate reports
- **Admins**: Full system access including user management and settings

## Development Guidelines

- Follow DRY (Don't Repeat Yourself) principles
- Keep components small and focused
- Use proper TypeScript/PropTypes for type safety
- Write meaningful commit messages
- Test on multiple devices/screen sizes

## Troubleshooting

### Web App
- If Tailwind styles don't apply, ensure PostCSS is configured correctly
- Clear browser cache if hot reload isn't working
- Check browser console for errors

### Mobile App
- Clear Expo cache: `expo start -c`
- Ensure Node.js version is compatible (20.19.4+)
- Check that all peer dependencies are installed

## Support

For issues or questions:
1. Check existing documentation
2. Review error logs
3. Contact the development team

## License

Copyright © 2024 PortLib. All Rights Reserved.

