# Fixed Commands for React Native Setup

## The Issue
The `npx react-native init` command is deprecated. Use the new commands below.

## Correct Commands for Your Windows PowerShell

### Method 1: Direct Command (Recommended)
```powershell
cd D:\personal\aulnova\dev\repo-native\asset-protect\

npx @react-native-community/cli@latest init PosthumousNotificationApp --template react-native-template-typescript
```

### Method 2: Install CLI First
```powershell
npm install -g @react-native-community/cli

npx @react-native-community/cli init PosthumousNotificationApp --template react-native-template-typescript
```

### Method 3: Alternative Approach
```powershell
npx @react-native-community/cli@12.3.6 init PosthumousNotificationApp --template react-native-template-typescript
```

## After Project Creation

Once the project is created successfully, you should see:

```powershell
cd PosthumousNotificationApp
dir
```

You should see folders like:
- android/
- ios/
- src/ (if template includes it)
- node_modules/
- package.json
- App.tsx

## Next Steps After Successful Creation

1. **Install additional dependencies:**
```powershell
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage react-native-vector-icons react-hook-form
```

2. **Copy your app files** from this Replit project (follow COPY_THESE_FILES.md)

3. **Update API configuration** with your Windows IP address

4. **Test the app:**
```powershell
npx react-native start
# In another PowerShell window:
npx react-native run-android
```

## If You Still Get Errors

### Clear npm cache:
```powershell
npm cache clean --force
```

### Update Node.js:
Make sure you have Node.js 18+ installed from nodejs.org

### Check React Native environment:
```powershell
npx @react-native-community/cli doctor
```

This will check your development environment and show any missing dependencies.

## Expected Output

When the command works correctly, you should see:
```
✔ Downloading template
✔ Copying template
✔ Processing template
✔ Installing dependencies...
```

Then you'll be able to `cd PosthumousNotificationApp` successfully!