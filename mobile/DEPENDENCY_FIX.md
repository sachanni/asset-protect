# Fix for React Navigation Dependency Conflicts

## The Problem
React Native 0.80+ requires React 19, but React Navigation expects React 18. This creates version conflicts.

## Solution 1: Install with Legacy Peer Deps (Quick Fix)

```powershell
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage react-native-vector-icons react-hook-form --legacy-peer-deps
```

## Solution 2: Install Compatible Versions (Recommended)

```powershell
# Install React Navigation with compatible versions
npm install @react-navigation/native@^6.1.7 @react-navigation/stack@^6.3.17 @react-navigation/bottom-tabs@^6.5.8

# Install React Native specific dependencies
npm install react-native-screens@^3.22.1 react-native-safe-area-context@^4.7.1 react-native-gesture-handler@^2.12.1 react-native-reanimated@^3.3.0

# Install other dependencies
npm install @react-native-async-storage/async-storage@^1.19.1 react-native-vector-icons@^10.0.0 react-hook-form@^7.45.2 --legacy-peer-deps
```

## Solution 3: Downgrade React Native (Most Stable)

If you're getting too many conflicts, use an older stable version:

```powershell
# Delete current project if it has issues
# Create new project with older template
npx @react-native-community/cli@latest init PosthumousNotificationApp --template react-native-template-typescript@0.72.6

cd PosthumousNotificationApp

# Install dependencies (should work without conflicts)
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage react-native-vector-icons react-hook-form
```

## Solution 4: Use Expo (Eliminates All Conflicts)

The most reliable approach:

```powershell
npm install -g @expo/cli

npx create-expo-app PosthumousNotificationApp --template typescript

cd PosthumousNotificationApp

# Install navigation (Expo manages compatibility)
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Install Expo-managed dependencies
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Install other dependencies
npm install @react-native-async-storage/async-storage react-hook-form
npx expo install expo-vector-icons
```

## Check Your Current Setup

First, check what you have:

```powershell
# Check your package.json
type package.json

# Check React versions
npm list react react-native
```

## After Successful Installation

Verify everything installed correctly:

```powershell
# Check installed packages
npm list @react-navigation/native

# Test the project
npx react-native start
# Or for Expo:
npx expo start
```

## Working Package.json Dependencies

Here's what should work for React Native 0.73:

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.2",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17", 
    "@react-navigation/bottom-tabs": "^6.5.8",
    "react-native-screens": "^3.22.1",
    "react-native-safe-area-context": "^4.7.1",
    "react-native-gesture-handler": "^2.12.1",
    "react-native-reanimated": "^3.3.0",
    "@react-native-async-storage/async-storage": "^1.19.1",
    "react-native-vector-icons": "^10.0.0",
    "react-hook-form": "^7.45.2"
  }
}
```

## My Recommendation

**Use Solution 4 (Expo)** because:
- Eliminates all dependency conflicts
- Easier APK/IPA generation
- Better developer experience
- Automatic compatibility management

Your posthumous notification system will work perfectly with Expo and be much easier to build and deploy.