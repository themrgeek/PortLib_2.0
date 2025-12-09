# PortLib - Smart Library Management

A React Native mobile application for smart library management built with Expo and TypeScript.

## Features

- **Authentication System**
  - Login screen with email/phone and password
  - Social login (Google, Apple)
  - Sign-up flow with 2-step verification
  - OTP verification

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your preferred platform:
- iOS: Press `i` in the terminal or scan QR code with Expo Go app
- Android: Press `a` in the terminal or scan QR code with Expo Go app
- Web: Press `w` in the terminal

## Project Structure

```
portlib-frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   ├── InputField.tsx
│   │   └── ProgressDots.tsx
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   └── SignUpScreen.tsx
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   └── theme/            # Theme configuration
│       └── colors.ts
├── App.tsx               # Main app component
├── package.json
└── tsconfig.json
```

## Design Specifications

All design specifications follow the provided wireframes:
- Primary Color: #2563EB
- Background: #FFFFFF
- Text Colors: #333333 (primary), #666666 (secondary)
- Border Colors: #E0E0E0 (inactive), #2563EB (active)
- Error Color: #DC2626

## License

Private project - All rights reserved

