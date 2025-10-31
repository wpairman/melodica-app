# Melodica - Mental Wellness Companion

A comprehensive mental health app built with Next.js 15, React, TypeScript, and Tailwind CSS.

## 🎯 Features

- **Mood Tracking** - Track daily moods with detailed analytics
- **Music Preferences** - Personalized music quiz for recommendations
- **Period Tracker** - Comprehensive menstrual cycle tracking
- **Guided Sessions** - Meditation and breathing exercises
- **Journal** - AI-powered journal insights
- **Calendar Integration** - Smart scheduling and reminders
- **Analytics** - Visual mood trends and insights
- **Rewards System** - Gamified achievements
- **Virtual Garden** - Emotional wellbeing visualization
- **Therapist Finder** - Connect with mental health professionals
- **Emergency Support** - Crisis resources and grounding techniques

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/melodica-app.git

# Navigate to the project
cd melodica-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚠️ Important: Missing App Icons

Before deploying, you **must** create PWA icons:
- Create `/public/icons/` directory
- Add `icon-192x192.png` and `icon-512x512.png` (maskable icons)
- Add `favicon.ico` for browser tab icon
- See `APP_STORE_GUIDE.md` for full icon requirements

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js and deploys automatically

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Click "Deploy site"

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Add your Stripe keys for payment functionality
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Optional: Add your API keys
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

## 📱 Progressive Web App (PWA)

Melodica is a PWA and can be installed on mobile devices:

- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → Menu → Install App

## 🛠 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context API
- **Payments**: Stripe
- **Icons**: Lucide React

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@melodica.com or open an issue on GitHub.

---

Made with ❤️ for mental wellness
