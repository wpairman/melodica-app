# Vercel API Setup - Visual Guide

## 🎯 Quick Summary

Your app needs API routes deployed separately because it uses static export. Here's the easiest way:

## 📋 Step-by-Step Instructions

### Part 1: Create API Project (5 minutes)

1. **Run the setup script:**
   ```bash
   ./setup-api-project.sh
   ```

2. **Navigate to the API project:**
   ```bash
   cd melodica-api
   npm install
   ```

3. **Create a new GitHub repository:**
   - Go to GitHub → New Repository
   - Name it: `melodica-api`
   - Don't initialize with README
   - Copy the repository URL

4. **Push the API project:**
   ```bash
   git init
   git add .
   git commit -m "Initial API project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/melodica-api.git
   git push -u origin main
   ```

### Part 2: Deploy API to Vercel (3 minutes)

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Click **"Add New Project"**

2. **Import Repository:**
   - Select **"Import Git Repository"**
   - Choose `melodica-api`
   - Click **"Import"**

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Click **"Deploy"**

4. **Wait for Deployment:**
   - Vercel will build and deploy automatically
   - Copy the deployment URL (e.g., `https://melodica-api-xyz.vercel.app`)

### Part 3: Configure Environment Variables (2 minutes)

#### In API Project (melodica-api):

1. Go to your API project in Vercel
2. **Settings** → **Environment Variables**
3. Add:
   ```
   RESEND_API_KEY = re_your_actual_api_key_here
   RESEND_FROM_EMAIL = Melodica <noreply@resend.dev>
   ```
4. Click **"Save"**
5. **Redeploy** the API project (so it picks up the variables)

#### In Main App Project:

1. Go to your main app project in Vercel
2. **Settings** → **Environment Variables**
3. Add:
   ```
   NEXT_PUBLIC_API_URL = https://melodica-api-xyz.vercel.app
   ```
   (Use your actual API project URL)
4. Click **"Save"**
5. **Redeploy** your main app

### Part 4: Test (1 minute)

1. **Test API endpoint:**
   ```bash
   curl https://your-api-url.vercel.app/api/auth/send-verification
   ```
   Should return a 400 error (missing params) - that's good! It means the API is working.

2. **Test in your app:**
   - Go to your main app
   - Try registering a new user
   - Check that verification email is sent

## ✅ Checklist

- [ ] API project created (`melodica-api` folder exists)
- [ ] API project pushed to GitHub
- [ ] API project deployed to Vercel
- [ ] API project URL copied
- [ ] `RESEND_API_KEY` added to API project
- [ ] `RESEND_FROM_EMAIL` added to API project
- [ ] `NEXT_PUBLIC_API_URL` added to main app
- [ ] Both projects redeployed
- [ ] Test registration works

## 🔍 Verify Setup

Your API should be accessible at:
- `https://your-api-url.vercel.app/api/auth/send-verification`
- `https://your-api-url.vercel.app/api/auth/verify-email`

Your main app should use:
- `NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app`

## 🆘 Troubleshooting

### "API route not found"
- Check that API project deployed successfully
- Verify the URL in `NEXT_PUBLIC_API_URL` matches your API project URL
- Check Vercel function logs

### "Failed to send email"
- Verify `RESEND_API_KEY` is set correctly in API project
- Check Resend dashboard for API key status
- Verify `RESEND_FROM_EMAIL` format is correct

### "Environment variable not working"
- Make sure you redeployed after adding variables
- Check variable names are exact (case-sensitive)
- Verify you added them to the correct project (API vs Main)

## 📞 Need Help?

Check the logs:
- Vercel Dashboard → Your Project → Functions → View Logs

Common issues:
1. **API URL wrong**: Make sure `NEXT_PUBLIC_API_URL` points to your API project, not main app
2. **Missing env vars**: Both projects need their respective environment variables
3. **Not redeployed**: Always redeploy after adding environment variables

