# Windows Local Setup for React Native APK

## Important: Run This on Your Local Windows Machine

**Note:** The React Native setup must be done on your local Windows machine (D:\personal\aulnova\dev\repo-native\asset-protect\), not in this Replit environment.

## Step 1: Prerequisites (Windows)

### Install Node.js
1. Download Node.js 18+ from: https://nodejs.org/
2. Install and verify:
```cmd
node --version
npm --version
```

### Install React Native CLI
```cmd
npm install -g @react-native-community/cli
```

### Install Android Studio
1. Download from: https://developer.android.com/studio
2. During installation, ensure these are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. Set up environment variables in Windows:
   - Add to System Environment Variables:
   ```
   ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   ```
   - Add to Path:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

## Step 2: Create React Native Project (On Your Windows Machine)

Open Command Prompt or PowerShell in your local directory:

```cmd
cd D:\personal\aulnova\dev\repo-native\asset-protect\

npx react-native init PosthumousNotificationApp --template react-native-template-typescript

cd PosthumousNotificationApp
```

**If this fails, try:**
```cmd
npx @react-native-community/cli init PosthumousNotificationApp --template react-native-template-typescript
```

## Step 3: Download Mobile App Files

Since you can't copy files directly from Replit, I'll help you download them:

### Option 1: Download individual files
Create these folders and files in your PosthumousNotificationApp directory:

1. **Create folder structure:**
```cmd
mkdir src
mkdir src\context
mkdir src\navigation
mkdir src\screens
mkdir src\screens\auth
mkdir src\screens\main
mkdir src\services
mkdir src\hooks
```

2. **Copy the files from this Replit project:**
   - Download each file from the mobile/src folder
   - Copy the exact content I created for you

### Option 2: Use Git (if you have access)
If this Replit project is connected to Git, you can clone it locally and copy the mobile folder.

## Step 4: Install Dependencies

```cmd
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage react-native-vector-icons react-hook-form
```

## Step 5: Configure Project

### Add Vector Icons to Android
Edit `android\app\build.gradle` and add at the bottom:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Update API Configuration
Find your Windows machine's IP address:
```cmd
ipconfig | findstr "IPv4"
```

Edit `src\services\api.ts` and update:
```typescript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
```

## Step 6: Test the App

### Start Metro Bundler
```cmd
npx react-native start
```

### Run on Android (in another terminal)
```cmd
npx react-native run-android
```

## Step 7: Build APK

### Debug APK
```cmd
cd android
gradlew assembleDebug
```
APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

### Release APK
1. Generate keystore:
```cmd
cd android\app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure `android\gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=yourpassword
MYAPP_UPLOAD_KEY_PASSWORD=yourpassword
```

3. Build release:
```cmd
cd android
gradlew assembleRelease
```
APK location: `android\app\build\outputs\apk\release\app-release.apk`

## Files You Need to Copy

Here are the key files to recreate in your local project:

### App.tsx (replace the default one)
```typescript
// Copy the content from mobile/App.tsx in this Replit project
```

### Main Files to Copy:
- `src/context/AuthContext.tsx`
- `src/context/ApiContext.tsx`
- `src/services/api.ts`
- `src/navigation/AuthNavigator.tsx`
- `src/navigation/MainNavigator.tsx`
- `src/hooks/useAuth.ts`
- `src/screens/LoadingScreen.tsx`
- `src/screens/auth/WelcomeScreen.tsx`
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/RegisterScreen.tsx`
- `src/screens/main/DashboardScreen.tsx`
- `src/screens/main/ProfileScreen.tsx`
- `src/screens/main/AssetsScreen.tsx`
- `src/screens/main/AddAssetScreen.tsx`

## Common Windows Issues

### If React Native CLI fails:
```cmd
npm cache clean --force
npm install -g @react-native-community/cli@latest
```

### If Android build fails:
```cmd
cd android
gradlew clean
cd ..
npx react-native run-android
```

### If Metro bundler fails:
```cmd
npx react-native start --reset-cache
```

## Your Backend Server

Make sure your Node.js backend is running on your Windows machine:
1. Navigate to your backend project directory
2. Run: `npm run dev`
3. Ensure it's accessible on your local network IP (not just localhost)

Your mobile app will connect to this backend and provide the same functionality as your web version!