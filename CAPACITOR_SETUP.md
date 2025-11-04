# Capacitor Native App Setup Guide

## Overview
Melodica is now configured as a Progressive Web App (PWA) that can be wrapped as a native iOS and Android app using Capacitor.

## Build Commands

### Development
```bash
npm run dev              # Run Next.js dev server
```

### Production Build for Mobile
```bash
npm run build:mobile     # Build Next.js app and sync with Capacitor
```

### Platform-Specific Commands
```bash
npm run cap:sync         # Sync web assets to native projects
npm run cap:ios          # Open iOS project in Xcode
npm run cap:android      # Open Android project in Android Studio
```

## Build Process

1. **Build Next.js App:**
   ```bash
   npm run build
   ```
   This creates a static export in the `out/` directory.

2. **Sync with Capacitor:**
   ```bash
   npm run cap:sync
   ```
   This copies the web assets to native iOS and Android projects.

## iOS Setup

1. **Requirements:**
   - macOS with Xcode installed
   - Apple Developer Account ($99/year) for App Store submission
   - CocoaPods (usually installed with Xcode)

2. **Build iOS App:**
   ```bash
   npm run cap:ios
   ```
   This opens the project in Xcode.

3. **In Xcode:**
   - Select your development team in Signing & Capabilities
   - Choose a device or simulator
   - Click Run (▶️) to build and run

4. **For App Store:**
   - Archive the app (Product → Archive)
   - Upload to App Store Connect
   - Submit for review

## Android Setup

1. **Requirements:**
   - Android Studio installed
   - Java Development Kit (JDK)
   - Google Play Developer Account ($25 one-time) for Play Store submission

2. **Build Android App:**
   ```bash
   npm run cap:android
   ```
   This opens the project in Android Studio.

3. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select a device or emulator
   - Click Run (▶️) to build and run

4. **For Play Store:**
   - Build → Generate Signed Bundle / APK
   - Create a signed AAB (Android App Bundle)
   - Upload to Google Play Console
   - Submit for review

## Configuration Files

- **`capacitor.config.ts`** - Capacitor configuration
- **`next.config.mjs`** - Next.js configuration (set to static export)
- **`ios/`** - iOS native project (generated)
- **`android/`** - Android native project (generated)

## Important Notes

1. **Static Export:** The app is configured for static export (`output: 'export'`), which means:
   - All routes are pre-rendered
   - No server-side features can be used
   - API routes won't work in the native app (they need a backend server)

2. **API Routes:** For production, you'll need to:
   - Deploy API routes to a backend server (e.g., Vercel, AWS, etc.)
   - Update API endpoints in the app to point to the backend URL
   - Use environment variables for API URLs

3. **Environment Variables:**
   - Set `NEXT_PUBLIC_API_URL` for API endpoints
   - Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for payments
   - Other environment variables as needed

4. **Testing:**
   - Test on real devices, not just simulators
   - Test all features: mood tracking, calendar sync, payments, etc.
   - Test offline functionality

5. **Icons and Splash Screens:**
   - Update app icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset`
   - Update Android icons in `android/app/src/main/res/`
   - Splash screen configuration is in `capacitor.config.ts`

## Next Steps

1. Build the app: `npm run build:mobile`
2. Test on iOS: `npm run cap:ios`
3. Test on Android: `npm run cap:android`
4. Update app icons and splash screens
5. Configure app signing certificates
6. Test on real devices
7. Submit to App Stores

## Troubleshooting

- **"out directory missing"** - Run `npm run build` first
- **Build errors** - Check that all dependencies are installed
- **Sync issues** - Try deleting `ios/` or `android/` folders and re-adding platforms
- **Xcode errors** - Make sure CocoaPods are installed: `sudo gem install cocoapods`
- **Android Studio errors** - Make sure Android SDK is properly configured

