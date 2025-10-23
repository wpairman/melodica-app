# Deployment Guide for Melodica

## Step-by-Step Deployment Instructions

### Step 1: Push to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: `melodica-app`
   - Description: "Mental Wellness Companion App"
   - Choose Public or Private
   - **DO NOT** initialize with README
   - Click "Create repository"

2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/melodica-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/Login with your GitHub account
3. Click "Add New Project"
4. Import your `melodica-app` repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"
7. Wait for deployment to complete (1-2 minutes)
8. You'll get a URL like: `melodica-app-xyz.vercel.app`

### Step 3: Get Your Domain

1. **Purchase melodica.com:**
   - Go to https://namecheap.com (or any registrar)
   - Search for "melodica.com"
   - Add to cart and checkout (~$10-15/year)

2. **Connect Domain to Vercel:**
   - In Vercel Dashboard → Your Project → Settings → Domains
   - Click "Add Domain"
   - Enter "melodica.com"
   - Follow DNS configuration instructions
   - Update your domain's DNS records (usually takes 1-24 hours to propagate)

### Step 4: App Store Submission (iOS)

1. **Requirements:**
   - Apple Developer Account ($99/year)
   - Mac computer (for building)
   - App Store Connect access

2. **Create App:**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Fill in app details
   - Upload your app binary

3. **PWA Alternative (Easier):**
   - Your app is already a PWA
   - Users can "Add to Home Screen" on iOS
   - No App Store submission needed for basic functionality

### Step 5: Google Play Store (Android)

1. **Requirements:**
   - Google Play Developer Account ($25 one-time)
   - Android app build

2. **Create App:**
   - Go to https://play.google.com/console
   - Create new app
   - Fill in app details
   - Upload APK or AAB file

3. **PWA Alternative (Easier):**
   - Your app is already a PWA
   - Users can "Install App" on Android
   - No Play Store submission needed for basic functionality

## Quick Deployment Commands

```bash
# Check Git status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Build locally
npm run build

# Test production build
npm start
```

## Environment Variables

Before deploying, set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using payments)
- `STRIPE_SECRET_KEY` (if using payments)
- `NEXT_PUBLIC_WEATHER_API_KEY` (if using weather features)

## Troubleshooting

### Build Errors
- Check if all dependencies are in `package.json`
- Run `npm install` locally first
- Check console for specific error messages

### Domain Issues
- DNS propagation can take up to 24 hours
- Check DNS records with `nslookup melodica.com`
- Verify DNS settings in Vercel dashboard

### Deployment Issues
- Check Vercel deployment logs
- Ensure all environment variables are set
- Verify `next.config.mjs` settings

## Support

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Issues: https://github.com/YOUR_USERNAME/melodica-app/issues
