# Pre-Deployment Checklist for App Store Submission

Use this checklist to ensure everything is ready before submitting to the App Store.

## Build & Configuration

- [ ] **Next.js build completes successfully**
  ```bash
  npm run build
  ```
  ✓ Should see: `✓ Compiled successfully` and `✓ Exporting`

- [ ] **Capacitor sync completes without errors**
  ```bash
  npm run cap:sync
  ```

- [ ] **iOS project opens in Xcode**
  ```bash
  npm run cap:ios
  ```

## App Configuration

- [ ] **Bundle Identifier set** (e.g., `com.yourcompany.melodica`)
- [ ] **Display Name set** (e.g., "Melodica")
- [ ] **Version number set** (e.g., `1.0.0`)
- [ ] **Build number set** (e.g., `1`)
- [ ] **Minimum iOS version** (iOS 13.0+ recommended)
- [ ] **Signing configured** (Automatic signing enabled)
- [ ] **Team selected** (Your Apple Developer account)

## App Assets

- [ ] **App Icon** (1024x1024 PNG for App Store)
- [ ] **App Icons** (All required sizes for devices)
- [ ] **Launch Screen** configured
- [ ] **Splash Screen** configured (if using Capacitor SplashScreen plugin)

## App Store Connect Setup

- [ ] **Apple Developer Account** active ($99/year)
- [ ] **App Store Connect access** granted
- [ ] **App created** in App Store Connect
- [ ] **Bundle ID** matches Xcode configuration
- [ ] **SKU** assigned

## App Store Listing

- [ ] **App Name** (max 30 characters)
- [ ] **Subtitle** (max 30 characters)
- [ ] **Description** written (compelling and accurate)
- [ ] **Keywords** added (max 100 characters)
- [ ] **Category** selected (Health & Fitness / Medical)
- [ ] **Subcategory** selected (Mental Health)
- [ ] **Age Rating** completed
- [ ] **Screenshots** uploaded for all required sizes:
  - [ ] 6.7" Display (1290 x 2796)
  - [ ] 6.5" Display (1242 x 2688)
  - [ ] 5.5" Display (1242 x 2208)
- [ ] **App Preview Video** (optional)
- [ ] **Support URL** provided
- [ ] **Marketing URL** (optional)

## Privacy & Compliance

- [ ] **Privacy Policy URL** added to App Store Connect
- [ ] **App Privacy** questionnaire completed:
  - [ ] Data types collected listed
  - [ ] Data usage purposes specified
  - [ ] Data linking to user identity
  - [ ] Data tracking configured
- [ ] **Export Compliance** answered
- [ ] **Content Rights** confirmed

## Testing

- [ ] **App builds** in Xcode without errors
- [ ] **App runs** on iOS Simulator
- [ ] **App runs** on physical iPhone device
- [ ] **All features tested** and working:
  - [ ] User registration/login
  - [ ] Mood tracking
  - [ ] Music recommendations
  - [ ] Activity recommendations
  - [ ] Journaling
  - [ ] Calendar integration
  - [ ] Playlists
  - [ ] Settings
- [ ] **Offline functionality** tested
- [ ] **No crashes** during testing

## Build & Archive

- [ ] **Clean build** performed (`Product → Clean Build Folder`)
- [ ] **Archive created** successfully (`Product → Archive`)
- [ ] **Archive validated** without errors
- [ ] **Archive uploaded** to App Store Connect
- [ ] **Build appears** in App Store Connect (may take 30-60 minutes)

## Submission

- [ ] **Build selected** in App Store Connect
- [ ] **All required fields** completed
- [ ] **Review information** provided:
  - [ ] Contact email
  - [ ] Contact phone
  - [ ] Demo account (if needed)
  - [ ] Review notes (if needed)
- [ ] **Ready to submit** for review

## Post-Submission

- [ ] **Submission confirmation** received
- [ ] **Email notifications** enabled in App Store Connect
- [ ] **Status monitoring** set up
- [ ] **Response plan** ready for review feedback

---

## Quick Commands Reference

```bash
# 1. Build Next.js app
npm run build

# 2. Sync Capacitor
npm run cap:sync

# 3. Open iOS project
npm run cap:ios

# 4. In Xcode:
#    - Select "Any iOS Device"
#    - Product → Archive
#    - Distribute App → App Store Connect → Upload
```

---

## Common Issues & Solutions

### Issue: Build fails in Xcode
**Solution**: Clean build folder (`Product → Clean Build Folder`)

### Issue: Signing errors
**Solution**: Enable "Automatically manage signing" and select your team

### Issue: Upload fails
**Solution**: Check internet connection, try again (network issues are common)

### Issue: Build doesn't appear in App Store Connect
**Solution**: Wait 30-60 minutes, check processing status

### Issue: Missing screenshots
**Solution**: Use simulator to take screenshots at required sizes

---

## Timeline Expectations

- **Archive & Upload**: 10-30 minutes
- **Build Processing**: 30-60 minutes
- **Review Time**: 1-3 days (first submission may take longer)
- **Total Time**: 1-2 weeks for first submission

---

## Important Links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)

---

Good luck! 🚀

