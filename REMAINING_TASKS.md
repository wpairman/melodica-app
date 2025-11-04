# What's Left To Do - Priority List

## ✅ COMPLETED (Recent)
- ✅ Password security (hashing implemented)
- ✅ Capacitor native app wrapper setup
- ✅ TypeScript error in analytics page fixed

---

## 🔴 CRITICAL - Must Do Before App Store Submission

### 1. **API Routes Migration** ⚠️ MOST IMPORTANT
**Problem:** Static export (`output: 'export'`) doesn't support API routes. Your `/api/*` routes won't work in the native app.

**Solution Required:**
- Deploy API routes to a backend server (Vercel Serverless Functions, AWS Lambda, etc.)
- Update environment variables:
  - Set `NEXT_PUBLIC_API_URL` to your backend URL
- Update API calls in the app to use the backend URL instead of `/api/*`

**Files that need updating:**
- `app/api/stripe/checkout/route.ts` → Deploy to backend
- `app/api/stripe/webhook/route.ts` → Deploy to backend
- `app/api/stripe/verify-session/route.ts` → Deploy to backend
- `app/api/calendar-sync/route.ts` → Deploy to backend
- All `fetch('/api/...')` calls → Update to use `NEXT_PUBLIC_API_URL`

**Impact:** Payments, calendar sync, and subscription verification won't work without this.

### 2. **Remove Debug Code**
**Found:** 271 console.log/error/warn statements across 59 files

**Action Required:**
- Remove or replace with proper logging service
- Keep critical error logging but remove debug statements
- Consider using a logging library (e.g., Sentry, LogRocket)

**Priority Files:**
- `app/login/page.tsx` - Many debug logs
- `app/register/page.tsx` - Many debug logs
- `contexts/auth-context.tsx` - Debug logs
- All other files with console.log

### 3. **Fix TypeScript/ESLint Errors**
**Current:** Errors are suppressed (`ignoreBuildErrors: true`)

**Action Required:**
- Remove suppression flags in `next.config.mjs`
- Fix all TypeScript errors
- Fix all ESLint errors
- Re-enable proper error checking

### 4. **Environment Variables Setup**
**Required for Production:**
- `STRIPE_SECRET_KEY` - Set in deployment platform
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Set in deployment platform
- `STRIPE_WEBHOOK_SECRET` - Set in deployment platform
- `NEXT_PUBLIC_API_URL` - Set to backend API URL (after step 1)
- `NEXT_PUBLIC_GA_ID` - Optional (for analytics)

### 5. **Re-enable Notifications**
**Current:** Notifications are temporarily disabled

**Action Required:**
- Fix notification flooding issues
- Re-enable notification functionality
- Test on real devices
- Ensure proper permission handling

**Files to update:**
- `components/notification-manager.tsx`
- `app/dashboard/settings/page.tsx`
- `public/sw.js`
- `components/mood-trend-notifications.tsx`
- `components/calendar-notifications.tsx`
- `components/notification-permission-dialog.tsx`

---

## 🟡 IMPORTANT - Should Do Soon

### 6. **App Icons & Splash Screens**
**Required Sizes:**
- iOS: 1024x1024, 180x180, 120x120, 152x152, 167x167
- Android: 512x512, adaptive icons
- Splash screens for both platforms

**Location:**
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Android: `android/app/src/main/res/`

### 7. **Test on Real Devices**
**Required:**
- Test on iOS device (iPhone/iPad)
- Test on Android device
- Test all features:
  - Login/Registration
  - Mood tracking
  - Calendar sync
  - Payments (Stripe)
  - Notifications
  - Offline functionality
  - PWA installation

### 8. **Error Handling & Loading States**
**Add:**
- Error boundaries for React errors
- Loading states for async operations
- Proper error messages for users
- Offline detection and handling

### 9. **Data Backup/Export**
**Problem:** All data stored in localStorage (can be lost)

**Solution Options:**
- Implement data export functionality
- Add backend database sync
- Add cloud backup option
- Implement data recovery

### 10. **Privacy & Legal Compliance**
**Required:**
- Review Terms & Conditions (already exists)
- Review Privacy Policy (already exists)
- Add age verification (app requires 18+)
- Add data deletion functionality
- Add contact information for support

---

## 🟢 NICE TO HAVE - Can Do Later

### 11. **Analytics & Monitoring**
- Add analytics tracking (Google Analytics, Mixpanel)
- Add crash reporting (Sentry, Bugsnag)
- Add user feedback system
- Monitor app performance

### 12. **User Experience Enhancements**
- Add onboarding flow
- Add help/tutorial sections
- Add app version display
- Add changelog/release notes
- Test accessibility (screen readers, keyboard navigation)

### 13. **Performance Optimization**
- Optimize bundle size
- Add lazy loading for heavy components
- Implement code splitting
- Add caching strategies
- Optimize images

### 14. **App Store Assets**
- Create screenshots for different device sizes
- Write compelling app descriptions
- Create promotional graphics
- Record app preview videos

---

## 📋 IMMEDIATE ACTION PLAN

### Phase 1: Critical Fixes (Week 1)
1. **Migrate API routes to backend** (HIGHEST PRIORITY)
2. Remove debug console.log statements
3. Fix TypeScript/ESLint errors
4. Set up environment variables

### Phase 2: Features & Testing (Week 2)
5. Re-enable notifications
6. Test on real devices
7. Add error handling
8. Add loading states

### Phase 3: App Store Prep (Week 3)
9. Create app icons
10. Create splash screens
11. Prepare app store assets
12. Set up App Store Connect / Google Play Console

### Phase 4: Final Testing (Week 4)
13. Beta testing (TestFlight/Internal Testing)
14. Fix bugs found
15. Final device testing
16. Submit to app stores

---

## 🎯 TOP 3 PRIORITIES RIGHT NOW

1. **API Routes Migration** - Without this, payments and calendar sync won't work
2. **Remove Debug Code** - 271 console statements need cleanup
3. **Fix TypeScript Errors** - Remove suppression and fix actual errors

---

## 📝 Notes

- **Static Export Limitation:** The app uses static export for Capacitor, which means:
  - No server-side rendering
  - No API routes in the app bundle
  - All API calls must go to external backend
  
- **Backend Options:**
  - Vercel Serverless Functions (recommended - easiest)
  - AWS Lambda
  - Firebase Functions
  - Your own Node.js server

- **Deployment Strategy:**
  - Frontend: Deploy static export to Vercel/Netlify
  - Backend: Deploy API routes to Vercel Serverless Functions
  - Native Apps: Build from Capacitor projects

---

## Current Status: ⚠️ 60% Complete

**What's Done:**
- ✅ Core features implemented
- ✅ Password security
- ✅ Native app wrapper setup
- ✅ Basic structure ready

**What's Blocking:**
- 🔴 API routes migration (critical)
- 🔴 Debug code cleanup
- 🔴 TypeScript errors

**Estimated Time to App Store Ready:** 3-4 weeks

