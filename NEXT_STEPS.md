# Next Steps - API Setup

## ✅ What's Done
- ✅ API project created in `melodica-api/` folder
- ✅ Dependencies installed
- ✅ Git repository initialized

## 📋 What You Need to Do Now

### Step 1: Create GitHub Repository (2 minutes)

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `melodica-api`
4. Description: "API backend for Melodica app"
5. Make it **Public** (or Private if you prefer)
6. **DO NOT** check "Initialize with README"
7. Click **"Create repository"**

### Step 2: Push to GitHub (1 minute)

Copy the commands GitHub shows you, or run these (replace YOUR_USERNAME):

```bash
cd melodica-api
git remote add origin https://github.com/YOUR_USERNAME/melodica-api.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (3 minutes)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Find and select `melodica-api` repository
5. Click **"Import"**
6. Vercel will auto-detect Next.js - click **"Deploy"**
7. Wait for deployment (about 1-2 minutes)
8. **Copy the deployment URL** (e.g., `https://melodica-api-xyz123.vercel.app`)

### Step 4: Configure Environment Variables in API Project (2 minutes)

1. In your Vercel API project, go to **Settings** → **Environment Variables**
2. Add these variables:

   **Variable 1:**
   - Key: `RESEND_API_KEY`
   - Value: `re_your_actual_resend_api_key_here`
   - Environment: Production, Preview, Development (check all)
   - Click **"Save"**

   **Variable 2:**
   - Key: `RESEND_FROM_EMAIL`
   - Value: `Melodica <noreply@resend.dev>`
   - Environment: Production, Preview, Development (check all)
   - Click **"Save"**

3. Go to **Deployments** tab
4. Click the **"..."** menu on the latest deployment
5. Click **"Redeploy"** (so it picks up the new environment variables)

### Step 5: Configure Main App (2 minutes)

1. Go back to your **main app** project in Vercel (melodica-app)
2. Go to **Settings** → **Environment Variables**
3. Add:

   **Variable:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-api-project-url.vercel.app` (use the URL from Step 3)
   - Environment: Production, Preview, Development (check all)
   - Click **"Save"**

4. Go to **Deployments** tab
5. Click the **"..."** menu on the latest deployment
6. Click **"Redeploy"**

### Step 6: Test (1 minute)

1. Go to your main app: `https://melodica-app.vercel.app`
2. Try registering a new account
3. Check your email for the verification email
4. Click the verification link

## 🎯 Quick Checklist

- [ ] GitHub repository `melodica-api` created
- [ ] API project pushed to GitHub
- [ ] API project deployed to Vercel
- [ ] API project URL copied
- [ ] `RESEND_API_KEY` added to API project
- [ ] `RESEND_FROM_EMAIL` added to API project
- [ ] API project redeployed
- [ ] `NEXT_PUBLIC_API_URL` added to main app
- [ ] Main app redeployed
- [ ] Tested registration flow

## 🆘 Need Help?

If you get stuck:
1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Make sure you redeployed after adding variables
4. Check that API URL doesn't have a trailing slash

## 📝 Current Status

Your main app is deployed at: `https://melodica-app.vercel.app`

Once you complete these steps, your API will be at: `https://melodica-api-xyz.vercel.app`

