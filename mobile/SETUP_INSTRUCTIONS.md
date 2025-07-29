# React Native Mobile App Setup

## Complete Step-by-Step Setup Guide

### 1. Prerequisites Installation

#### Install Node.js
```bash
# Download and install Node.js 18+ from nodejs.org
node --version  # Should show v18+
npm --version   # Should show npm version
```

#### Install React Native CLI
```bash
npm install -g @react-native-community/cli
```

### 2. Platform-Specific Setup

#### For Android Development:
1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - During installation, make sure to install Android SDK, Android SDK Platform, and Android Virtual Device

2. **Setup Environment Variables**
   ```bash
   # Add to your ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   export ANDROID_HOME=$HOME/Android/Sdk          # Linux
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Create Virtual Device**
   - Open Android Studio → AVD Manager → Create Virtual Device
   - Choose a device (Pixel 4 recommended)
   - Download and select a system image (API 30+ recommended)

#### For iOS Development (macOS only):
1. **Install Xcode**
   - Download from Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

### 3. Create New React Native Project

```bash
# Create new project
npx react-native init PosthumousNotificationApp --template react-native-template-typescript

# Navigate to project
cd PosthumousNotificationApp
```

### 4. Install Required Dependencies

```bash
# Navigation dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# React Native dependencies for navigation
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Storage and icons
npm install @react-native-async-storage/async-storage react-native-vector-icons

# Form handling
npm install react-hook-form

# For iOS (skip if you don't need iOS)
cd ios && pod install && cd ..
```

### 5. Copy Mobile App Files

1. Copy all files from the `mobile/src` folder to your project's `src` folder
2. Replace your `App.tsx` with the provided mobile `App.tsx`
3. Copy `package.json` dependencies to your project's `package.json`

### 6. Configure Android Icons (if using vector icons)

Add this to `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### 7. Update Backend Configuration

1. **Find your computer's IP address:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr "IPv4"
   ```

2. **Update API configuration:**
   - Open `src/services/api.ts`
   - Replace `http://localhost:5000` with `http://YOUR_IP_ADDRESS:5000`
   - Example: `http://192.168.1.100:5000`

3. **Update your backend server:**
   - Make sure your Node.js server accepts connections from your IP
   - Update CORS settings if needed

### 8. Run the Application

#### Start your backend server first:
```bash
# In your backend project directory
npm run dev
```

#### Run React Native app:

**For Android:**
```bash
# Start Metro bundler
npx react-native start

# In another terminal, run Android app
npx react-native run-android
```

**For iOS (macOS only):**
```bash
# Start Metro bundler
npx react-native start

# In another terminal, run iOS app
npx react-native run-ios
```

### 9. Testing the App

1. **Welcome Screen**: Should show the app introduction
2. **Login**: Use your existing credentials or admin credentials
3. **Registration**: Create a new account
4. **Dashboard**: View your assets, nominees, and mood data
5. **Navigation**: Test all tabs (Dashboard, Assets, Nominees, Mood, Profile)

### 10. Building for Production

#### Android APK:
```bash
cd android
./gradlew assembleRelease
# APK will be in: android/app/build/outputs/apk/release/
```

#### iOS (requires Apple Developer account):
1. Open `ios/PosthumousNotificationApp.xcworkspace` in Xcode
2. Select your team and provisioning profile
3. Archive and upload to App Store Connect

### 11. Troubleshooting

#### Common Issues:

**Metro bundler not starting:**
```bash
npx react-native start --reset-cache
```

**Android build errors:**
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

**iOS build errors:**
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

**Network connection issues:**
- Ensure your phone/emulator is on the same network as your development machine
- Check firewall settings
- Verify the IP address in API configuration

### 12. Features Implemented

✅ **Authentication**: Login, Registration, Admin access
✅ **Navigation**: Bottom tabs with stack navigation
✅ **Dashboard**: Overview of assets, nominees, mood tracking
✅ **Asset Management**: Add, view, manage digital assets
✅ **Nominee Management**: Add, view trusted contacts
✅ **Mood Tracking**: Log and view emotional states
✅ **Admin Panel**: Administrative functions (for admin users)
✅ **Offline Storage**: AsyncStorage for local data
✅ **Responsive Design**: Works on various screen sizes

Your React Native app is now ready to run on both Android and iOS devices!