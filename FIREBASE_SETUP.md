# Firebase Setup Guide

This guide will help you set up Firebase for the CoreBank Demo application.

## Prerequisites

- A Firebase account (free tier works fine)
- Node.js 20+ installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "corebank-demo")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication" → "Get started"
2. Enable "Email/Password" provider
3. Save

## Step 3: Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in production mode" (or test mode for development)
3. Select a location closest to your users (e.g., "asia-south1" for India)
4. Click "Enable"

## Step 4: Get Firebase Config (Client-side)

1. Go to Project Settings (gear icon)
2. Under "Your apps", click the web icon (</>)
3. Register app with a nickname (e.g., "corebank-web")
4. Copy the Firebase config object

## Step 5: Get Service Account Key (Server-side)

1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Save the JSON file as `serviceAccountKey.json` in the project root

## Step 6: Configure Environment Variables

Update your `.env` file with the Firebase configuration:

```env
# Firebase Client Config (from Step 4)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config (from serviceAccountKey.json)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key here...\n-----END PRIVATE KEY-----\n"
```

## Step 7: Seed the Database

```bash
# Seed Firebase with demo data
npm run seed:firebase
```

## Step 8: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Option B: Using Vercel Dashboard

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel dashboard
6. Deploy

## Environment Variables for Vercel

Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

**Important**: For `FIREBASE_PRIVATE_KEY`, make sure to include the quotes and newlines as shown in the .env file.

## Firestore Security Rules

For development, you can use these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For production, implement proper rules based on user roles.

## Testing

1. Run the development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Login with demo credentials:
   - admin@corebank.demo / admin123
   - teller@corebank.demo / teller123

## Troubleshooting

### "Failed to parse private key"
Make sure the `FIREBASE_PRIVATE_KEY` is properly escaped with `\n` for newlines.

### "Permission denied"
Check your Firestore security rules. For development, you can allow all authenticated access.

### "Auth user not found"
Make sure you ran `npm run seed:firebase` to create the demo users.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Firebase Auth  │────▶│   JWT Token     │
│   (Client)      │     │   (Client SDK)  │     │   (ID Token)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               ▼
         │                                      ┌─────────────────┐
         │                                      │   API Routes    │
         │                                      │   (Server)      │
         │                                      └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│  Firebase Auth  │◄───────────────────────────│  Admin SDK      │
│  (Verify Token) │                            │  (Verify +      │
│                 │                            │   Firestore)    │
└─────────────────┘                            └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Firestore     │
                                               │   Database      │
                                               └─────────────────┘
```

## Benefits of Firebase

1. **Serverless**: No database server to manage
2. **Scalable**: Automatically scales with your app
3. **Real-time**: Easy to add real-time features later
4. **Auth**: Built-in authentication with multiple providers
5. **Free Tier**: Generous free tier for development
6. **Vercel Compatible**: Works perfectly with Vercel's serverless functions

## Next Steps

- Implement Firestore security rules for production
- Add Firebase Storage for document uploads
- Enable Firebase Analytics for tracking
- Set up Firebase Functions for background jobs
