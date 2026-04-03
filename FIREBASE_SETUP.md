# Firebase Setup Guide for VultureX

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project**
3. Project name: `vulturex` (or whatever you like)
4. Disable Google Analytics (not needed) or enable it — your choice
5. Click **Create project**

## 2. Register a Web App

1. In your Firebase project, click the **</>** (Web) icon
2. App nickname: `vulturex-web`
3. **Do NOT** check "Also set up Firebase Hosting" (you're using GitHub Pages / Vercel)
4. Click **Register app**
5. Copy the config object — you'll need these values:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "vulturex-XXXXX.firebaseapp.com",
  projectId: "vulturex-XXXXX",
  storageBucket: "vulturex-XXXXX.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 3. Enable Authentication

1. Go to **Build → Authentication → Get started**
2. Click **Email/Password** provider
3. Enable **Email/Password** (toggle ON)
4. Optionally enable **Email link (passwordless sign-in)**
5. Click **Save**

## 4. Create Firestore Database

1. Go to **Build → Firestore Database → Create database**
2. Choose a location closest to your users (e.g., `us-east1`, `asia-south1`)
3. Start in **test mode** (you'll secure it later)
4. Click **Create**

### Firestore Security Rules (update after testing)

Go to **Firestore → Rules** and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only the owner can read/write their own doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Startups (public catalog): anyone can read, only authenticated users can write
    match /startups/{startupId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Startup profiles (user's own): only the owner can read/write
    match /startup_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Investors: only the owner can read/write (matched by email)
    match /investors/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
  }
}
```

Click **Publish**.

## 5. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values from step 2:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=vulturex-XXXXX.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vulturex-XXXXX
VITE_FIREBASE_STORAGE_BUCKET=vulturex-XXXXX.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 6. Run the App

```bash
npm install
npm run dev
```

## 7. Deploy

### Option A: Vercel
1. Push code to GitHub
2. Import repo in Vercel
3. Add all `VITE_FIREBASE_*` vars in Vercel project settings → Environment Variables
4. Deploy

### Option B: GitHub Pages
1. Set `base: '/VultureX/'` in `vite.config.ts` (if not using a custom domain)
2. Use a GitHub Actions workflow that builds and deploys to `gh-pages` branch
3. Add `VITE_FIREBASE_*` vars as repository secrets in GitHub → Settings → Secrets

## Firestore Collections

The app uses 4 collections (created automatically on first write):

| Collection | Document ID | Purpose |
|---|---|---|
| `users` | Firebase UID | Stores user role (startup/investor) |
| `startup_profiles` | Firebase UID | The user's own startup profile (dashboard data) |
| `startups` | Startup ID (number as string) | Public startup catalog for explore/browse |
| `investors` | Email address | Investor profiles |

## Free Tier Limits (permanent, not 12-month)

- **Auth**: 50,000 monthly active users
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day, 20K deletes/day
- **Hosting** (if used): 10 GB storage, 360 MB/day transfer

Your 350 startups + some investors is well within these limits.

## Development Mode

The app works **without Firebase configured**. When env vars are empty:
- Auth uses localStorage-based mock (sign in with any email/password)
- Data falls back to hardcoded seed startups
- Investor profiles save to localStorage only

This means you can develop and test locally without Firebase, then connect it when ready.

## Note on API Key Security

Firebase API keys are **not secret** — they're meant to be public and embedded in client-side code. Security is enforced by:
1. **Firestore Security Rules** (step 4 above)
2. **Auth rules** (Firebase validates tokens server-side)
3. **App Check** (optional, prevents abuse from non-app sources)

This is different from AWS where IAM keys must be kept secret.
