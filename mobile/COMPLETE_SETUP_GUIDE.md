# Complete React Native Setup for APK/IPA Generation

## Step 1: Create New React Native Project

First, you need to create a complete React Native project structure:

```bash
# Navigate to your development directory
cd D:\personal\aulnova\dev\repo-native\asset-protect\

# Create new React Native project with TypeScript
npx react-native init PosthumousNotificationApp --template react-native-template-typescript

# Navigate to the new project
cd PosthumousNotificationApp
```

## Step 2: Install Required Dependencies

```bash
# Navigation dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# React Native specific dependencies
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Storage and utilities
npm install @react-native-async-storage/async-storage react-native-vector-icons

# Form handling
npm install react-hook-form

# For iOS (if you plan to build for iOS)
cd ios && pod install && cd ..
```

## Step 3: Copy Your App Files

Copy all the files from your current `mobile/src` folder to the new project:

```bash
# Copy the source files
cp -r ../mobile/src ./
cp ../mobile/App.tsx ./

# Or manually copy these folders/files:
# - mobile/src/ → PosthumousNotificationApp/src/
# - mobile/App.tsx → PosthumousNotificationApp/App.tsx
```

## Step 4: Configure Vector Icons (Android)

Add this line to `android/app/build.gradle` at the bottom:

```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## Step 5: Update API Configuration

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # Should show something like: IPv4 Address. . . . . . . . . . . : 192.168.1.100
   ```

2. **Update the API base URL:**
   Edit `src/services/api.ts` and replace:
   ```typescript
   const API_BASE_URL = 'http://localhost:5000';
   ```
   with your actual IP:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:5000'; // Use your actual IP
   ```

## Step 6: Test the App

```bash
# Start Metro bundler
npx react-native start

# In another terminal, run the app
npx react-native run-android
```

## Step 7: Build APK for Distribution

### Debug APK (for testing):
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution):

1. **Generate signing key:**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing in `android/gradle.properties`:**
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=yourpassword
MYAPP_UPLOAD_KEY_PASSWORD=yourpassword
```

3. **Update `android/app/build.gradle`:**
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

4. **Build release APK:**
```bash
cd android
./gradlew assembleRelease
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Step 8: Build IPA (macOS only)

1. **Open iOS project:**
```bash
open ios/PosthumousNotificationApp.xcworkspace
```

2. **Configure signing in Xcode:**
   - Select project → Signing & Capabilities
   - Choose your Apple Developer team
   - Set bundle identifier

3. **Archive and export:**
   - Product → Archive
   - Export IPA for distribution

## Quick Start Script

Save this as `setup.bat` for Windows or `setup.sh` for Mac/Linux:

```bash
@echo off
echo Creating React Native project...
npx react-native init PosthumousNotificationApp --template react-native-template-typescript

cd PosthumousNotificationApp

echo Installing dependencies...
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage react-native-vector-icons react-hook-form

echo Setup complete! 
echo 1. Copy your src folder and App.tsx
echo 2. Update IP address in src/services/api.ts
echo 3. Run: npx react-native run-android
```

## Features Ready in Your Mobile App

✅ **Authentication System**
- Welcome screen with app introduction
- Login with existing credentials
- Registration for new users
- Admin access with special credentials

✅ **Main Navigation**
- Bottom tab navigation (Dashboard, Assets, Nominees, Mood, Profile)
- Stack navigation for detailed screens

✅ **Core Features**
- Dashboard with statistics and quick actions
- Asset management (view, add assets)
- Nominee management (view, add nominees)
- Mood tracking with emoji selection
- Profile management with admin panel access
- Wellness settings configuration

✅ **Backend Integration**
- Connects to your MongoDB backend
- Real authentication and data storage
- Admin panel functionality for admin users

## Troubleshooting

**If you get "Android project not found":**
- Make sure you're in the correct project directory
- Ensure android/ folder exists
- Run `npx react-native doctor` to check setup

**If Metro bundler fails:**
```bash
npx react-native start --reset-cache
```

**If Android build fails:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

Your posthumous notification system will be ready for both Android and iOS distribution after following these steps!