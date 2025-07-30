# Copy Your Mobile App Files to Expo Project

## Your Setup is Ready ✅
- React Native 0.79.5 with React 19.0.0 (compatible via Expo)
- All navigation dependencies installed successfully
- Ready to copy your posthumous notification app files

## Step 1: Copy Main App Structure

Copy these files from this Replit project to your `PosthumousNotificationApp` folder:

### Replace App.tsx
```powershell
# Copy from: mobile/App.tsx
# To: PosthumousNotificationApp/App.tsx
```

### Copy Source Folder
```powershell
# Copy entire src folder:
# From: mobile/src/
# To: PosthumousNotificationApp/src/

# This includes:
- src/context/AuthContext.tsx
- src/context/ApiContext.tsx  
- src/services/api.ts
- src/navigation/AuthNavigator.tsx
- src/navigation/MainNavigator.tsx
- src/hooks/useAuth.ts
- src/screens/LoadingScreen.tsx
- src/screens/auth/ (WelcomeScreen, LoginScreen, RegisterScreen)
- src/screens/main/ (DashboardScreen, AssetsScreen, ProfileScreen, etc.)
```

## Step 2: Update for Expo Compatibility

### Update MainNavigator.tsx
Find and replace the vector icons import:

```typescript
// OLD (React Native CLI):
import Icon from 'react-native-vector-icons/MaterialIcons';

// NEW (Expo):
import { MaterialIcons } from '@expo/vector-icons';

// Update the icon rendering:
// OLD:
return <Icon name={iconName} size={size} color={color} />;

// NEW:
return <MaterialIcons name={iconName} size={size} color={color} />;
```

### Update API Configuration
In `src/services/api.ts`, update the API URL:

```typescript
// Find your Windows IP address:
// Open Command Prompt: ipconfig | findstr "IPv4"

// Update API_BASE_URL:
const API_BASE_URL = 'http://192.168.1.XXX:5000'; // Replace XXX with your actual IP
```

## Step 3: Test Your App

```powershell
cd PosthumousNotificationApp

# Start the development server
npx expo start

# Then:
# Press 'a' for Android emulator
# Or scan QR code with Expo Go app on your phone
# Press 'w' to test in web browser
```

## Step 4: Verify All Features Work

Your app should have all these screens working:

### Authentication Flow:
- Welcome Screen with app logo
- Login Screen (admin@aulnovatechsoft.com / Admin@123)
- Register Screen for new users

### Main App:
- Dashboard with statistics
- Assets management
- Nominees management  
- Mood tracking
- Profile management
- Admin panel (for admin users)

### Backend Integration:
- User authentication
- Data fetching from MongoDB
- Real-time statistics
- CRUD operations

## Step 5: Build APK (After Testing)

Once everything works:

```powershell
# Setup build system
npx expo login
npx eas build:configure

# Build APK for testing
npx eas build --platform android --profile preview

# Build production APK
npx eas build --platform android --profile production
```

## Expected File Structure After Copying

```
PosthumousNotificationApp/
├── App.tsx           (Main app component)
├── app.json          (Expo configuration)
├── package.json      (Dependencies)
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ApiContext.tsx
│   ├── services/
│   │   └── api.ts    (Update IP address here)
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx (Update icons here)
│   ├── screens/
│   │   ├── auth/     (Welcome, Login, Register)
│   │   └── main/     (Dashboard, Assets, Profile, etc.)
│   └── hooks/
│       └── useAuth.ts
├── assets/           (App icons, images)
└── node_modules/     (Dependencies)
```

## Common Issues and Solutions

### If Icons Don't Show:
- Make sure you updated MaterialIcons import in MainNavigator.tsx
- Restart the development server: `npx expo start --clear`

### If API Calls Fail:
- Verify your Windows IP address in api.ts
- Make sure your Node.js server is running on port 5000
- Test API URL in browser: `http://192.168.1.XXX:5000/api/auth/me`

### If Build Fails:
- Run `npx expo doctor` to check for issues
- Clear cache: `npx expo start --clear`

Your posthumous notification system mobile app will be ready for APK generation once these files are copied and the small Expo compatibility updates are made.