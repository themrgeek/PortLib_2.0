# PortLib Mobile Application

React Native mobile application built with Expo for the PortLib Smart Library Management System.

## Features

- 🔐 Secure authentication with OTP verification
- 📊 Role-based dashboard with statistics
- 👤 User profile management
- 📱 Beautiful mobile-first design
- 🎨 Material Design UI with React Native Paper
- 🚀 Expo for easy development and deployment

## Prerequisites

- Node.js 20.19.4 or higher
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- For iOS: macOS with Xcode
- For Android: Android Studio with emulator

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Update API endpoint in `src/utils/constants.js`:

```javascript
export const API_BASE_URL = 'http://localhost:8000'; // Update with your API URL
```

**Note**: For testing on physical devices, use your computer's local IP address instead of localhost.

## Development

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Using Expo Go App

1. Install Expo Go on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code shown in the terminal or browser

## Project Structure

```
src/
├── assets/          # Images, icons
├── components/
│   ├── common/      # Reusable components
│   └── auth/        # Authentication components
├── screens/
│   ├── Auth/        # Login, Signup, OTP screens
│   ├── Dashboard/   # Dashboard screen
│   └── Profile/     # Profile screen
├── navigation/
│   └── AppNavigator.jsx  # Navigation configuration
├── services/
│   ├── api.js       # Axios instance
│   └── auth.service.js  # Authentication API
├── store/
│   └── authStore.js # Authentication state
└── utils/
    ├── constants.js # Application constants
    └── helpers.js   # Helper functions
```

## Available Screens

### Authentication Flow
- **SplashScreen**: Animated splash with logo and loading
- **UserLoginScreen**: Login for Students and Faculty
- **AdminLoginScreen**: Login for Admins and Librarians
- **VerifyOTPScreen**: OTP verification for all users

### Authenticated Screens
- **DashboardScreen**: Main dashboard with statistics and quick actions
- **ProfileScreen**: User profile view and edit

## Navigation Structure

```
AppNavigator (Stack)
├── Splash
├── Login (UserLoginScreen)
├── AdminLogin
├── VerifyOTP
└── Dashboard (Bottom Tabs)
    ├── Home (DashboardScreen)
    └── Profile (ProfileScreen)
```

## Technologies Used

- **React Native**: Mobile framework
- **Expo**: Development platform
- **React Native Paper**: Material Design components
- **React Navigation v6**: Navigation library
- **Zustand**: State management
- **Axios**: HTTP client
- **Formik**: Form management
- **Yup**: Schema validation
- **AsyncStorage**: Local data persistence

## State Management

The application uses Zustand with AsyncStorage persistence:

- **authStore**: User authentication, profile, and token management

## API Integration

All API calls use Axios with interceptors for:
- Automatic token injection
- Error handling
- Network request/response logging in development

## Form Validation

Forms are validated using Formik with Yup schemas:
- Real-time validation
- Clear error messages
- Touch-based validation
- Submit-blocking on errors

## Building for Production

### Android

```bash
# Build APK
eas build --platform android

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for iOS
eas build --platform ios

# Build for App Store
eas build --platform ios --profile production
```

**Note**: You'll need to configure EAS Build. Run `eas build:configure` first.

## App Configuration

Edit `app.json` to configure:
- App name and slug
- Version
- Icons and splash screen
- Bundle identifiers
- Permissions

## Styling

The app uses:
- **React Native Paper** for pre-built components
- **StyleSheet** for custom styling
- **Inline styles** for dynamic styling

### Color Scheme

```javascript
primary: '#2196f3'
secondary: '#1976d2'
success: '#4caf50'
error: '#f44336'
warning: '#ff9800'
```

## Platform-Specific Code

Use Platform module for platform-specific functionality:

```javascript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { paddingTop: 20 },
      android: { paddingTop: 0 },
    }),
  },
});
```

## Performance Optimization

- Lazy loading of screens
- Memoization of expensive components
- Optimized images with proper resolutions
- FlatList for large lists
- Debounced search inputs

## Troubleshooting

### Metro bundler issues
```bash
# Clear cache and restart
expo start -c
```

### Module resolution errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Android build fails
- Ensure ANDROID_HOME is set
- Update Android SDK tools
- Check gradle configuration

### iOS build fails
- Update CocoaPods: `pod repo update`
- Clean build: `cd ios && pod install && cd ..`
- Check Xcode version compatibility

### Network requests failing
- Use your computer's IP instead of localhost
- Ensure device and computer are on same network
- Check firewall settings

## Testing on Devices

### Android
1. Enable USB debugging on your device
2. Connect via USB
3. Run `npm run android`

### iOS
1. Connect iPhone to Mac
2. Trust the computer on device
3. Run `npm run ios`

## Debugging

- **React Native Debugger**: Use standalone debugging tool
- **Expo Dev Tools**: Browser-based debugging
- **Console Logs**: Check terminal output
- **Network Inspector**: Monitor API calls

## Publishing

### Expo Go (Development)
```bash
expo publish
```

### Standalone App
```bash
# Configure EAS
eas build:configure

# Build for stores
eas build --platform all
eas submit --platform all
```

## License

Copyright © 2024 PortLib. All Rights Reserved.

