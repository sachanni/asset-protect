# Expo Alternative Setup (Recommended for Easier APK/IPA)

## Why Use Expo?

Expo is more reliable than React Native CLI and makes APK/IPA generation much easier. Perfect for your posthumous notification system app.

## Complete Expo Setup

### Step 1: Install Expo CLI
```powershell
npm install -g @expo/cli
```

### Step 2: Create Project
```powershell
cd D:\personal\aulnova\dev\repo-native\asset-protect\

npx create-expo-app PosthumousNotificationApp --template typescript

cd PosthumousNotificationApp
```

### Step 3: Install Navigation Dependencies
```powershell
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

### Step 4: Install Other Dependencies
```powershell
npm install @react-native-async-storage/async-storage react-hook-form

# For icons (Expo has built-in icons)
npx expo install expo-vector-icons
```

## Key Differences for Your Mobile App

### Icons Update
Replace `react-native-vector-icons` imports with Expo icons:

```typescript
// Instead of:
import Icon from 'react-native-vector-icons/MaterialIcons';

// Use:
import { MaterialIcons } from '@expo/vector-icons';

// Usage:
<MaterialIcons name="dashboard" size={24} color="blue" />
```

### AsyncStorage Import
```typescript
// Same as before:
import AsyncStorage from '@react-native-async-storage/async-storage';
```

## Copy Your App Files

Follow the same COPY_THESE_FILES.md guide, but make these small changes:

### 1. Update MainNavigator.tsx
```typescript
// Replace the icon import:
import { MaterialIcons } from '@expo/vector-icons';

// Update the icon component:
return <MaterialIcons name={iconName} size={size} color={color} />;
```

### 2. Update API Configuration
Same as before - update your IP address in `src/services/api.ts`

## Testing Your App

### Run on Android Emulator/Device
```powershell
npx expo start

# Then press 'a' for Android or scan QR code with Expo Go app
```

### Run on iOS Simulator (macOS only)
```powershell
npx expo start

# Then press 'i' for iOS simulator
```

## Building APK/IPA (Much Easier with Expo!)

### Setup EAS Build
```powershell
npm install -g @expo/cli

npx expo login
# Create account at expo.dev if needed

npx eas build:configure
```

### Build Android APK
```powershell
# Build APK for testing
npx eas build --platform android --profile preview

# Build AAB for Google Play Store
npx eas build --platform android --profile production
```

### Build iOS IPA (macOS only)
```powershell
npx eas build --platform ios --profile production
```

## Advantages for Your App

### 1. Easier Development
- No Android Studio setup required for basic development
- Instant testing with Expo Go app
- Hot reloading works perfectly

### 2. Simpler Building
- Cloud-based building (no local Android Studio needed)
- Automatic signing and certificates
- Direct app store publishing tools

### 3. Better Debugging
- Excellent error messages
- Built-in debugging tools
- Network inspector

## Your App Features with Expo

All your features will work exactly the same:
✅ Authentication (Welcome, Login, Register)
✅ Dashboard with statistics
✅ Asset management
✅ Nominee management  
✅ Mood tracking
✅ Profile management
✅ Admin panel access
✅ MongoDB backend integration

## File Structure After Setup

```
PosthumousNotificationApp/
├── app.json         (Expo configuration)
├── App.tsx          (main app)
├── package.json     (dependencies)
├── src/            (your app files)
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   └── services/
├── assets/         (images, fonts)
└── node_modules/   (dependencies)
```

## Publishing to App Stores

### Google Play Store
```powershell
npx eas submit --platform android
```

### Apple App Store
```powershell
npx eas submit --platform ios
```

Expo handles all the complex parts of app store submission automatically!

## Migration from React Native CLI

If you already have a React Native CLI project that's having issues, you can:

1. Create new Expo project
2. Copy your `src/` folder
3. Update icon imports
4. Test and build

This approach often solves template and setup issues while providing better tooling for APK/IPA generation.