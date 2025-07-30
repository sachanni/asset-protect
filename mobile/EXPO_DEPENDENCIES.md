# Required Expo Dependencies

The error you're seeing indicates that your Expo project is missing required React Native Web dependencies. Here's how to fix it:

## Install Missing Dependencies

Run these commands in your PosthumousNotificationApp folder:

```bash
# Core React Native Web dependencies
npx expo install react-native-web

# Navigation dependencies
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/stack

# Required peer dependencies for navigation
npx expo install react-native-screens react-native-safe-area-context

# AsyncStorage for data persistence
npx expo install @react-native-async-storage/async-storage

# Vector icons for Expo
npx expo install @expo/vector-icons

# Additional React Native dependencies
npx expo install react-native-gesture-handler react-native-reanimated
```

## Your package.json should include:

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "~18.3.0",
    "react-native": "~0.76.0",
    "react-native-web": "~0.19.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-screens": "~3.34.0",
    "react-native-safe-area-context": "^4.11.0",
    "@react-native-async-storage/async-storage": "^1.23.0",
    "@expo/vector-icons": "^14.0.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0"
  }
}
```

## Quick Fix Process:

1. **Install dependencies:**
   ```bash
   cd PosthumousNotificationApp
   npx expo install react-native-web @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage @expo/vector-icons react-native-gesture-handler react-native-reanimated
   ```

2. **Copy all files from this Replit mobile folder to your PosthumousNotificationApp folder**

3. **Update the two files for Expo:**
   - Change `import Icon from 'react-native-vector-icons/MaterialIcons'` to `import { MaterialIcons } from '@expo/vector-icons'` in MainNavigator.tsx
   - Change `const API_BASE_URL = 'http://localhost:5000'` to `const API_BASE_URL = 'http://192.168.1.33:5000'` in api.ts

4. **Clear cache and restart:**
   ```bash
   npx expo start --clear
   ```

This will resolve the "Unable to resolve react-native-web" error and get your complete posthumous notification mobile app running on web, Android, and iOS platforms.