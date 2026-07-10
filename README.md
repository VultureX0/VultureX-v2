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
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle |
| Auth | NextAuth v5 beta (credentials + Google OAuth ready) |
| AI | OpenAI GPT-4o (deck generation) |
| Email | Resend |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion |
| Validation | Zod v4 |
| Package manager | pnpm |

## Getting Started

```bash
# Install
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in: DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY, RESEND_API_KEY

# Push schema to database
pnpm db:push

# Seed demo data
pnpm tsx db/seed.ts

# Run dev server
pnpm dev
```

## Architecture

```
VultureX/
├── middleware.ts              # Auth route protection (Next.js requires root placement)
├── app/
│   ├── (auth)/                # Login, signup (centered card layout)
│   ├── (marketing)/           # Landing page (public, Navbar + Footer layout)
│   │   ├── page.tsx           # Home — live stats, hero, features, top startups
│   │   ├── hero.tsx           # Animated hero section
│   │   ├── features.tsx       # Feature grid
│   │   └── startup-table.tsx  # Top startups preview
│   ├── (platform)/            # Authenticated app (sidebar layout)
│   │   ├── dashboard/         # Role-based home with score breakdown & activity
│   │   ├── explore/           # Browse startups with filters + [slug] detail pages
│   │   ├── rankings/          # Leaderboard by score with sector tabs
│   │   ├── interests/         # Sent/received connection requests
│   │   ├── saved/             # Bookmarked startups
│   │   ├── deck/              # Pitch deck list, [id] editor, /new generator
│   │   ├── competitions/      # Sector challenges list + [id] detail/leaderboard
│   │   ├── settings/          # Profile editing with dirty-state detection
│   │   └── onboarding/        # startup/ and investor/ multi-step forms
│   ├── deck/view/[token]/     # Public deck viewer (no auth required)
│   └── api/                   # REST endpoints
├── components/
│   ├── ui/index.tsx           # Shared UI kit (Button, Card, Input, Badge, etc.)
│   ├── shared/                # App shell (Navbar, Sidebar, Footer, Providers, ViewTracker)
│   ├── startup/               # ProfileCard, ScoreBadge
│   ├── investor/              # InterestButton, SaveButton
│   ├── deck/                  # SlideCard, DeckEditor
│   └── competition/           # EnterButton
├── features/
│   ├── auth/                  # NextAuth v5 configuration (auth.config.ts)
│   ├── scoring/               # VultureScore engine (0-100)
│   ├── deck/                  # OpenAI deck generator + types
│   └── notifications/         # Resend email service
├── db/
│   ├── schema.ts              # Drizzle table definitions (10 tables)
│   ├── index.ts               # DB connection (postgres driver)
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # Generated SQL migrations
└── lib/
    └── utils.ts               # cn(), slugify()
```

## Database Schema

10 tables: `users`, `startups`, `investors`, `decks`, `competitions`, `competition_entries`, `interests`, `profile_views`, `bookmarks`, `deck_views`

Key relationships:
- `users` → `startups` / `investors` (1:1 per role)
- `startups` → `decks` (1:many)
- `investors` → `interests` → `startups` (many:many via interests)
- `competitions` → `competition_entries` → `startups` (many:many)

## VultureScore (0-100)

Transparent formula-based ranking:

| Category | Max | Based on |
|----------|-----|----------|
| Traction | 35 | MRR thresholds, monthly growth rate, customer count |
| Financial | 25 | Runway length, burn efficiency (MRR/burn ratio), total raised |
| Team | 15 | Headcount, founder profile completeness, role coverage depth |
| Market | 15 | Sector heat (hot/warm/normal), stage-appropriate traction validation |
| Momentum | 10 | Profile views (30d), investor interests received, competition participation |

Hot sectors: AI, ML, Climate, Fintech, HealthTech
Warm sectors: SaaS, EdTech, BioTech, Cybersecurity

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create account |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth session handler |
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

## Protected Routes

Middleware protects: `/dashboard`, `/deck`, `/onboarding`, `/settings`, `/saved`, `/interests`

Auth check uses `authjs.session-token` or `__Secure-authjs.session-token` cookies. Unauthenticated users are redirected to `/login?callbackUrl=...`.

## Features - Working

- [x] Email/password auth with session management
- [x] Startup onboarding (multi-step form)
- [x] Investor onboarding (preferences form)
- [x] VultureScore computation on profile save
- [x] Score auto-refresh endpoint (cron-compatible)
- [x] Explore page with sector/stage/search filters
- [x] Startup detail pages (`/explore/[slug]`)
- [x] Rankings leaderboard with sector tabs
- [x] Express interest (investor → startup, with optional message)
- [x] Accept/decline interests (startup side)
- [x] Email notification on interest (via Resend)
- [x] Bookmark/save startups
- [x] Pitch deck generation (OpenAI GPT-4o)
- [x] Deck list, editor, public sharing via token
- [x] Competitions (list, detail, entry, leaderboard)
- [x] Settings with dirty-state detection
- [x] View tracking (profile + deck)
- [x] Dashboard with score breakdown, tips, activity feed
- [x] Landing page with live stats, animated hero, feature grid, top startups table
- [x] Framer Motion animations throughout
- [x] Recharts for dashboard visualizations
- [x] Reusable UI component kit
- [x] Zod validation (library included)

## Features - Not Built

- [ ] Stripe OAuth for verified revenue metrics
- [ ] Google OAuth button (provider configured in env, no UI)
- [ ] Forgot password / reset flow
- [ ] Deck PDF export
- [ ] Messaging between users
- [ ] Investor-startup matching algorithm
- [ ] Mobile responsive sidebar (hamburger menu)
- [ ] Rate limiting on API routes

## Environment Variables

```
# Required
DATABASE_URL=postgresql://...
AUTH_SECRET=random-string
AUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...

# Optional
RESEND_API_KEY=re_...                    # Falls back to console.log
AUTH_GOOGLE_ID=                          # Google OAuth
AUTH_GOOGLE_SECRET=
STRIPE_CLIENT_ID=                        # Future: verified metrics
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_CONNECT_URL=
CRON_SECRET=random-string                # For /api/score/refresh
```

## Scripts

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # ESLint
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm tsx db/seed.ts   # Seed demo data
```

## Deploy

Designed for Vercel (region: `bom1` via `vercel.json`):

```bash
vercel deploy
```

Required env vars on Vercel: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `OPENAI_API_KEY`

Optional: Set up Vercel Cron to hit `GET /api/score/refresh` with `Authorization: Bearer $CRON_SECRET` header daily.

## Design System

- Background: `#171717` (warm dark, not pitch black)
- Cards: `#1c1c1c`
- Borders: `#2e2e2e`
- Accent: `#3ecf8e` (emerald green)
- Text: `#ededed` / `#b3b3b3` / `#707070`
- Radius: `rounded-md` (buttons/inputs), `rounded-xl` (cards)
- Font: Inter, system-ui
- Animations: Framer Motion (staggered reveals, hover lifts, animated progress bars)
