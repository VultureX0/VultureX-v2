# VultureX

A startup-investor connection platform. Startups show verified traction, get scored, generate pitch decks, and connect with investors directly.

**Live**: https://vulturex-v2.vercel.app

**Test credentials**:
- Startup: `founder@greenpath.io` / `demo123`
- Investor: `investor@horizon.vc` / `demo123`

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle |
| Auth | NextAuth v5 (credentials + Google OAuth ready) |
| AI | OpenAI GPT-4o (deck generation) |
| Email | Resend |
| Animations | Framer Motion |
| Package manager | pnpm |

## Getting Started

```bash
# Install
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, RESEND_API_KEY

# Push schema to database
pnpm db:push

# Seed demo data
pnpm tsx db/seed.ts

# Run dev server
pnpm dev
```

Demo credentials:
- Startup: `founder@greenpath.io` / `demo123`
- Investor: `investor@horizon.vc` / `demo123`

## Architecture

```
VultureX/
├── middleware.ts              # Auth route protection (Next.js requires root placement)
├── app/
│   ├── (auth)/                # Login, signup (centered card layout)
│   ├── (marketing)/           # Landing page (public, redirects if logged in)
│   ├── (platform)/            # Authenticated app (sidebar layout)
│   │   ├── dashboard/         # Role-based home
│   │   ├── explore/           # Browse startups with filters
│   │   ├── rankings/          # Leaderboard by score
│   │   ├── interests/         # Sent/received connection requests
│   │   ├── saved/             # Bookmarked startups
│   │   ├── deck/              # Pitch deck management
│   │   ├── competitions/      # Sector challenges
│   │   ├── settings/          # Profile editing
│   │   └── onboarding/        # First-time setup forms
│   ├── deck/view/[token]/     # Public deck viewer (no auth)
│   └── api/                   # REST endpoints
├── components/
│   ├── ui/index.tsx           # Shared UI kit (Button, Card, Input, etc.)
│   ├── shared/                # App shell (Navbar, Sidebar, Footer)
│   ├── startup/               # ProfileCard, ScoreBadge
│   ├── investor/              # InterestButton, SaveButton
│   ├── deck/                  # SlideCard, DeckEditor
│   └── competition/           # EnterButton
├── features/
│   ├── auth/                  # NextAuth configuration
│   ├── scoring/               # VultureScore engine (0-100)
│   ├── deck/                  # OpenAI deck generator
│   └── notifications/         # Resend email service
├── db/
│   ├── schema.ts              # Drizzle table definitions
│   ├── index.ts               # DB connection
│   └── seed.ts                # Demo data
└── lib/
    └── utils.ts               # cn(), slugify()
```

## Database Schema

10 tables: `users`, `startups`, `investors`, `decks`, `competitions`, `competition_entries`, `interests`, `profile_views`, `deck_views`, `bookmarks`

## VultureScore (0-100)

Transparent formula-based ranking:

| Category | Max | Based on |
|----------|-----|----------|
| Traction | 35 | MRR, monthly growth, customer count |
| Financial | 25 | Runway, burn efficiency, funding raised |
| Team | 15 | Size, founder profile completeness, team depth |
| Market | 15 | Sector hotness, stage-appropriate metrics |
| Momentum | 10 | Profile views, investor interests, competition entries |

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create account |
| GET/POST | `/api/startups` | List/create startup profiles |
| GET/POST | `/api/investors` | List/create investor profiles |
| GET/POST/PATCH | `/api/interest` | Express/list/accept/decline interests |
| GET/POST/DELETE | `/api/bookmarks` | Save/list/remove bookmarks |
| POST | `/api/deck/generate` | Generate deck via OpenAI |
| GET/PUT | `/api/deck/[id]` | Get/update deck slides |
| POST | `/api/score` | Recompute score for a startup |
| GET | `/api/score/refresh` | Cron: recompute all scores (requires CRON_SECRET) |
| POST | `/api/views` | Track profile/deck views |
| GET | `/api/competitions` | List competitions |
| GET | `/api/competitions/[id]` | Competition details + leaderboard |
| POST | `/api/competitions/[id]/enter` | Enter a competition |

## Features - Working

- [x] Email/password auth with session management
- [x] Startup onboarding (multi-step form)
- [x] Investor onboarding (preferences form)
- [x] VultureScore computation on profile save
- [x] Score auto-refresh endpoint (cron-compatible)
- [x] Explore page with sector/stage/search filters
- [x] Rankings leaderboard with sector tabs
- [x] Startup profile pages with score breakdown
- [x] Express interest (investor to startup, with optional message)
- [x] Accept/decline interests (startup side)
- [x] Email notification on interest (via Resend)
- [x] Bookmark/save startups
- [x] Pitch deck generation (OpenAI GPT-4o)
- [x] Deck list, editor, public sharing via token
- [x] Competitions (list, detail, entry)
- [x] Settings with dirty-state detection
- [x] View tracking (profile + deck)
- [x] Dashboard with score breakdown, tips, activity feed
- [x] Landing page with product mockup and animations
- [x] Framer Motion animations throughout
- [x] Reusable UI component kit
- [x] SEO metadata with OG tags
- [x] Accessibility (aria labels, htmlFor, aria-current)

## Features - Not Built

- [ ] Stripe OAuth for verified revenue metrics
- [ ] Google OAuth button (provider configured, no UI)
- [ ] Forgot password / reset flow
- [ ] Deck PDF export
- [ ] Messaging between users
- [ ] Investor-startup matching algorithm
- [ ] Mobile responsive sidebar (hamburger menu)
- [ ] Rate limiting on API routes
- [ ] Zod validation on API inputs

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=random-string
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...          # Optional: falls back to console.log
CRON_SECRET=random-string      # For /api/score/refresh
```

## Scripts

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm start            # Start production server
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm tsx db/seed.ts   # Seed demo data
```

## Deploy

Designed for Vercel:
```bash
vercel deploy
```

Required env vars on Vercel: `DATABASE_URL`, `NEXTAUTH_SECRET`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`

Optional: Set up Vercel Cron to hit `GET /api/score/refresh` with `Authorization: Bearer $CRON_SECRET` header daily.

## Design System

- Background: `#171717` (warm dark, not pitch black)
- Cards: `#1c1c1c`
- Borders: `#2e2e2e`
- Accent: `#3ecf8e` (emerald green, Supabase-inspired)
- Text: `#ededed` / `#b3b3b3` / `#707070`
- Radius: `rounded-md` (buttons/inputs), `rounded-xl` (cards)
- Font: Inter, system-ui
- Animations: Framer Motion (staggered reveals, hover lifts, animated progress bars)
