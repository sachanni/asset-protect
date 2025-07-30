# Files to Copy to Your Expo Project

## The Error You're Seeing
`Unable to resolve "../screens/main/NomineesScreen"` means the screen files weren't copied to your Expo project.

## Copy These Files Exactly

From this Replit `mobile/` folder to your `PosthumousNotificationApp/` folder:

### 1. Main App File
```
mobile/App.tsx → PosthumousNotificationApp/App.tsx
```

### 2. Source Folder Structure
Copy the entire `src` folder:
```
mobile/src/ → PosthumousNotificationApp/src/

This includes all these files:
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ApiContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── screens/
│   │   ├── LoadingScreen.tsx
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   └── main/
│   │       ├── DashboardScreen.tsx
│   │       ├── AssetsScreen.tsx
│   │       ├── NomineesScreen.tsx
│   │       ├── MoodTrackingScreen.tsx
│   │       ├── AdminPanelScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── AddAssetScreen.tsx
│   │       ├── AddNomineeScreen.tsx
│   │       └── WellnessSettingsScreen.tsx
```

## After Copying Files

### 3. Update MainNavigator.tsx
In `src/navigation/MainNavigator.tsx`, change line 4:
```typescript
// Change from:
import Icon from 'react-native-vector-icons/MaterialIcons';

// Change to:
import { MaterialIcons } from '@expo/vector-icons';

// Also update the TabIcon function (around line 100):
function TabIcon({ iconName, size = 24, color }: { iconName: string, size?: number, color: string }) {
  return <MaterialIcons name={iconName as any} size={size} color={color} />;
}
```

### 4. Update API Configuration
In `src/services/api.ts`, change line 2:
```typescript
// Find your Windows IP: ipconfig | findstr "IPv4"

// Change from:
const API_BASE_URL = 'http://localhost:5000';

// Change to:
const API_BASE_URL = 'http://192.168.1.33:5000'; // Your IP shown in Expo
```

## How to Copy Files on Windows

### Option 1: File Explorer
1. Open two File Explorer windows
2. Navigate to this Replit project's mobile folder in one window
3. Navigate to your `D:\personal\aulnova\dev\repo-native\asset-protect\PosthumousNotificationApp\` in the other
4. Copy and paste the files

### Option 2: Command Line
```powershell
# Navigate to your project
cd D:\personal\aulnova\dev\repo-native\asset-protect\PosthumousNotificationApp

# You'll need to manually download/copy the files from this Replit project
```

## After Copying All Files

```powershell
# Restart Expo development server
cd PosthumousNotificationApp
npx expo start --clear

# Press 'a' for Android
```

## Your Project Structure Should Look Like:
```
PosthumousNotificationApp/
├── App.tsx           (Copied from mobile/App.tsx)
├── app.json          (Expo generated)
├── package.json      (Expo generated)
├── src/              (Copied from mobile/src/)
│   ├── context/
│   ├── services/
│   ├── navigation/
│   ├── hooks/
│   └── screens/
│       ├── auth/
│       └── main/     (This folder was missing!)
├── assets/           (Expo generated)
└── node_modules/     (Dependencies)
```

## Expected Result After Copying

Your posthumous notification system mobile app will have:
- ✅ Authentication screens (Welcome, Login, Register)
- ✅ Dashboard with MongoDB statistics
- ✅ Asset management screens
- ✅ Nominee management screens
- ✅ Mood tracking functionality
- ✅ Profile management
- ✅ Admin panel (for admin users)
- ✅ Full backend integration

The error will be resolved once all screen files are copied to your Expo project.