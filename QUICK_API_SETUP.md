# Quick API Setup Guide

## Step-by-Step Instructions

### Option A: Separate API Project (Recommended)

#### Step 1: Create API Project

Run the setup script:
```bash
./setup-api-project.sh
```

This creates a `melodica-api` folder with all necessary files.

#### Step 2: Set Up API Project

```bash
cd melodica-api
npm install
```

#### Step 3: Create GitHub Repository

1. Create a new repository on GitHub (e.g., `melodica-api`)
2. Push the API project:

```bash
git init
git add .
git commit -m "Initial API project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/melodica-api.git
git push -u origin main
```

#### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your `melodica-api` repository
4. Vercel will auto-detect Next.js
5. Click **"Deploy"**

#### Step 5: Configure Environment Variables

In your Vercel API project:
1. Go to **Settings** → **Environment Variables**
2. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = `Melodica <noreply@yourdomain.com>`

#### Step 6: Get API URL

After deployment, copy your API project URL:
- Example: `https://melodica-api.vercel.app`
- Your API routes will be at: `https://melodica-api.vercel.app/api/auth/send-verification`

#### Step 7: Configure Main App

In your **main app's Vercel project**:
1. Go to **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_API_URL` = `https://melodica-api.vercel.app`
   - `RESEND_API_KEY` = your Resend API key (if needed)
   - `RESEND_FROM_EMAIL` = `Melodica <noreply@yourdomain.com>`

#### Step 8: Redeploy Main App

After adding `NEXT_PUBLIC_API_URL`, redeploy your main app so it picks up the new environment variable.

### Option B: Use Existing API Routes (Alternative)

If you prefer to keep everything in one repository:

1. Create a separate branch for API routes
2. Modify `next.config.mjs` to remove static export for that branch
3. Deploy that branch as a separate Vercel project
4. Configure `NEXT_PUBLIC_API_URL` as above

## Testing

After setup, test the API:

```bash
# Test send verification email
curl -X POST https://your-api-url.vercel.app/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","token":"test_token"}'
```

## Troubleshooting

### API returns 404
- Check that routes are in `app/api/` folder
- Verify deployment succeeded
- Check Vercel function logs

### CORS errors
- Vercel handles CORS automatically for API routes
- If issues persist, check your API URL configuration

### Environment variables not working
- Make sure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

## Current API Routes

Your API project includes:
- `/api/auth/send-verification` - Send verification email
- `/api/auth/verify-email` - Verify email token
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/stripe/checkout` - Stripe checkout
- `/api/stripe/verify-session` - Verify Stripe session
- `/api/calendar-sync` - Calendar sync

