# API Routes Setup Guide

Since your app uses static export (`output: 'export'`), API routes need to be deployed separately. Here are the best options:

## Option 1: Vercel Serverless Functions (Recommended - Easiest)

Vercel automatically detects and deploys serverless functions from the `/api` folder.

### Step 1: Create API Functions

The API routes are already in `api-routes/api/auth/`. We'll create Vercel-compatible serverless functions.

### Step 2: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Melodica <noreply@yourdomain.com>
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

### Step 3: Deploy

After deployment, Vercel will automatically:
- Deploy your main app (static export)
- Deploy API routes as serverless functions
- Set up the API URL automatically

Your API will be available at: `https://your-project.vercel.app/api/auth/send-verification`

## Option 2: Separate API Project (More Control)

Deploy the `api-routes/` folder as a separate Next.js project.

### Step 1: Create New Vercel Project

1. Create a new folder: `melodica-api`
2. Copy `api-routes/` contents to the new project
3. Create a minimal `next.config.mjs`:

```js
export default {
  // No static export - this is API only
}
```

### Step 2: Deploy API Project

1. Push to GitHub
2. Create new Vercel project from the API repo
3. Deploy

### Step 3: Configure Main App

Set `NEXT_PUBLIC_API_URL` in your main app to point to the API project:
```
NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
```

## Option 3: Use Existing API Routes Structure

If you want to keep the current structure, you can deploy `api-routes/` as a separate service.

## Quick Setup (Recommended)

The easiest approach is to use Vercel's built-in serverless functions. I'll create the necessary files for you.

