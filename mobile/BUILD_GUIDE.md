# Building APK and IPA Files

## Prerequisites Complete Setup

### 1. Development Environment Setup

**For Android (APK):**
- Android Studio installed with SDK
- Environment variables configured
- Virtual device or physical Android device

**For iOS (IPA - macOS only):**
- Xcode installed with latest version
- Apple Developer account (for distribution)
- iOS device or simulator

### 2. Project Setup Verification

```bash
# Verify React Native installation
npx react-native --version

# Verify project dependencies
cd PosthumousNotificationApp
npm install

# For iOS additional setup
cd ios && pod install && cd ..
```

## Building Android APK

### Method 1: Debug APK (for testing)

```bash
# Generate debug APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Release APK (for distribution)

1. **Generate Signing Key:**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Gradle Variables:**
Create `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

3. **Update android/app/build.gradle:**
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

4. **Build Release APK:**
```bash
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## Building iOS IPA

### Method 1: Development Build

```bash
# Build for simulator
npx react-native run-ios

# Build for device
npx react-native run-ios --device
```

### Method 2: Production IPA

1. **Open in Xcode:**
```bash
open ios/PosthumousNotificationApp.xcworkspace
```

2. **Configure Signing:**
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Select your Apple Developer team
   - Choose appropriate provisioning profile

3. **Archive the App:**
   - Product → Archive
   - Wait for archive to complete
   - Organizer window will open

4. **Export IPA:**
   - Select your archive
   - Click "Distribute App"
   - Choose distribution method:
     - **App Store Connect** (for App Store)
     - **Ad Hoc** (for testing on specific devices)
     - **Enterprise** (for internal distribution)
     - **Development** (for development devices)

## App Store Distribution

### Android - Google Play Store

1. **Create Google Play Console Account:**
   - Visit play.google.com/console
   - Pay one-time $25 registration fee

2. **Upload APK:**
   - Create new app in Play Console
   - Upload your release APK
   - Fill in app details, screenshots, descriptions
   - Set pricing and distribution

3. **Review Process:**
   - Google reviews typically take 1-3 days
   - Address any policy violations if flagged

### iOS - Apple App Store

1. **Apple Developer Account:**
   - Annual $99 fee required
   - Register at developer.apple.com

2. **App Store Connect:**
   - Create app record
   - Upload IPA via Xcode or Application Loader
   - Fill in app information, screenshots, descriptions

3. **Review Process:**
   - Apple review typically 1-7 days
   - Stricter guidelines than Google Play
   - May require multiple submissions

## Testing Your Builds

### Android APK Testing

```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or drag and drop APK onto emulator
```

### iOS IPA Testing

1. **TestFlight (recommended):**
   - Upload to App Store Connect
   - Add internal/external testers
   - Distribute via TestFlight app

2. **Direct Install:**
   - Requires development provisioning profile
   - Install via Xcode or third-party tools

## Backend Considerations

### Production Server Setup

Your mobile app will need to connect to a production server:

1. **Deploy Backend:**
   - Use services like Railway, Render, or DigitalOcean
   - Ensure HTTPS is enabled
   - Update CORS settings for mobile app

2. **Update API Configuration:**
   ```typescript
   // In mobile/src/services/api.ts
   const API_BASE_URL = 'https://your-production-server.com';
   ```

3. **Environment Configuration:**
   - Create different configs for development/production
   - Use environment variables or config files

## File Sizes and Optimization

### Android APK Optimization

```gradle
// In android/app/build.gradle
android {
    ...
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
}
```

### iOS IPA Optimization

- Enable bitcode in Xcode build settings
- Use appropriate deployment target
- Optimize images and assets

## Troubleshooting Build Issues

### Common Android Issues

```bash
# Clean project
cd android && ./gradlew clean && cd ..

# Reset Metro cache
npx react-native start --reset-cache

# Rebuild
npx react-native run-android
```

### Common iOS Issues

```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..

# Rebuild
npx react-native run-ios
```

## Final APK/IPA Locations

**Android APK:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

**iOS IPA:**
- Generated through Xcode Archive process
- Location varies based on export method
- Typically in `~/Library/Developer/Xcode/Archives/`

Your posthumous notification system mobile apps are now ready for distribution on both Google Play Store and Apple App Store!