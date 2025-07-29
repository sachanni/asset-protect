# Mobile App Files to Copy

Since you're setting up React Native on your local Windows machine, you'll need to manually copy these files from this Replit project to your local PosthumousNotificationApp project.

## File Structure to Create

```
PosthumousNotificationApp/
├── App.tsx (replace default)
└── src/
    ├── context/
    │   ├── AuthContext.tsx
    │   └── ApiContext.tsx
    ├── services/
    │   └── api.ts
    ├── navigation/
    │   ├── AuthNavigator.tsx
    │   └── MainNavigator.tsx
    ├── hooks/
    │   └── useAuth.ts
    ├── screens/
    │   ├── LoadingScreen.tsx
    │   ├── auth/
    │   │   ├── WelcomeScreen.tsx
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   └── main/
    │       ├── DashboardScreen.tsx
    │       ├── ProfileScreen.tsx
    │       ├── AssetsScreen.tsx
    │       └── AddAssetScreen.tsx
```

## How to Copy Files

### Method 1: Manual Copy (Recommended)
1. Open each file in this Replit project (click on the file in the file explorer)
2. Copy the entire content
3. Create the corresponding file in your local React Native project
4. Paste the content

### Method 2: Download Files
1. Right-click each file in this Replit project
2. Select "Download" (if available)
3. Save to your local project structure

## Critical File to Update

**IMPORTANT:** After copying `src/services/api.ts`, update the IP address:

```typescript
// Change this line in api.ts:
const API_BASE_URL = 'http://localhost:5000';

// To your Windows machine's IP address:
const API_BASE_URL = 'http://192.168.1.XXX:5000'; // Your actual IP
```

Find your IP with: `ipconfig | findstr "IPv4"`

## Files Summary

### Core Files (must copy):
1. **App.tsx** - Main app component with navigation
2. **AuthContext.tsx** - Authentication state management
3. **api.ts** - Backend API communication
4. **AuthNavigator.tsx** - Authentication flow navigation
5. **MainNavigator.tsx** - Main app navigation with tabs

### Screen Files:
6. **WelcomeScreen.tsx** - App introduction screen
7. **LoginScreen.tsx** - User login screen
8. **RegisterScreen.tsx** - User registration screen
9. **DashboardScreen.tsx** - Main dashboard with stats
10. **ProfileScreen.tsx** - User profile management

### Additional Features:
11. **AssetsScreen.tsx** - Asset management list
12. **AddAssetScreen.tsx** - Add new asset form
13. **LoadingScreen.tsx** - Loading state component

## Order of Operations

1. **First:** Copy core files (App.tsx, contexts, services)
2. **Second:** Copy navigation files
3. **Third:** Copy screen files
4. **Fourth:** Update API configuration with your IP
5. **Fifth:** Test the app

## Dependencies Required

Make sure you've installed all dependencies in your local project:

```cmd
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage react-native-vector-icons react-hook-form
```

## Expected Features After Setup

Your mobile app will have:
- ✅ Authentication (Welcome, Login, Register)
- ✅ Dashboard with statistics and quick actions
- ✅ Asset management (view and add assets)
- ✅ Profile management with logout
- ✅ Bottom tab navigation
- ✅ Real backend integration with your MongoDB database
- ✅ Admin panel access (for admin users)

The app will be ready for APK generation and app store distribution!