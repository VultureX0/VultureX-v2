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

    // Competitions: signed-in users can read; admin users can write
    match /competitions/{competitionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // Competition winners: signed-in users can read; admin users can write
    match /competition_winners/{winnerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // Leaderboard definitions: signed-in users can read; admin users can write
    match /leaderboards/{leaderboardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // Leaderboard entries: signed-in users can read; admin users can write
    match /leaderboard_entries/{entryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
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

The app uses 8 collections (created automatically on first write):

| Collection | Document ID | Purpose |
|---|---|---|
| `users` | Firebase UID | Stores user role (startup/investor) |
| `startup_profiles` | Firebase UID | The user's own startup profile (dashboard data) |
| `startups` | Startup ID (number as string) | Public startup catalog for explore/browse |
| `investors` | Email address | Investor profiles |
| `competitions` | Competition ID (string slug or UUID) | Active/upcoming/completed competitions |
| `competition_winners` | Winner entry ID | Historical winner list shown in past winners |
| `leaderboards` | Category ID (`overall`, `cleantech`, etc.) | Leaderboard metadata for each category |
| `leaderboard_entries` | Entry ID (UUID) | Ranked startup rows per leaderboard category |

### Competition document shape

```
{
  id: string,
  title: string,
  host: string,
  prize: string,
  sector: string,
  stage: string,
  applicants: number,
  criteria: string[],
  color: string,
  sdg: boolean,
  deadline?: string,
  opensOn?: string,
  status: 'active' | 'upcoming' | 'completed'
}
```

### Leaderboard entry document shape

```
{
  id: string,
  category: 'overall' | 'cleantech' | 'fintech' | 'web3' | 'impact' | 'rising' | 'investor',
  rank: number,
  startupId?: string,
  name: string,
  sector: string,
  stage: string,
  score: number,
  sdg: boolean,
  change: number,
  desc: string,
  investors: number
}
```

## Initial Data Bootstrap (Admin)

After creating an admin user (`users/{uid}.role = "admin"`), sign in and open:

- `/workspace/bootstrap-kit`

This hidden admin page can seed:

- Competitions + winners
- Leaderboard definitions
- Leaderboard entries

Use "Seed Everything" once after first setup, then manage data from:

- `/workspace/sync-center` (competitions)
- `/workspace/ranking-lab` (leaderboards)

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
