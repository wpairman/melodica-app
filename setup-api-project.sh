#!/bin/bash

# Script to set up a separate API project for Vercel deployment

echo "🚀 Setting up API project..."

# Create API project directory
API_DIR="melodica-api"
mkdir -p "$API_DIR"

# Copy API routes
echo "📁 Copying API routes..."
cp -r api-routes/api "$API_DIR/app/api"

# Copy necessary files
echo "📄 Creating API project files..."

# Create package.json for API project
cat > "$API_DIR/package.json" << 'EOF'
{
  "name": "melodica-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.2.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "resend": "^6.5.2"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
EOF

# Create next.config.mjs (NO static export - API only)
cat > "$API_DIR/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes only - no static export
}

export default nextConfig
EOF

# Create tsconfig.json
cat > "$API_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Copy lib/email-utils.ts
mkdir -p "$API_DIR/lib"
cp lib/email-utils.ts "$API_DIR/lib/email-utils.ts"

echo "✅ API project created in $API_DIR/"
echo ""
echo "📝 Next steps:"
echo "1. cd $API_DIR"
echo "2. npm install"
echo "3. Push to a new GitHub repository"
echo "4. Create a new Vercel project from that repository"
echo "5. Add environment variables (RESEND_API_KEY, RESEND_FROM_EMAIL)"
echo "6. Deploy"
echo "7. Copy the deployment URL and set NEXT_PUBLIC_API_URL in your main app"

