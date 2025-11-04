# App Store Deployment Guide for Melodica

This guide will walk you through deploying your Next.js app to the Apple App Store using Capacitor.

## Prerequisites

### 1. Apple Developer Account
- **Required**: Apple Developer Program membership ($99/year)
- Sign up at: https://developer.apple.com/programs/
- You'll need:
  - Apple ID
  - Credit card for payment
  - Legal entity (individual or company)

### 2. Development Environment
- **macOS** (required for iOS development)
- **Xcode** (latest version from Mac App Store)
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js** (v18 or higher)
- **CocoaPods** (iOS dependency manager): `sudo gem install cocoapods`

### 3. Certificates & Profiles
- Certificates will be managed through Xcode automatically
- You'll need to create App IDs and Provisioning Profiles in Apple Developer Portal

---

## Step-by-Step Deployment Process

### Step 1: Build Your Next.js App

```bash
# Build the static site
npm run build

# Verify the build completed successfully
# You should see: ✓ Compiled successfully
```

This creates the `out/` directory with all static files.

---

### Step 2: Sync Capacitor with Native Projects

```bash
# Sync Capacitor (copies web files to native projects)
npm run cap:sync

# Or manually:
npx cap sync
```

This will:
- Copy `out/` directory to iOS project
- Update native dependencies
- Sync Capacitor plugins

---

### Step 3: Open iOS Project in Xcode

```bash
# Open Xcode
npm run cap:ios

# Or manually:
npx cap open ios
```

Xcode will open with your iOS project loaded.

---

### Step 4: Configure App in Xcode

#### 4.1 Set Bundle Identifier
1. In Xcode, select the project in the left sidebar
2. Select the "Melodica" target
3. Go to "Signing & Capabilities" tab
4. Set your **Bundle Identifier**:
   - Currently: `com.melodica.app`
   - Change to: `com.yourcompany.melodica` (or your preferred format)
   - Format: `com.[company].[appname]`

#### 4.2 Configure Signing
1. Under "Signing & Capabilities"
2. Check **"Automatically manage signing"**
3. Select your **Team** (your Apple Developer account)
4. Xcode will automatically create certificates and provisioning profiles

#### 4.3 Set App Display Name
1. Still in target settings
2. Go to "General" tab
3. Set **Display Name**: `Melodica` (or your preferred name)

#### 4.4 Set Version & Build Number
1. In "General" tab:
   - **Version**: `1.0.0` (marketing version)
   - **Build**: `1` (build number, increment for each upload)

#### 4.5 Configure App Icons & Launch Screen
1. Go to "Assets" folder in Xcode
2. Add your app icons:
   - Required sizes: 1024x1024 (App Store), plus various sizes for devices
   - Place icons in `AppIcon` asset catalog
3. Configure launch screen:
   - Edit `LaunchScreen.storyboard` or use `SplashScreen` plugin settings

---

### Step 5: Configure Info.plist

1. Open `ios/App/App/Info.plist` in Xcode
2. Add/verify these entries:
   - **Privacy - Camera Usage Description** (if using camera)
   - **Privacy - Location When In Use** (if using location)
   - **Privacy - Photo Library Usage** (if accessing photos)
   - **NSAppTransportSecurity** settings (if needed)

3. Set **Minimum iOS Version**:
   - Target: iOS 13.0 or higher (recommended: iOS 14.0+)

---

### Step 6: Test on Simulator/Device

#### Test on Simulator
1. In Xcode, select a simulator (e.g., iPhone 15 Pro)
2. Click **Run** button (▶️) or press `Cmd + R`
3. App should launch in simulator

#### Test on Physical Device
1. Connect iPhone via USB
2. Trust computer on iPhone
3. In Xcode, select your device
4. Click **Run**
5. On iPhone: Settings → General → VPN & Device Management → Trust Developer

---

### Step 7: Build for App Store Distribution

#### 7.1 Create Archive
1. In Xcode, select **"Any iOS Device"** (not a simulator)
2. Go to menu: **Product → Archive**
3. Wait for archive to complete (may take several minutes)

#### 7.2 Validate Archive
1. Archive window opens automatically (Organizer)
2. Select your archive
3. Click **"Validate App"**
4. Follow prompts:
   - Select your App Store Connect account
   - Choose automatic signing
   - Wait for validation to complete

#### 7.3 Distribute to App Store
1. Still in Organizer, select your archive
2. Click **"Distribute App"**
3. Select **"App Store Connect"**
4. Choose **"Upload"**
5. Follow prompts:
   - Select automatic signing
   - Review summary
   - Click **"Upload"**
6. Wait for upload to complete (may take 10-30 minutes)

---

### Step 8: App Store Connect Setup

#### 8.1 Access App Store Connect
- Go to: https://appstoreconnect.apple.com
- Sign in with your Apple Developer account

#### 8.2 Create New App
1. Click **"My Apps"** → **"+"** → **"New App"**
2. Fill in:
   - **Platform**: iOS
   - **Name**: Melodica
   - **Primary Language**: English
   - **Bundle ID**: Select the one you created (e.g., `com.yourcompany.melodica`)
   - **SKU**: Unique identifier (e.g., `melodica-001`)
   - **User Access**: Full Access (or Limited if using TestFlight)

#### 8.3 App Information
1. Go to **"App Information"**
2. Fill in:
   - **Category**: Health & Fitness (or Medical)
   - **Subcategory**: Mental Health
   - **Content Rights**: You have rights to all content
   - **Age Rating**: Complete questionnaire (likely 4+)

#### 8.4 Pricing and Availability
1. Set pricing (Free or Paid)
2. Select countries/regions (default: All)

#### 8.5 App Privacy
1. Go to **"App Privacy"**
2. Complete privacy questionnaire:
   - Data collected: Mood data, journal entries, location (if used)
   - Data used for: App functionality, analytics
   - Data linked to user: Yes (if using accounts)
   - Data tracking: Configure based on your analytics setup

---

### Step 9: Prepare App Store Listing

#### 9.1 App Store Screenshots
Required sizes (all required):
- **6.7" Display (iPhone 15 Pro Max)**: 1290 x 2796 pixels
- **6.5" Display (iPhone 11 Pro Max)**: 1242 x 2688 pixels
- **5.5" Display (iPhone 8 Plus)**: 1242 x 2208 pixels

Take screenshots:
1. Run app on simulator with correct device size
2. Take screenshots: `Cmd + S` in simulator
3. Save screenshots
4. Upload to App Store Connect → App Store → Screenshots

#### 9.2 App Preview Video (Optional)
- Create a 15-30 second video showcasing your app
- Upload to App Store Connect

#### 9.3 App Description
Write compelling description:
- **Name**: Melodica (max 30 characters)
- **Subtitle**: Your Mental Wellness Companion (max 30 characters)
- **Description**: 
  ```
  Melodica is your AI-powered mental wellness companion, helping you manage your mood through personalized music recommendations, activity suggestions, mood tracking, and mental health insights.
  
  Features:
  • Personalized music recommendations based on your mood
  • Activity suggestions tailored to your preferences
  • Daily mood tracking with insights and trends
  • Journaling for reflection and self-care
  • Period tracking (for users who need it)
  • Calendar integration with AI-powered event preparation
  • Custom playlists and mood-based music organization
  
  Take control of your mental health journey with Melodica.
  ```
- **Keywords**: mental health, mood tracking, music therapy, wellness, mindfulness (max 100 characters)
- **Promotional Text**: Optional, can be updated without review
- **Support URL**: Your support website
- **Marketing URL**: Optional marketing site

#### 9.4 App Review Information
- **Contact Information**: Your email and phone
- **Demo Account**: If required, provide test account credentials
- **Notes**: Any special instructions for reviewers

---

### Step 10: Submit for Review

#### 10.1 Build Selection
1. After upload completes (Step 7.3), go to App Store Connect
2. Go to **"App Store"** → **"iOS App"**
3. Under **"Build"**, click **"+"**
4. Select your uploaded build (may take 10-30 minutes to appear)
5. Click **"Done"**

#### 10.2 Export Compliance
- Answer: **"No"** (unless you use encryption)
- If you use HTTPS only, select "No"

#### 10.3 Content Rights
- Confirm you have rights to all content

#### 10.4 Advertising Identifier (IDFA)
- Answer based on your analytics setup
- If using basic analytics without tracking, select "No"

#### 10.5 Submit for Review
1. Click **"Submit for Review"**
2. Review all information
3. Confirm submission

---

### Step 11: Review Process

**Timeline:**
- **In Review**: Usually 1-3 days
- **Processing**: May take additional time
- **Approved**: App goes live immediately (or scheduled release)

**Possible Outcomes:**
- ✅ **Approved**: App goes live!
- ⚠️ **Rejected**: Fix issues and resubmit
- 📝 **Metadata Rejected**: Fix listing info (no new build needed)

**Common Rejection Reasons:**
- Missing privacy policy URL
- Incomplete app functionality
- Missing required screenshots
- Guideline violations

---

### Step 12: Post-Launch

#### 12.1 Monitor App Store Connect
- Check for crash reports
- Monitor user reviews
- Respond to reviews

#### 12.2 Analytics
- Set up App Store Connect analytics
- Monitor downloads and user engagement

#### 12.3 Updates
For future updates:
1. Update version/build number in Xcode
2. Build new archive
3. Upload to App Store Connect
4. Submit for review

---

## Troubleshooting

### Build Issues

**"No signing certificate found"**
- Solution: Ensure "Automatically manage signing" is enabled
- Check Apple Developer account access

**"Provisioning profile error"**
- Solution: Let Xcode regenerate profiles
- Check Bundle ID matches App Store Connect

**"Archive build failed"**
- Solution: Clean build folder: `Product → Clean Build Folder`
- Check for compilation errors

### Upload Issues

**"Upload failed"**
- Solution: Check internet connection
- Try uploading again (network issues are common)

**"Invalid bundle"**
- Solution: Ensure you selected "Any iOS Device" before archiving
- Check minimum iOS version compatibility

### App Store Connect Issues

**"Build not appearing"**
- Solution: Wait 30-60 minutes after upload
- Check processing status

**"Missing compliance"**
- Solution: Answer export compliance questions
- Add privacy policy URL if required

---

## Quick Reference Commands

```bash
# Build Next.js app
npm run build

# Sync Capacitor
npm run cap:sync

# Open iOS project
npm run cap:ios

# Or use Capacitor CLI directly
npx cap sync
npx cap open ios
```

---

## Important Notes

1. **First Submission**: May take 1-2 weeks total (review + processing)
2. **Subsequent Updates**: Usually faster (1-3 days)
3. **TestFlight**: Consider beta testing before App Store release
4. **Version Numbers**: Must increment for each new submission
5. **Build Numbers**: Must be unique and incrementing

---

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

## Checklist Before Submission

- [ ] App builds successfully in Xcode
- [ ] App tested on physical device
- [ ] All required screenshots uploaded
- [ ] App description and metadata complete
- [ ] Privacy policy URL provided
- [ ] App icons configured
- [ ] Bundle ID matches App Store Connect
- [ ] Version and build numbers set
- [ ] Signing configured correctly
- [ ] Archive validated successfully
- [ ] Build uploaded to App Store Connect
- [ ] App Store listing complete
- [ ] Export compliance answered
- [ ] Ready to submit for review

---

Good luck with your App Store submission! 🚀

