# 🔗 Setting Up Stripe Webhook

## Step-by-Step Guide

### Step 1: Find Your Netlify Site URL

1. Go to your Netlify dashboard
2. Click on your site (melodicaapp.com or similar)
3. Look at the top of the page - you'll see your site URL
4. It will look like: `melodica-app.netlify.app` or `melodicaapp.netlify.app`

### Step 2: Create Webhook Endpoint in Stripe

1. Go to: https://dashboard.stripe.com/webhooks
   - Or: Stripe Dashboard → **Developers** (left sidebar) → **Webhooks**
2. Click **"+ Add endpoint"** (top right)
3. Enter your webhook URL:
   ```
   https://YOUR-NETLIFY-SITE-NAME.netlify.app/api/stripe/webhook
   ```
   **Replace `YOUR-NETLIFY-SITE-NAME` with your actual site name**

   Example: `https://melodica-app.netlify.app/api/stripe/webhook`

### Step 3: Select Events to Listen For

In the "Events to send" section, select these events:

**Required Events:**
- ✅ `checkout.session.completed` - When payment is successful
- ✅ `customer.subscription.created` - When subscription starts
- ✅ `customer.subscription.updated` - When subscription changes
- ✅ `customer.subscription.deleted` - When subscription is cancelled

**Optional but Recommended:**
- ✅ `payment_intent.succeeded` - Payment confirmation
- ✅ `payment_intent.payment_failed` - Failed payment notification

**Quick Select:**
- You can click "Select events" → Search for "checkout" and "subscription"
- Or click "Select all events" if you want to catch everything

### Step 4: Create Endpoint

1. Click **"Add endpoint"** at the bottom
2. Stripe will create the endpoint

### Step 5: Get Your Webhook Secret

1. After creating the endpoint, click on it in the webhooks list
2. Look for **"Signing secret"** section
3. Click **"Reveal"** or **"Click to reveal"**
4. Copy the secret (starts with `whsec_...`)
   - Example: `whsec_1234567890abcdef...`

### Step 6: Add to Netlify

1. Go back to Netlify → Your Site → Environment Variables
2. Click **"Add variable"**
3. Key: `STRIPE_WEBHOOK_SECRET`
4. Check **"Contains secret values"**
5. Values: Paste the `whsec_...` value you copied
6. Click **"Create variable"**

---

## 📝 Quick Checklist

- [ ] Found my Netlify site URL
- [ ] Created webhook endpoint in Stripe Dashboard
- [ ] Added webhook URL: `https://mysite.netlify.app/api/stripe/webhook`
- [ ] Selected events (checkout.session.completed, subscription.*, etc.)
- [ ] Revealed and copied webhook signing secret
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Netlify environment variables
- [ ] Redeployed site

---

## 🔍 Finding Your Netlify Site URL

### Method 1: Netlify Dashboard
1. Go to https://app.netlify.com
2. Click on your site
3. Site name/URL is shown at the top

### Method 2: From Deployments
1. Click "Deploys" in left sidebar
2. Click on any deployment
3. Look at the deployment URL in the details

### Method 3: Custom Domain
If you have a custom domain (melodicaapp.com), you can use that:
```
https://melodicaapp.com/api/stripe/webhook
```

---

## ✅ Test Your Webhook

After setup:
1. Make a test payment on your site
2. Go to Stripe Dashboard → Webhooks → Your endpoint
3. Click on **"Events"** tab
4. You should see events coming through when payments happen

---

## 🐛 Troubleshooting

**"No events received"**
- Check webhook URL is correct
- Make sure your site is deployed and live
- Test with a real payment

**"Webhook signature verification failed"**
- Double-check `STRIPE_WEBHOOK_SECRET` matches the one from Stripe
- Make sure you copied the entire secret (it's long!)

**"404 Not Found"**
- Verify the URL path is exactly: `/api/stripe/webhook`
- Check your site is deployed successfully

---

Need help? Make sure your webhook URL matches this pattern:
```
https://[your-site-name].netlify.app/api/stripe/webhook
```

