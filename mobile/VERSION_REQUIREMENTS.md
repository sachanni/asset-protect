# Version Requirements for React Native APK/IPA Development

## Recommended Versions (January 2025)

### Node.js Version
**Recommended: Node.js 18.x or 20.x**
- **Node.js 18.19.0** (LTS) - Most stable for React Native
- **Node.js 20.11.0** (LTS) - Also supported
- **Avoid:** Node.js 21+ (may have compatibility issues)

**Download from:** https://nodejs.org/
- Choose "LTS" (Long Term Support) version
- This ensures maximum compatibility

### React Native Version
**Recommended: React Native 0.73.x**
- **React Native 0.73.2** - Latest stable version
- **React Native 0.72.x** - Also stable and widely used

**The CLI command will automatically use the latest stable version:**
```powershell
npx @react-native-community/cli@latest init PosthumousNotificationApp --template react-native-template-typescript
```

## Version Compatibility Matrix

| Node.js Version | React Native Version | Status |
|----------------|---------------------|---------|
| 18.19.0 (LTS) | 0.73.x | ✅ Recommended |
| 20.11.0 (LTS) | 0.73.x | ✅ Recommended |
| 16.x | 0.72.x | ⚠️ Older but works |
| 21.x+ | Any | ❌ Not recommended |

## Check Your Current Versions

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# After creating React Native project, check RN version
cd PosthumousNotificationApp
npx react-native --version
```

## If You Need to Update Node.js

### Option 1: Download from Official Site
1. Go to https://nodejs.org/
2. Download the LTS version (18.x)
3. Run the installer
4. Restart your PowerShell/Command Prompt

### Option 2: Using Node Version Manager (Advanced)
```powershell
# Install nvm-windows first, then:
nvm install 18.19.0
nvm use 18.19.0
```

## React Native CLI Version
**Always use the latest CLI:**
```powershell
npm install -g @react-native-community/cli@latest
```

## Android Development Requirements

### Java Development Kit (JDK)
- **JDK 17** (recommended for React Native 0.73+)
- **JDK 11** (minimum requirement)

### Android SDK
- **Target SDK:** API 34 (Android 14)
- **Minimum SDK:** API 21 (Android 5.0)
- **Compile SDK:** API 34

## Why These Versions?

### Node.js 18/20 LTS:
- Long-term support and stability
- Excellent compatibility with React Native build tools
- Active security updates
- Compatible with all React Native 0.73+ features

### React Native 0.73+:
- Latest features and performance improvements
- Best TypeScript support
- Modern Android and iOS target support
- Active bug fixes and security updates

## Your Project Specifications

Based on your posthumous notification system requirements:

```json
{
  "node": ">=18.19.0",
  "react-native": "0.73.2",
  "typescript": "5.0+",
  "android": {
    "compileSdk": 34,
    "targetSdk": 34,
    "minSdk": 21
  },
  "ios": {
    "deployment_target": "13.0"
  }
}
```

## Quick Setup Verification

After installation, verify everything works:

```powershell
# Check versions
node --version          # Should show 18.x or 20.x
npm --version           # Should show 9.x or 10.x

# Create test project
npx @react-native-community/cli@latest init TestApp --template react-native-template-typescript
cd TestApp

# Check React Native version
npx react-native --version

# Test Android setup
npx @react-native-community/cli doctor
```

## Expected Output

When everything is correctly installed:
```
Node.js: v18.19.0
npm: 9.2.0
React Native CLI: 12.3.6
React Native: 0.73.2
```

Use these versions for the best compatibility with your posthumous notification mobile app development!