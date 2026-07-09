# VultureX - Product & Technical Plan

> **"LinkedIn for Startup Fundraising"**
>
> Where startups meet investors - based on verified traction, not networks or hype.

---

## Current Status (July 2026)

**MVP is built and functional.** The platform has working auth, onboarding, scoring, deck generation, investor-startup connections, bookmarks, competitions, and a polished UI with Framer Motion animations.

### What's Live
- Full auth flow (email/password)
- Startup + investor onboarding
- VultureScore (0-100, transparent formula)
- Pitch deck generation via OpenAI
- Interest system (express/accept/decline + email notifications)
- Bookmarks/saved startups
- Competitions with leaderboards
- Score auto-refresh cron endpoint
- Animated dark UI (Supabase-inspired design)

### What's Next
- Stripe OAuth for verified revenue
- Google OAuth login
- Deck PDF export
- Messaging between users
- Mobile responsive sidebar
- Rate limiting + input validation

> **Note**: The original plan below references Stripe integration and some features that haven't been built yet. The current state is reflected in README.md. Stripe, file storage, and payment features are deferred to post-MVP.

---

## Table of Contents

1. [What We're Building](#what-were-building)
2. [Stack](#stack)
3. [Features At Launch](#features-at-launch)
4. [VultureScore - Ranking Formula](#vulturescore--ranking-formula)
5. [PitchForge - Auto Deck Generation](#pitchforge--auto-deck-generation)
6. [Competitions](#competitions)
7. [Database Schema](#database-schema)
8. [File Tree](#file-tree)
9. [Pages & Routes](#pages--routes)
10. [Revenue Model](#revenue-model)
11. [Build Timeline](#build-timeline)
12. [Post-Launch Additions](#post-launch-additions)

---


## What We're Building

A platform where:

- **Startups** sign up, build a profile, get a live VultureScore (0-100), auto-generate a pitch deck, enter competitions, and get discovered by investors.
- **Investors** sign up, set preferences (sector, stage, check size), browse ranked startups, view their decks, and express interest directly.

The core loop: Startups build profile -> Get scored -> Investors browse -> Interest expressed -> Connection made -> Deal happens off-platform (for now) -> We take 3% success fee.

### What Makes This Win

1. **VultureScore** - Transparent, formula-based ranking that investors trust and startups optimize for.
2. **PitchForge** - 60-second pitch deck generation is the hook that gets every founder in the door.
3. **Direct connections** - Investors express interest, startups accept/decline. No middlemen.
4. **Competitions** - Time-boxed challenges with public leaderboards create urgency and virality.
5. **Fair by default** - Merit-based. A solo founder with great metrics outranks a well-connected founder with flat growth.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 16 (App Router, Turbopack) | Frontend + API routes. One codebase, one deploy. |
| **Language** | TypeScript | End-to-end type safety, one language everywhere. |
| **Styling** | Tailwind CSS v4 | Utility-first, fast iteration. |
| **Database** | PostgreSQL (Neon) | Managed, serverless, free tier. |
| **ORM** | Drizzle | Type-safe, lightweight, raw SQL when needed. |
| **Auth** | NextAuth.js (Auth.js v5) | Email/password + Google OAuth ready. |
| **LLM** | OpenAI API (gpt-4o) | Deck generation. Single prompt, JSON output. |
| **Hosting** | Vercel | Zero-config Next.js deploys. |
| **Email** | Resend | Interest notifications. Falls back to console.log in dev. |
| **Animations** | Framer Motion | Staggered reveals, hover effects, progress bars. |
| **Charts** | Recharts | Score breakdowns (available, not heavily used yet). |

**Total infrastructure**: 1 app (Vercel) + 1 database (Neon)

No Redis. No Python service. No job queues. No Kubernetes.
| **Animations** | Framer Motion | Landing page polish. |
| **Charts** | Recharts | Score breakdowns, traction displays in decks. |

**Total infrastructure**: 1 app (Vercel) + 1 database (managed Postgres)

No Redis. No Python service. No job queues. No vector DB. No Kubernetes.

---


## Features At Launch

### For Startups

| Feature | Description |
|---------|-------------|
| Sign up & onboard | Multi-step form: company info, traction metrics, team, pitch narrative |
| Connect Stripe | OAuth -> auto-pull MRR, customer count, growth rate (verified badge) |
| VultureScore | Live score (0-100) with transparent breakdown |
| PitchForge | One-click pitch deck generation from profile data |
| Edit deck | Inline text editing, regenerate individual slides |
| Share deck | Public link (no auth required to view) |
| Public profile | SEO-friendly startup page with score, metrics, deck |
| Enter competitions | Join sector challenges, ranked by VultureScore |
| View signals | "5 investors viewed your profile this week" |
| Receive interest | Email notification when investor expresses interest |

### For Investors

| Feature | Description |
|---------|-------------|
| Sign up & onboard | Preferences: investor type, sectors, stages, check size, thesis |
| Browse startups | Filter by sector, stage, score range. Sort by score. |
| Sector leaderboards | Top startups per sector, updated live |
| View profiles | Full startup profile + metrics + pitch deck |
| Express interest | One click -> startup gets notified with investor's info |
| Competition viewers | Browse competition entries and their decks |
| Saved startups | Bookmark startups to track later |

### For Both

| Feature | Description |
|---------|-------------|
| Landing page | Explains value prop, shows live stats, two CTAs |
| Email notifications | Interest expressed, profile views (weekly digest) |
| Settings | Edit profile, manage integrations, account |

---


## VultureScore - Ranking Formula

A transparent, deterministic score from 0-100. No black-box ML. Founders can read the rules and know exactly how to improve.

### Composition

| Category | Max Points | What It Measures |
|----------|-----------|-----------------|
| **Traction** | 35 | Revenue, growth rate, customers, verified status |
| **Financial Health** | 25 | Burn efficiency, runway, funding raised |
| **Team** | 15 | Size, completeness, founder experience |
| **Market** | 15 | Sector attractiveness, stage-appropriate metrics |
| **Momentum** | 10 | Profile views, investor interest, competition entries |

### Scoring Rules (Traction - 35 pts)

```
MRR (0-15 points):
  > $100K  -> 15
  > $50K   -> 12
  > $10K   -> 9
  > $1K    -> 5
  > $0     -> 2
  = $0     -> 0

Monthly Growth Rate (0-12 points):
  > 30%    -> 12
  > 20%    -> 10
  > 10%    -> 7
  > 5%     -> 4
  > 0%     -> 2
  ≤ 0%     -> 0

Customers (0-5 points):
  > 100    -> 5
  > 20     -> 3
  > 0      -> 1
  = 0      -> 0

Verified via Stripe (0-3 points):
  Connected -> 3
  Not       -> 0
```

### Scoring Rules (Financial Health - 25 pts)

```
Runway (0-10 points):
  > 18 months  -> 10
  > 12 months  -> 8
  > 6 months   -> 5
  > 3 months   -> 2
  Not provided -> 0

Burn Efficiency - revenue / burn rate (0-10 points):
  > 1.0 (profitable)  -> 10
  > 0.5               -> 7
  > 0.2               -> 4
  > 0                  -> 2
  No data              -> 0

Funding Raised (0-5 points):
  > $5M    -> 5
  > $1M    -> 4
  > $500K  -> 3
  > $100K  -> 2
  > $0     -> 1
  = $0     -> 0
```

### Scoring Rules (Team - 15 pts)

```
Team Size (0-5 points):
  > 10     -> 5
  > 5      -> 4
  > 2      -> 3
  = 2      -> 2
  = 1      -> 1

Founder Profile Completeness (0-5 points):
  Has bio + LinkedIn + role -> 5
  Has 2 of 3               -> 3
  Has 1 of 3               -> 1

Team Roles Covered (0-5 points):
  Tech + Business + Domain  -> 5
  Two covered               -> 3
  One role only             -> 1
```

### Scoring Rules (Market - 15 pts)

```
Sector Hotness (0-8 points):
  AI/ML, Climate, Fintech     -> 8
  SaaS, Health, Edtech        -> 6
  E-commerce, Marketplace     -> 5
  Other                       -> 3

Stage-Appropriate Metrics (0-7 points):
  Pre-seed with users         -> 7
  Seed with revenue           -> 7
  Series A with $50K+ MRR     -> 7
  Metrics below stage norms   -> 2-5 (sliding)
```

### Scoring Rules (Momentum - 10 pts)

```
Profile Views (last 30 days) (0-4 points):
  > 50 views   -> 4
  > 20 views   -> 3
  > 5 views    -> 2
  > 0 views    -> 1

Investor Interests Received (0-4 points):
  > 5          -> 4
  > 2          -> 3
  > 0          -> 1
  = 0          -> 0

Active in Competitions (0-2 points):
  Currently entered -> 2
  Not entered       -> 0
```

### Key Properties

- **Transparent**: Founders see their full breakdown and know how to improve.
- **Verified > Self-reported**: Stripe-connected metrics get bonus points.
- **Living**: Score updates whenever metrics change or platform activity happens.
- **Sector-aware**: "Market" category adjusts expectations by sector and stage.
- **No gaming**: Momentum points are capped low (10/100). The real score comes from actual traction.

---


## PitchForge - Auto Deck Generation

### How It Works

1. Startup fills profile (problem, solution, metrics, team)
2. Clicks "Generate Pitch Deck"
3. We send structured profile data to GPT-4o with a carefully crafted prompt
4. LLM returns structured JSON for 8-10 slides
5. We render them as web-based slides (React components)
6. Founder can edit text inline and regenerate individual slides
7. Shareable via public link

### Slide Structure

Every generated deck contains these slides in order:

| # | Slide Type | Content Source |
|---|-----------|---------------|
| 1 | **Title** | Company name + AI-generated hook line |
| 2 | **Problem** | From `problem` field + quantified pain |
| 3 | **Solution** | From `solution` field + framing |
| 4 | **Market** | Sector + stage -> AI estimates TAM/SAM/SOM |
| 5 | **Traction** | From metrics (MRR, growth, customers) + chart |
| 6 | **Business Model** | AI infers from sector + revenue data |
| 7 | **Team** | Founder info + team size + key strengths |
| 8 | **The Ask** | AI suggests raise amount based on stage + metrics |

Optional slides added when data exists:
- **Milestones** - if startup has notable achievements
- **Competition** - AI identifies competitors from sector
- **Impact** - if SDG/impact-related

### Implementation

```typescript
// Single prompt, single LLM call, structured JSON output

const prompt = `Generate a pitch deck for this startup as a JSON array of slides.

STARTUP:
${JSON.stringify(startupData, null, 2)}

Return exactly this structure:
[
  {
    "type": "title" | "problem" | "solution" | "market" | "traction" | "business_model" | "team" | "ask",
    "headline": "Bold headline, max 8 words",
    "body": "2-3 sentences, compelling and specific",
    "bullets": ["point 1", "point 2", "point 3"],  // optional
    "metric": { "value": "$47K", "label": "Monthly Revenue" }  // optional
  }
]

Rules:
- Use actual numbers from the data. Never make up metrics.
- Write like a confident founder, not a corporate marketer.
- Traction slide: emphasize growth rate over absolute numbers.
- Ask slide: suggest raise amount appropriate for their stage.
- Be concise. Investors skim - every word must earn its place.`;
```

### Rendering

Slides are stored as JSON in the `decks.slides` column and rendered as React components:

```tsx
function SlideRenderer({ slide }: { slide: Slide }) {
  return (
    <div className="aspect-[16/9] p-12 bg-white rounded-2xl border">
      <h1 className="text-4xl font-bold mb-4">{slide.headline}</h1>
      <p className="text-xl text-gray-600 mb-6">{slide.body}</p>
      {slide.bullets && (
        <ul className="space-y-2">
          {slide.bullets.map(b => <li key={b}>• {b}</li>)}
        </ul>
      )}
      {slide.metric && (
        <div className="mt-8 text-center">
          <div className="text-5xl font-bold">{slide.metric.value}</div>
          <div className="text-gray-500">{slide.metric.label}</div>
        </div>
      )}
    </div>
  );
}
```

### Editing

- Click any text -> contentEditable or inline input
- "Regenerate this slide" button -> re-prompts LLM for just that slide
- Changes save to the `slides` JSONB column

### Sharing

Each deck gets a `share_token`. Public URL: `/deck/view/{share_token}`
- No auth required to view
- Simple open tracking (insert into `deck_views` on load)

---


## Competitions

### Concept

Simple, time-boxed challenges where startups compete for visibility and prizes. The ranking is automated - it's just the VultureScore leaderboard filtered to competition entrants.

### How It Works

1. We create a competition (e.g., "Climate Tech Challenge - July 2026")
2. Startups in that sector join and attach their pitch deck
3. A live leaderboard shows entrants ranked by VultureScore
4. Deadline hits -> top 3 are declared winners
5. Winners get featured placement + prize (could be cash, investor intros, or accelerator spots)

### Why It's Simple

- **No judges**: VultureScore IS the judge. Transparent, no politics.
- **No complex lifecycle**: Just `active` -> `completed`. Two states.
- **No separate scoring**: Uses the same score the startup already has. Improve your metrics -> your rank goes up.
- **Entry = one click + pick your deck**: No extra forms, no submissions to review.

### Rules

- A startup can enter one competition per sector at a time
- Must have a pitch deck generated (or uploaded) to enter
- Score updates live during the competition period - rankings shift in real-time
- After deadline, final rankings are locked

### Data Model

```sql
CREATE TABLE competitions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    sector      TEXT,                    -- NULL = open to all sectors
    prize       TEXT,                    -- display text: "$50K", "5 VC intros"
    deadline    TIMESTAMPTZ NOT NULL,
    status      TEXT DEFAULT 'active',   -- active, completed
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competition_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id  UUID REFERENCES competitions(id) ON DELETE CASCADE,
    startup_id      UUID REFERENCES startups(id) ON DELETE CASCADE,
    deck_id         UUID REFERENCES decks(id),
    entered_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, startup_id)
);
```

### Leaderboard Query

```sql
SELECT
    s.name,
    s.slug,
    s.score,
    s.sector,
    s.logo_url,
    d.share_token AS deck_token,
    ce.entered_at
FROM competition_entries ce
JOIN startups s ON s.id = ce.startup_id
JOIN decks d ON d.id = ce.deck_id
WHERE ce.competition_id = $1
ORDER BY s.score DESC;
```

### Competition Page UI

```
┌─────────────────────────────────────────────────────────┐
│  🏆 Climate Tech Challenge                               │
│  Prize: $50K + intros to 5 climate VCs                  │
│  Deadline: July 30, 2026 (14 days left)                 │
│  Entries: 47                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  #1  🟢 GreenPath     Score: 82   Growth: +34%  [View] │
│  #2  🟢 SolarFlow     Score: 76   Growth: +28%  [View] │
│  #3  🟢 CarbonLock    Score: 71   Growth: +22%  [View] │
│  #4     EcoRoute      Score: 68   Growth: +19%  [View] │
│  #5     CleanGrid     Score: 64   Growth: +15%  [View] │
│  ...                                                    │
│                                                         │
│  [Enter Competition] (if startup in matching sector)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Why This Drives Growth

- **Urgency**: Deadlines create "improve your metrics THIS WEEK" pressure
- **Virality**: "I'm ranked #3 in the Climate Tech Challenge on VultureX" -> social sharing
- **Investor hook**: Investors browse competition leaderboards to find top startups
- **Content**: Each competition is a blog post, a tweet, a newsletter item
- **Repeat engagement**: New competitions every month -> reason to come back

---


## Database Schema

7 tables total. That's the entire database.

```sql
-- ============================================
-- USERS & AUTH (managed by NextAuth)
-- ============================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    role        TEXT NOT NULL CHECK (role IN ('startup', 'investor')),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STARTUPS
-- ============================================
CREATE TABLE startups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    slug                TEXT UNIQUE NOT NULL,
    name                TEXT NOT NULL,
    tagline             TEXT,
    sector              TEXT NOT NULL,
    stage               TEXT NOT NULL,          -- pre-seed, seed, series-a, series-b
    location            TEXT,
    website             TEXT,
    logo_url            TEXT,
    -- Narrative
    problem             TEXT,
    solution            TEXT,
    -- Traction (self-reported or from Stripe)
    mrr                 INTEGER DEFAULT 0,      -- monthly revenue in cents
    monthly_growth      NUMERIC(5,2) DEFAULT 0, -- percentage
    active_users        INTEGER DEFAULT 0,
    customers           INTEGER DEFAULT 0,
    -- Financials
    funding_raised      INTEGER DEFAULT 0,      -- total, in cents
    burn_rate           INTEGER DEFAULT 0,      -- monthly, in cents
    runway_months       INTEGER DEFAULT 0,
    -- Team
    founder_name        TEXT,
    founder_role        TEXT,
    founder_bio         TEXT,
    founder_linkedin    TEXT,
    team_size           INTEGER DEFAULT 1,
    -- Platform
    stripe_connected    BOOLEAN DEFAULT FALSE,
    score               NUMERIC(5,2) DEFAULT 0,
    score_breakdown     JSONB,                  -- {traction, financial, team, market, momentum}
    is_public           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_startups_sector_score ON startups(sector, score DESC);
CREATE INDEX idx_startups_score ON startups(score DESC);

-- ============================================
-- INVESTORS
-- ============================================
CREATE TABLE investors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name           TEXT NOT NULL,
    investor_type       TEXT NOT NULL,          -- vc, angel, family_office, corporate_vc
    firm_name           TEXT,
    location            TEXT,
    check_size_min      INTEGER DEFAULT 0,      -- in thousands ($K)
    check_size_max      INTEGER DEFAULT 0,
    stage_focus         TEXT[],                 -- ['seed', 'series-a']
    sector_focus        TEXT[],                 -- ['saas', 'fintech', 'climate']
    investment_thesis   TEXT,
    linkedin            TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PITCH DECKS
-- ============================================
CREATE TABLE decks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id  UUID REFERENCES startups(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    slides      JSONB NOT NULL,                -- [{type, headline, body, bullets, metric}]
    template    TEXT DEFAULT 'minimal',
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPETITIONS
-- ============================================
CREATE TABLE competitions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    sector      TEXT,                          -- NULL = open to all
    prize       TEXT,
    deadline    TIMESTAMPTZ NOT NULL,
    status      TEXT DEFAULT 'active',         -- active, completed
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competition_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id  UUID REFERENCES competitions(id) ON DELETE CASCADE,
    startup_id      UUID REFERENCES startups(id) ON DELETE CASCADE,
    deck_id         UUID REFERENCES decks(id),
    entered_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, startup_id)
);

-- ============================================
-- INTERACTIONS
-- ============================================
CREATE TABLE interests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
    startup_id  UUID REFERENCES startups(id) ON DELETE CASCADE,
    message     TEXT,                          -- optional intro note
    status      TEXT DEFAULT 'pending',        -- pending, accepted, declined
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(investor_id, startup_id)
);

CREATE TABLE profile_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id  UUID REFERENCES startups(id) ON DELETE CASCADE,
    viewer_id   UUID REFERENCES users(id),
    viewed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deck_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE,
    viewer_email TEXT,
    viewed_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---


## File Tree

```
vulturex/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                      # Landing page
│   │   └── layout.tsx                    # Navbar + footer (public)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx                    # Centered card layout
│   ├── (platform)/
│   │   ├── layout.tsx                    # App shell: sidebar + topbar
│   │   ├── dashboard/page.tsx            # Role-based home (startup vs investor)
│   │   ├── onboarding/
│   │   │   ├── startup/page.tsx          # Multi-step startup form
│   │   │   └── investor/page.tsx         # Investor preferences form
│   │   ├── explore/
│   │   │   ├── page.tsx                  # Browse + filter + sort startups
│   │   │   └── [slug]/page.tsx           # Startup public profile
│   │   ├── rankings/page.tsx             # Sector leaderboards
│   │   ├── competitions/
│   │   │   ├── page.tsx                  # List active competitions
│   │   │   └── [id]/page.tsx             # Competition leaderboard + enter
│   │   ├── deck/
│   │   │   ├── page.tsx                  # My decks list
│   │   │   ├── new/page.tsx              # Generate deck (loading -> redirect)
│   │   │   └── [id]/page.tsx             # View + edit deck
│   │   ├── settings/page.tsx             # Profile, integrations, account
│   │   └── saved/page.tsx                # Investor's saved startups
│   ├── deck/
│   │   └── view/[token]/page.tsx         # Public deck viewer (no auth)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth endpoints
│   │   ├── startups/
│   │   │   ├── route.ts                  # GET list, POST create
│   │   │   └── [id]/route.ts             # GET, PUT single startup
│   │   ├── investors/
│   │   │   └── route.ts                  # GET, POST
│   │   ├── deck/
│   │   │   ├── generate/route.ts         # POST -> call LLM -> return slides
│   │   │   └── [id]/route.ts             # GET, PUT (edit slides)
│   │   ├── competitions/
│   │   │   ├── route.ts                  # GET list
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET competition + leaderboard
│   │   │       └── enter/route.ts        # POST enter competition
│   │   ├── interest/route.ts             # POST express interest
│   │   ├── score/route.ts                # POST recompute score
│   │   ├── views/route.ts                # POST track profile/deck view
│   │   └── webhooks/
│   │       └── stripe/route.ts           # Stripe OAuth callback
│   ├── layout.tsx                        # Root layout (fonts, providers)
│   └── globals.css                       # Tailwind base
├── components/
│   ├── ui/                               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── deck/
│   │   ├── SlideViewer.tsx               # Renders slide array as carousel
│   │   ├── SlideEditor.tsx               # Inline editing per slide
│   │   ├── SlideCard.tsx                 # Single slide render
│   │   └── GenerateButton.tsx            # "Generate Deck" with loading
│   ├── startup/
│   │   ├── ProfileCard.tsx               # Startup card for explore grid
│   │   ├── ScoreBadge.tsx                # Score circle with color
│   │   ├── ScoreBreakdown.tsx            # Bar chart of score categories
│   │   ├── MetricsGrid.tsx              # MRR, growth, customers display
│   │   └── OnboardingForm.tsx            # Multi-step form component
│   ├── investor/
│   │   ├── InterestButton.tsx            # "I'm Interested" action
│   │   ├── FilterBar.tsx                 # Sector, stage, score filters
│   │   └── SaveButton.tsx                # Bookmark a startup
│   ├── competition/
│   │   ├── CompetitionCard.tsx           # Competition list item
│   │   ├── Leaderboard.tsx              # Ranked entries table
│   │   └── EnterButton.tsx               # Join competition action
│   └── shared/
│       ├── Navbar.tsx                    # Public navbar
│       ├── Sidebar.tsx                   # Platform sidebar nav
│       ├── Footer.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                    # Drizzle table definitions
│   │   ├── index.ts                     # DB connection
│   │   └── migrations/                  # SQL migration files
│   ├── auth.ts                          # NextAuth config
│   ├── score.ts                         # VultureScore computation
│   ├── deck-generator.ts               # LLM prompt + JSON parsing
│   ├── stripe.ts                        # Stripe OAuth + data fetching
│   ├── email.ts                         # Resend helpers
│   └── utils.ts                         # Shared utilities
├── public/
│   ├── favicon.png
│   └── og-image.png                     # Default social share image
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── components.json                      # shadcn/ui config
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── VISION.md                            # This document
└── README.md
```

**~40 files to build the whole thing.** That's it.

---


## Pages & Routes

### Public (No Auth)

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Sign up (choose role) |
| `/deck/view/[token]` | Public deck viewer |

### Platform (Auth Required)

| Route | Page | Role |
|-------|------|------|
| `/dashboard` | Home dashboard | Both |
| `/onboarding/startup` | Startup multi-step form | Startup |
| `/onboarding/investor` | Investor preferences | Investor |
| `/explore` | Browse startups (filterable grid) | Both |
| `/explore/[slug]` | Startup profile page | Both |
| `/rankings` | Sector leaderboards | Both |
| `/competitions` | Active competitions list | Both |
| `/competitions/[id]` | Competition leaderboard + entry | Both |
| `/deck` | My decks list | Startup |
| `/deck/new` | Generate new deck | Startup |
| `/deck/[id]` | View/edit deck | Startup |
| `/saved` | Saved/bookmarked startups | Investor |
| `/settings` | Profile, integrations, account | Both |

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/auth/[...nextauth]` | Auth (NextAuth) |
| `GET` | `/api/startups` | List startups (with filters) |
| `POST` | `/api/startups` | Create/update startup profile |
| `GET` | `/api/startups/[id]` | Get single startup |
| `POST` | `/api/deck/generate` | Generate deck via LLM |
| `GET` | `/api/deck/[id]` | Get deck |
| `PUT` | `/api/deck/[id]` | Update deck slides |
| `GET` | `/api/competitions` | List competitions |
| `GET` | `/api/competitions/[id]` | Get competition + entries |
| `POST` | `/api/competitions/[id]/enter` | Enter competition |
| `POST` | `/api/interest` | Express interest |
| `POST` | `/api/score` | Recompute VultureScore |
| `POST` | `/api/views` | Track profile/deck view |
| `POST` | `/api/webhooks/stripe` | Stripe OAuth callback |

---


## Revenue Model

### At Launch (Simple)

| Stream | How | When |
|--------|-----|------|
| **Success Fee** | 3% of any deal that closes through VultureX | When deals start closing (Month 2-3+) |
| **Impact Exception** | 0% for verified SDG-aligned startups | Attracts impact ecosystem |

### After Traction (Month 3+)

| Stream | Price | What You Get |
|--------|-------|-------------|
| **Startup Pro** | $49/month | Unlimited deck regeneration, priority in search, advanced analytics |
| **Investor Seat** | $199/month | Unlimited interest expressions, advanced filters, export data |
| **Competition Sponsorship** | $5K-25K | Brand a competition, set the prize, access to entrants |

### Break-Even Math

- 200 Pro startups × $49 = $9,800/mo
- 30 Investor seats × $199 = $5,970/mo
- 1 success fee/month on $500K round = $15,000
- **Total**: ~$30K/month covers a small team + infrastructure

---

## Build Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| **1** | Foundation | Next.js setup, auth (NextAuth), DB schema (Drizzle), basic UI shell, landing page |
| **2** | Onboarding | Startup multi-step form, investor preferences form, profile pages |
| **3** | VultureScore + Explore | Score formula, explore page (filter/sort), sector leaderboards, startup profiles |
| **4** | PitchForge | Deck generation (LLM call), slide viewer, slide editor, share links |
| **5** | Competitions + Interactions | Competition pages, entry flow, leaderboard, express interest, email notifications |
| **6** | Stripe + Polish | Stripe OAuth for verified metrics, view tracking, settings page, bug fixes, deploy |

**6 weeks to a working product.** Then iterate based on user feedback.

---

## Post-Launch Additions

Add these ONLY when users ask for them or data shows they're needed:

| Signal | Add |
|--------|-----|
| "I need a PDF of my deck" | PDF export (react-pdf) |
| "Can I target this deck to a specific investor?" | Investor-adaptive deck generation |
| Investors want better matching | Basic matching (filter by thesis overlap + score) |
| Startups want to see who viewed slides | Per-slide analytics |
| 200+ startups with known outcomes | Replace formula with trained ML model |
| Users want to chat on-platform | Simple messaging |
| Revenue data needs more sources | Plaid, GA4 integrations |
| Investors want deal tracking | Deal rooms (lightweight) |
| Users want mobile access | PWA first, native app later |
| Need real-time updates | WebSocket for live score changes |

### The Graduation Path

```
LAUNCH (Formula + LLM)
    │
    │  Collect data for 6 months
    ▼
V2 (ML Scoring + Better Matching)
    │
    │  Network effects kick in
    ▼
V3 (Full Platform - deal rooms, syndication, portfolio tools)
```

Each version earns the right to exist based on the previous version's traction. Don't build V3 architecture for V1 users.

---

## Design Principles

1. **Ship beats perfect**. A working product with 60% of features beats a perfect product that doesn't exist.
2. **One codebase, one deploy**. No microservices until you actually need them (you won't for a long time).
3. **Postgres does everything**. Search, storage, analytics, sessions. One database.
4. **LLM calls are just HTTP requests**. No frameworks, no chains, no agents. A prompt in, JSON out.
5. **The score is the product**. Everything else (decks, competitions, explore) exists to make the score useful.
6. **Let users tell you what's missing**. Don't guess. Build the minimum, watch what they struggle with, add that.

---

*Last updated: July 2026*
*Version: 2.0 (Simplified MVP)*
