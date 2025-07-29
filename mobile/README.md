# Posthumous Notification System - React Native

This is the React Native version of your posthumous notification system, supporting both Android and iOS platforms.

## Prerequisites

- Node.js (v18 or higher)
- React Native CLI or Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup Options

### Option 1: Expo (Recommended for Beginners)
```bash
npm install -g @expo/cli
npx create-expo-app PosthumousNotificationApp --template typescript
cd PosthumousNotificationApp
```

### Option 2: React Native CLI (More Control)
```bash
npm install -g @react-native-community/cli
npx react-native init PosthumousNotificationApp --template react-native-template-typescript
cd PosthumousNotificationApp
```

## Installation

1. Copy the mobile folder contents to your React Native project
2. Install dependencies:
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install react-hook-form
npm install axios
```

3. For iOS (if using React Native CLI):
```bash
cd ios && pod install
```

## Backend Integration

Your existing Node.js/Express/MongoDB backend can be used as-is. The mobile app will communicate with it via REST APIs.

Make sure to:
1. Update CORS settings to allow mobile app requests
2. Use your server's IP address instead of localhost
3. Ensure your MongoDB Atlas connection is accessible

## Key Differences from Web Version

### Navigation
- Uses React Navigation instead of Wouter
- Stack navigation for main flow
- Tab navigation for authenticated sections

### Styling
- Uses StyleSheet instead of Tailwind CSS
- Responsive design for different screen sizes
- Native mobile UI patterns

### Storage
- AsyncStorage instead of browser localStorage
- Secure storage for sensitive data

### Components
- Native mobile components (TouchableOpacity, ScrollView, etc.)
- Platform-specific styling (iOS vs Android)

## Features Implemented

✅ User Registration & Authentication
✅ Asset Management
✅ Nominee Management  
✅ Mood Tracking
✅ Admin Panel (for admin users)
✅ Well-being Alerts
✅ Offline Capability (with AsyncStorage)

## Running the App

### Expo
```bash
npm start
# Then use Expo Go app to scan QR code
```

### React Native CLI
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

## Building for Production

### Expo
```bash
eas build --platform android
eas build --platform ios
```

### React Native CLI
```bash
# Android APK
cd android && ./gradlew assembleRelease

# iOS (requires Apple Developer account)
# Use Xcode to archive and upload to App Store
```