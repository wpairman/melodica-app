# App Store Readiness Checklist

## 🔴 Critical - Must Fix Before Submission

### Security
- [ ] **Fix password storage** - Currently storing plain text passwords in localStorage
  - Implement password hashing (bcrypt or similar)
  - Or migrate to proper authentication service (Firebase Auth, Auth0, etc.)
- [ ] **Review data storage** - All data is in localStorage (can be lost)
  - Consider backend database for critical data
  - Implement data export/backup functionality
- [ ] **Remove debug console.log statements** from production code
- [ ] **Enable proper error handling** - Remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`

### App Type & Wrapping
- [ ] **Decide on native app approach:**
  - **Option A:** Capacitor (Recommended - easiest for PWA)
    - Install: `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
    - Wrap your PWA for iOS and Android
  - **Option B:** React Native wrapper
  - **Option C:** Trusted Web Activity (TWA) for Android only
- [ ] **Build native app binaries** (.ipa for iOS, .aab for Android)

### Configuration
- [ ] **Set up production environment variables:**
  - `STRIPE_SECRET_KEY` (for payment processing)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET` (for webhook verification)
  - `NEXT_PUBLIC_GA_ID` (optional - for analytics)
- [ ] **Test Stripe integration** in production mode
- [ ] **Verify calendar sync API** works with production URLs

### Features
- [ ] **Re-enable notifications** (currently disabled)
- [ ] **Test all core features** on real devices:
  - Mood tracking
  - Calendar sync
  - Music recommendations
  - Playlists
  - Journal entries
  - Period tracker
  - Analytics

## 🟡 Important - Should Fix Soon

### Code Quality
- [ ] Fix all TypeScript errors (currently suppressed)
- [ ] Fix all ESLint errors (currently suppressed)
- [ ] Add proper error boundaries for React errors
- [ ] Add loading states for all async operations
- [ ] Add offline detection and handling

### User Experience
- [ ] Add data migration/persistence strategy
- [ ] Implement proper onboarding flow
- [ ] Add help/tutorial sections
- [ ] Test accessibility (screen readers, keyboard navigation)
- [ ] Optimize images and assets

### Legal & Compliance
- [ ] Review Terms & Conditions for App Store compliance
- [ ] Review Privacy Policy for GDPR/CCPA compliance
- [ ] Add age verification (app requires 18+)
- [ ] Add data deletion functionality
- [ ] Add contact information for support

## 🟢 Nice to Have - Can Add Later

### Enhancements
- [ ] Add analytics tracking (Google Analytics, Mixpanel, etc.)
- [ ] Add crash reporting (Sentry, Bugsnag)
- [ ] Add user feedback system
- [ ] Add app version display
- [ ] Add changelog/release notes
- [ ] Add in-app help/tutorials

### Performance
- [ ] Optimize bundle size
- [ ] Add lazy loading for heavy components
- [ ] Implement code splitting
- [ ] Add caching strategies

## 📱 App Store Specific Requirements

### iOS App Store
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect setup
- [ ] App icons (required sizes):
  - 1024x1024 (App Store)
  - 180x180 (iPhone)
  - 120x120 (iPhone)
  - 152x152 (iPad)
  - 167x167 (iPad Pro)
- [ ] Screenshots for different device sizes
- [ ] App Store description
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating (likely 17+ for mental health content)
- [ ] TestFlight beta testing

### Google Play Store
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Google Play Console setup
- [ ] App icons (required sizes):
  - 512x512 (Play Store)
  - Various adaptive icon sizes
- [ ] Screenshots for phones and tablets
- [ ] Google Play description
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Data safety section (required)

## 🚀 Deployment Steps

### 1. Fix Critical Issues (1-2 weeks)
- Fix password security
- Configure environment variables
- Remove debug code
- Fix TypeScript/ESLint errors

### 2. Wrap as Native App (1 week)
- Install Capacitor
- Configure iOS and Android projects
- Test on devices

### 3. App Store Preparation (1 week)
- Create app icons in all required sizes
- Take screenshots
- Write app descriptions
- Set up App Store Connect / Google Play Console

### 4. Testing (1-2 weeks)
- Test on real devices (iOS and Android)
- Test all features end-to-end
- Beta testing with TestFlight/Internal Testing
- Fix bugs found during testing

### 5. Submission (1 week)
- Submit to App Store Connect
- Submit to Google Play Console
- Wait for review (1-3 days iOS, 1-24 hours Android)
- Respond to any review feedback

## Estimated Timeline: 4-6 weeks

## Current Status: ⚠️ Not Ready Yet

**Most Critical:** Fix password security and wrap as native app before submission.

