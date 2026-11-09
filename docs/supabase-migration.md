# Supabase project migration — Phase Zero audit

Status: **PHASE 1 COMPLETE — three-way comparison done. No backup, schema change,
data copy or configuration switch has been performed.** Both projects are now
readable; see §10 for the findings and the revised source-of-truth decision.

Source project: `dvgtgrpmwkvdinlecmrj.supabase.co`
Destination project: `beawfhpyatxhaoghbnhj.supabase.co`

## 1. Corrected architecture finding (read this first)

VultureX does **not** use the Supabase SDK, Supabase Auth, Supabase Storage,
Realtime or Edge Functions. `package.json` has no `@supabase/*` dependency, and
no source file imports one.

The only data path is:

```
Next.js route handler / server component
  -> drizzle-orm/postgres-js            (db/index.ts)
  -> postgres-js                        (max: 1, prepare: false)
  -> process.env.DATABASE_URL           (direct Postgres, owner role)
```

Evidence:

- `db/index.ts` — the single connection, created from `DATABASE_URL` only.
- `drizzle.config.ts` — the CLI migrator uses the same variable.
- `src` grep for `@supabase`, `createClient`, `storage.from`, `.channel(`,
  `.rpc(`, `supabase.co` returns **only documentation files**.
- `.env` holds `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  but **nothing reads either variable**. `docs/pitch-deck-workflow.md` already
  states this explicitly.

Consequences for this migration:

| Phase in the brief | Applies? | Reality |
|---|---|---|
| Auth migration (Supabase Auth accounts) | **No** | Credentials live in `public.users.password_hash` (bcrypt) and sessions are NextAuth JWT. Copying `users` rows *is* the account migration. |
| Storage buckets/objects | **No** | Attachments are `bytea` in `pitch_deck_files.content`, streamed by `/api/files/[id]`. No buckets exist. |
| Edge Functions | **No** | None deployed. |
| Realtime / publications | **No** | No subscriptions; messaging polls via REST. |
| Scheduled jobs (pg_cron) | **No** | Vercel Cron hits `GET /api/score/refresh` with `CRON_SECRET`. |
| Schema + data + RLS + env config | **Yes** | This is the whole migration. |

External integrations that must keep working: OpenAI (deck generation),
Resend (email, optional), Google OAuth (provider configured, no credentials
present in `.env`), Vercel Cron.

## 2. Configuration inventory

`VultureX-v2-main/.env` (tracked? no — gitignored):

| Variable | Present | Used by app |
|---|---|---|
| `AUTH_SECRET` | yes | NextAuth JWT signing — **must stay identical** or every session is invalidated |
| `AUTH_URL` | yes (`http://localhost:3000`) | NextAuth |
| `NEXT_PUBLIC_SUPABASE_URL` | yes (points at the personal project) | **nothing** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | **nothing** |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | empty | Google provider (inactive) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes | `db/seed-admin.ts` only |

`VultureX-v2-main/.env.local` (gitignored, wins over `.env`):

| Variable | Value (host-level only) |
|---|---|
| `DATABASE_URL` | `postgresql://postgres@127.0.0.1:55432/vulturex` — **a local Postgres server, not Supabase** |

`OPENAI_API_KEY`, `RESEND_API_KEY` and `CRON_SECRET` are read in code
(`features/deck/deck.generator.ts`, `features/notifications/email.service.ts`,
`app/api/score/refresh/route.ts`) but are not set in either file here.

## 3. Schema inventory (from `db/schema.ts` + `db/migrations`)

- **32 tables declared**; **31 created by the 9 migrations** (journal
  `0000`…`0008`).
- **`bookmarks` is declared in `schema.ts` but no migration creates it.** The
  original baseline was deliberately excluded (see the note in
  `docs/pitch-deck-workflow.md`). `/api/bookmarks` and `/saved` depend on it, so
  a destination built only from these migrations would have a broken feature.
  It must be created explicitly during schema migration.
- **71 foreign keys**, all UUID-based, all `public.*`.
- **57 indexes**, including 15 unique indexes (`unique_saved_resource`,
  `unique_roadmap_task`, `unique_connection_pair`,
  `unique_notification_dedupe_key`, partial uniques on `notifications`, …).
- **19 CHECK constraints** (length bounds, score ranges, no-self-connection,
  ordered recommendation pairs, non-negative prize).
- **No enums, no views, no materialized views, no sequences, no custom types** —
  every "enum" is `text` validated by Drizzle + CHECKs.
- **One function**: `public.vx_current_user_id()` (migration `0007`), used by the
  owner RLS policies; `GRANT EXECUTE … TO PUBLIC`.
- **No triggers.**
- **RLS enabled on 7 tables**: `competitions`, `competition_applications`,
  `competition_evaluations`, `competition_winners`, `competition_events`,
  `startup_recommendations`, `recommendation_states`.
- **Policies on 4 tables only**: `roadmap_tasks_owner_all`,
  `roadmap_milestones_owner_all`, `saved_resources_owner_all`,
  `reminders_owner_all` (owner-by-`vx_current_user_id()`).
  The other RLS-enabled tables intentionally have **no** policies, so anon /
  authenticated PostgREST roles can read nothing; the app connects as owner and
  bypasses RLS.
- **Migrations are not idempotent**: zero `IF NOT EXISTS`, zero `IF EXISTS`, and
  zero destructive statements (`DROP TABLE`, `TRUNCATE`, `DELETE FROM`). Replaying
  `0000`…`0008` against a database that already has any of these tables fails on
  the first `CREATE TABLE`.

## 4. Feature → data dependency map

| Feature | Entry points | Tables / objects | Notes |
|---|---|---|---|
| Auth & accounts | `/login`, `/api/auth/*`, `features/auth` | `users` (bcrypt hash, `role`) | NextAuth JWT; Google provider wired but unconfigured |
| Onboarding | `/onboarding/startup`, `/onboarding/investor` | `startups`, `investors`, `users` | 1:1 user → profile |
| Dashboard / Explore / Rankings | `(platform)/dashboard`, `/explore`, `/rankings`, `/discover` | `startups`, `profile_views`, `interests`, `bookmarks` | owner-scoped counters |
| VultureScore | `/api/score`, `/api/score/refresh` | `startups.score*` | pure computation, cron-protected |
| Interests (legacy) | `/interests`, `/api/interest` | `interests`, `notifications`, `startups`, `investors` | email via Resend |
| Connections & messaging | `/messages`, `/api/connections/*`, `/api/messages/*` | `connection_requests`, `connections`, `conversations`, `conversation_participants`, `messages`, `notifications` | polling, no realtime |
| Pitch decks (AI) | `/deck`, `/pitch-decks`, `/api/deck/*` | `decks`, `deck_views` | OpenAI |
| Pitch deck workflow | `/pitch-decks/*`, `/admin/pitch-decks/*`, `/api/files/[id]` | `pitch_deck_requests`, `pitch_deck_files` (**bytea**), `pitch_deck_events` | private file streaming |
| Competitions | `/competitions/*`, `/admin`, `/api/competitions/*` | `competitions`, `competition_applications`, `competition_evaluations`, `competition_winners`, `competition_events`, `competition_entries`, `notifications` | RLS enabled, no policies |
| Business matchmaking | `/discover`, `/api/recommendations/*` | `startup_recommendations`, `recommendation_states`, `notifications` | deterministic engine |
| SDG / Impact Hub | `/knowledge-hub/impact`, `/api/impact/*` | `startup_impact_claims`, `impact_verification_events`, `startups.sdg_*` | admin review |
| Founder profile & personalisation | `/knowledge-hub/for-you/profile`, `/api/founder-profile` | `founder_profiles` | 1:1 user |
| Founder roadmap | `/knowledge-hub/roadmap`, `/api/roadmap/*` | `roadmap_tasks`, `roadmap_milestones` | RLS owner policy |
| Saved resources (Knowledge Hub) | `/knowledge-hub/for-you/saved`, `/api/saved-resources` | `saved_resources` | server catalogue; RLS owner policy |
| Reminders & bell | `/knowledge-hub/for-you/reminders`, `/api/reminders/*`, `/api/notifications` | `reminders`, `notifications.reminder_id` | RLS owner policy; in-app only |
| Knowledge Hub content | `/knowledge-hub/*` (start-business, industry-guides, funding, marketing-sales, tools-templates, startup-ideas, impact, scam-watch, community, collaboration, search) | **no tables** — static content in `lib/knowledge-hub.ts` + section components | nothing to migrate |
| Admin | `/admin/*`, `/api/admin/*` | `users.role='admin'`, competitions + pitch-deck tables | RBAC in code (`requireAdmin`) |

Partially implemented / absent (do not claim as migrated): peer groups &
discussions, moderation tooling, expert profiles, clinic booking requests,
collaboration listings/requests beyond the Knowledge Hub content pages,
localization (only `founder_profiles.preferred_language` enum exists),
low-bandwidth mode, Funding Fit Map, Marketing Channel Test Planner, Supplier
Scorecard, Side-Hustle Path. These appear as static Knowledge Hub copy, not as
persisted workflows.

## 5. Conflicts and risks found

1. **Source of truth is ambiguous — this blocks the merge.**
   - The app's live `DATABASE_URL` is a **local** Postgres (`127.0.0.1:55432`),
     which is **not running** now and no Postgres/Docker/`psql`/`pg_dump` is
     installed on this machine.
   - Repo docs state the personal Supabase project was only verified at
     "13 tables / 3 accounts" and that the newest work ran against local
     Postgres. The app now needs **32 tables**.
   - Therefore "personal Supabase holds everything" cannot be confirmed from
     here, and the freshest data may have existed only in the local database.
2. **`bookmarks` missing from migrations** (see §3) — must be created explicitly.
3. **Migrations cannot be replayed** onto a non-empty destination; an additive,
   reviewed diff is required (`drizzle-kit push` against the destination, or a
   generated idempotent baseline).
4. **RLS coverage differs between what migrations create (7 tables) and what the
   docs claim was applied via MCP (13 tables).** The destination's final policy
   set must be decided from the source database, not from the docs.
5. **`users.email` is unique** — source and destination accounts with the same
   email are the main identity-collision risk. `users.id` is a UUID, so ID
   collisions are unlikely but must still be checked.
6. **`AUTH_SECRET` must be carried over unchanged**, otherwise every existing
   NextAuth session cookie becomes invalid (users simply sign in again; password
   hashes are portable bcrypt, so no resets are needed).
7. **Publishable keys are not usable for this migration.** Both projects answer
   `GET /rest/v1/` with `401 {"message":"Secret API key required"}`, and the
   schema is RLS-enabled with no policies, so the Data API roles can read
   nothing. A direct Postgres connection string is required.

## 6. Blockers

Nothing can be backed up, inspected, compared or copied until database
credentials for both projects exist. Required (one of):

- **Preferred:** the two pooler connection strings
  (`postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres`),
  or
- a Supabase **secret** API key (`sb_secret_…`) / service-role key for each
  project (Data API access only — still not enough for DDL, so the connection
  string remains necessary for schema work).

Provide them **without pasting them into chat**: create
`VultureX-v2-main/.env.migration` (gitignored) containing:

```
SOURCE_DATABASE_URL=postgresql://...
DEST_DATABASE_URL=postgresql://...
```

Direct hostnames `db.<ref>.supabase.co` do not resolve from this machine
(`ENOTFOUND` for both projects); the pooler hostname is required.

Also confirm which dataset wins where they disagree: the local `127.0.0.1:55432`
database (currently offline), the personal Supabase project, or both merged.

## 7. What has been verified so far

- `package.json` contains no Supabase dependency; no source import exists.
- `.env` / `.env.local` variable inventory (values not printed).
- Effective `DATABASE_URL` host/port/database/user (password never printed);
  connection attempt fails `ECONNREFUSED 127.0.0.1:55432`.
- Both Supabase projects reachable over HTTPS (`auth/v1/health` → 200);
  `rest/v1` → 401 for publishable keys; `db.*` → `ENOTFOUND`.
- Migration set parsed: 31 tables, 71 FKs, 57 indexes, 19 checks, 7 RLS tables,
  4 policies, 1 function, 0 triggers, 0 enums/views/sequences, 0 destructive
  statements, 0 idempotency guards.
- `bookmarks` recorded as the one table missing from migrations.
- Tooling present: Node 24 only. No `psql`, `pg_dump`, `supabase` CLI or Docker,
  so dump/restore must go through the `postgres` driver in Node.

## 8. Phase 1 — access verification and database comparison (2026-11-05)

Read-only only: no backups written, no DDL, no INSERT/UPDATE/DELETE, no config switch.

### 8.1 Connection verification

| Project | Region | Working endpoint | Result |
|---|---|---|---|
| Source `dvgtgrpmwkvdinlecmrj` (personal) | `ap-northeast-1` (derived from AWS IPv6 prefix of `db.<ref>`) | `aws-0-ap-northeast-1.pooler.supabase.com:6543` | **FAILED** — `password authentication failed for user "postgres"` |
| Destination `beawfhpyatxhaoghbnhj` (company) | `ap-southeast-2` | `aws-0-ap-southeast-2.pooler.supabase.com:6543` | **OK** — PostgreSQL 17.11, role `postgres` |

Why the direct hostnames in the supplied file fail: `db.<ref>.supabase.co` resolves
to **IPv6 only** (`2406:da14:…` and `2406:da1c:…`), and this workstation has no
IPv6 egress (`ENETUNREACH`, `ipv6.google.com` unresolved). The IPv4 Supavisor
pooler is the only route. `aws-1-<region>` poolers do not host these projects;
`aws-0-<region>` does.

Other access routes attempted, both failed:

- The other database passwords present in the supplied config directory (1
  candidate) are also rejected by the source.
- The `SUPABASE_ACCESS_TOKEN` in `D:/Horizon-2.0-main/.env` is valid but returns
  `403 Missing required permission(s): database_read`, and neither VultureX
  project appears in that account's project list.

**Source remains unreadable.** Its schema, row counts, users, RLS and migration
history could not be verified.

### 8.2 Destination inventory

- PostgreSQL 17.11, database `postgres`, role `postgres`, ~11.9 MB.
- **15 public tables, 5 rows total.**
- Supabase Auth: `auth.users` = 0, `auth.identities` = 0 (no Supabase Auth accounts).
- Storage: 0 buckets, 0 objects.
- RLS enabled on **15/15** tables, **0 policies** (PostgREST roles can read nothing;
  the app connects as owner and bypasses RLS).
- 21 foreign keys, 31 indexes, 15 primary keys, 5 unique constraints.
- **0 enums, 0 triggers, 0 views, 0 functions in `public`** (the 12 enums/12
  triggers/3 views reported by the raw scan live in `auth`/`storage`).
- Migration history: `supabase_migrations.schema_migrations` has 2 rows
  (`20261010212310 vulturex_baseline`, `20261010212323 pitch_deck_workflow`);
  there is **no** `drizzle.__drizzle_migrations` table.

### 8.3 Row counts (destination, every public table)

| Table | Rows |
|---|---|
| users | 3 |
| startups | 1 |
| investors | 1 |
| bookmarks, competition_entries, competitions, deck_views, decks, interests, pitch_deck_events, pitch_deck_files, pitch_deck_requests, pitch_decks, profile_views, profiles | 0 |

### 8.4 Schema differences vs the repository (32 tables, 9 migrations)

Only **13 of 32** repository tables exist in the destination.

**Present and structurally compatible:** `users` (8 cols), `bookmarks` (4),
`pitch_deck_files` (12, includes `bytea content`), `decks`, `deck_views`,
`interests`, `profile_views`, `pitch_deck_requests`, `pitch_deck_events`,
`competition_entries`.

**Present but older shape:**

- `competitions` — **8 columns** vs 35 in the repo: `id, title, description, sector,
  prize, deadline, status, created_at`. Missing `full_description, prize_amount,
  prize_currency, benefits, banner_url, open_at, evaluation_ends_at,
  winner_announcement_at, completion_at, host_investor_id, host_organization,
  eligibility, criteria, sdg_goals, rules, submitted_at, reviewed_at,
  reviewed_by_user_id, admin_feedback, rejection_reason, published_at,
  winner_announcement_status, winner_announcement_approved_at,
  winner_announcement_approved_by_user_id, updated_at, sdg_primary`. `prize` is
  `text` where the repo expects integer `prize_amount` + `prize_currency`.
- `startups` — 31 columns, missing `offerings, needs, target_customers, sdg_goals,
  sdg_primary, impact_description`.
- `investors` — 13 columns, missing `sdg_preferences`.

**Missing entirely (19):** `competition_applications`, `competition_evaluations`,
`competition_winners`, `competition_events`, `connection_requests`, `connections`,
`conversations`, `conversation_participants`, `messages`, `notifications`,
`startup_recommendations`, `recommendation_states`, `startup_impact_claims`,
`impact_verification_events`, `founder_profiles`, `roadmap_tasks`,
`roadmap_milestones`, `saved_resources`, `reminders`.

**Destination-only tables (preserve untouched):** `pitch_decks`
(`id, created_at, company_name, company_pitchdeck`) and `profiles`
(`id, created_at, "company name"`) — legacy, 0 rows, not in the current schema.

**Repository gap confirmed:** `bookmarks` exists in the destination but no
migration creates it; a database built from `0000–0008` alone would lack it.

### 8.5 Users and identity collisions

Destination accounts (masked): `a***@gmail.com` (admin),
`f***@vulturex.test` (startup), `i***@vulturex.test` (investor) — all three have
password hashes. One startup: **Testing Labs**, created 2026-10-10.

**Email collision analysis is impossible without the source.** Destination-only
emails: 3. Source-only: unknown. No source user rows could be read.

### 8.6 Local database investigation

- `.env.local` → `127.0.0.1:55432/vulturex`; connection refused.
- No `PG_VERSION` data directory anywhere in the workspace; PostgreSQL, Docker,
  `psql` and `pg_dump` are not installed, so the instance cannot be restarted.
- No `.dump`, `.backup`, `.sql.gz` or `.tar` artifacts exist in the working tree.
- Git history contains **only** the nine `db/migrations/*.sql` files — no data dump
  was ever committed.
- `.cloud-attachments/` holds two unrelated files (59 KB `.bin`, 2.6 MB imported
  conversation JSON); neither is a database dump.

**The local database is unrecoverable from this machine with the evidence
available.** Any data it held cannot be counted as migrated.

### 8.7 Migration-history differences

| | Destination | Repository | Source |
|---|---|---|---|
| Drizzle journal | absent | 9 entries, `0000`–`0008` | unknown |
| Supabase migrations | 2 (`vulturex_baseline`, `pitch_deck_workflow`) | — | unknown |
| `bookmarks` DDL | present (from baseline) | missing | unknown |

### 8.8 Provisional source-of-truth decision per table

> **Superseded by §10.7.** This section was written before the source was readable;
> the source turned out to hold the same baseline as the destination.

Pending source access; "source" below means the personal project once it can be
read. No table has been changed.

| Table | Dest rows | Provisional truth |
|---|---|---|
| users | 3 | Merge; source wins on email overlap, keep destination-only admin |
| startups | 1 | Merge; source wins for overlapping rows, keep `Testing Labs` if absent there |
| investors | 1 | Merge; source wins |
| competitions | 0 | Source rows; destination schema must be upgraded first |
| competition_entries | 0 | Source rows |
| interests | 0 | Source rows |
| decks | 0 | Source rows |
| deck_views | 0 | Source rows |
| bookmarks | 0 | Source rows; destination DDL is authoritative (no repo migration) |
| profile_views | 0 | Source rows |
| pitch_deck_requests | 0 | Source rows |
| pitch_deck_files | 0 | Source rows (bytea content already supported) |
| pitch_deck_events | 0 | Source rows |
| competition_applications, competition_evaluations, competition_winners, competition_events | absent | Source (schema + rows) |
| connection_requests, connections, conversations, conversation_participants, messages, notifications | absent | Source (schema + rows) |
| startup_recommendations, recommendation_states | absent | Source (schema + rows) |
| startup_impact_claims, impact_verification_events | absent | Source (schema + rows) |
| founder_profiles | absent | Source (schema + rows) |
| roadmap_tasks, roadmap_milestones | absent | Source (schema + rows) |
| saved_resources, reminders | absent | Source (schema + rows) |
| pitch_decks, profiles (legacy) | 0 | Destination-only; preserve untouched |

### 8.9 Blocker and next action

The source password supplied in `.env.migration.txt` is rejected. Replace only the
password in that file (or in the gitignored `.env.migration`) with the current
**personal project database password**, then rerun:

```
node scripts/migration/inspect.cjs
```

The script is read-only, re-derives the pooler endpoint and writes
`.migration/source.json`; no other step will run until the comparison is complete
and approved.

## 9. Phase 1 retry — source credentials still rejected (2026-11-05)

### 9.1 Credential sources found

| File | Modified | Content |
|---|---|---|
| `D:/Horizon-2.0-main/Horizon-2.0-main/.env.migration.txt` | 18:42 | `SOURCE_DATABASE_URL`, `DEST_DATABASE_URL`, direct `db.<ref>` hosts |
| `D:/Horizon-2.0-main/Horizon-2.0-main/.env.migration.docx` | 19:04 | same two URLs (only 2 text lines in the document), destination password contains a literal `@` |
| `VultureX-v2-main/.env.migration` | generated | gitignored working copy with pooler hosts |

### 9.2 What was tested

- The source password in the `.txt`, in the `.docx` and in the working copy has the
  same SHA-256 prefix (`ba69dc0b…`, 13 alphanumeric characters). **The rotation did
  not reach any of these files.**
- Session pooler `aws-0-ap-northeast-1.pooler.supabase.com:5432` →
  `password authentication failed for user "postgres"`.
- Transaction pooler `…:6543` → same error.
- Every password-like value in the supplied directory (2 distinct candidates) was
  tried → both rejected.

### 9.3 The project is not paused

With the project's publishable key: `auth/v1/health` → **200** (GoTrue v2.197.0),
`auth/v1/settings` → **200**, `rest/v1/` → 401 (`Secret API key required`, as
before). The database is running; the password is simply not the current one.

### 9.4 Management API still unavailable

`GET /v1/projects/<ref>` → **403** `project_admin_read`; `database/query` → **403**
`database_read`. Neither VultureX project is listed for that account.

### 9.5 Result

`.migration/source.json` was **not** produced. The three-way comparison remains
2-of-3 (destination + repository); the source schema, row counts, users and
migration history are still unverified. The destination was re-inspected and is
unchanged: 15 public tables, 5 rows, 3 users, RLS on 15/0 policies, 2 Supabase
migrations, no Drizzle journal.

### 9.6 Exact unblock

Write the **current personal-project database password** into
`VultureX-v2-main/.env.migration` (replace the password inside
`SOURCE_DATABASE_URL`; host stays `aws-0-ap-northeast-1.pooler.supabase.com`, port
`5432`). If the password contains `@`, `#`, `/` or `:`, percent-encode it. Then run:

```
node scripts/migration/inspect.cjs
node scripts/migration/compare.cjs
```

No other step will run until the comparison is complete and approved.

## 10. Phase 1 complete — three-way comparison (2026-11-05)

### 10.1 Access resolved

| | Source (personal) | Destination (company) |
|---|---|---|
| Endpoint | `aws-0-ap-northeast-1.pooler.supabase.com:5432` | `aws-0-ap-southeast-2.pooler.supabase.com:6543` |
| Server | PostgreSQL 17.11 | PostgreSQL 17.11 |
| Size | 11,720,371 bytes | 11,884,211 bytes |

The `SOURCE_DATABASE_URL` line in `.env.migration.txt` drops the `@` that belongs
inside the password; the `DEST_DATABASE_URL` line contains it. Both projects accept
the same password. The corrected value is used only in the gitignored
`.env.migration`; the external file was left untouched. A sweep of every
`aws-0`/`aws-1` pooler region returned "tenant not found" outside
`ap-northeast-1`, confirming the home region.

### 10.2 Inventories side by side

| Metric | Source | Destination | Repository |
|---|---|---|---|
| Public tables | 13 | 15 (13 + 2 legacy) | 32 |
| Rows | 5 | 5 | — |
| Users | 3 | 3 | — |
| RLS tables | 13 | 15 | 7 (per migrations) |
| Policies | 0 | 0 | 4 |
| Foreign keys | 21 | 21 | 71 |
| Supabase migrations | 2 | 2 | — |
| Drizzle journal | absent | absent | 9 |
| Enums / triggers / views | 12 / 12 / 3 (auth + storage only) | 12 / 12 / 3 (auth + storage only) | 0 / 0 / 1 function |

### 10.3 Shared tables

All 13 shared tables have identical column counts in both projects. Both are
missing the same 19 repository tables. Both have the older shape:
`competitions` 8 vs 34 repository columns, `startups` 31 vs 37, `investors` 13 vs
14. `users`, `bookmarks`, `decks`, `deck_views`, `interests`, `profile_views`,
`pitch_deck_requests`, `pitch_deck_files`, `pitch_deck_events` and
`competition_entries` match the repository exactly.

### 10.4 Row-level comparison

| Table | Source | Destination | Comparison |
|---|---|---|---|
| users | 3 | 3 | same emails, names, roles and password hashes; different UUIDs and `created_at` |
| startups | 1 | 1 | `testing-labs` / "Testing Labs"; same fields except timestamps; different UUIDs and owner |
| investors | 1 | 1 | "Test Investor"; same fields except `created_at`; different UUIDs and owner |
| other 10 shared tables | 0 | 0 | — |

There is **no source-only row**. The five source rows and the five destination rows
are two independent seeds of the same data, not two divergent histories.

### 10.5 Migration history

- Source: `20261010213616 vulturex_baseline`, `20261010213628 pitch_deck_workflow`.
- Destination: `20261010212310 vulturex_baseline`, `20261010212323 pitch_deck_workflow`
  — 13 minutes earlier.
- Neither has a Drizzle journal; `bookmarks` still has no DDL in the repository.

### 10.6 Conflicts identified

1. **UUID divergence** — importing source rows verbatim would violate
   `users_email_unique` (3 collisions), `startups_slug_unique` (1) and
   `unique_investor_startup` (1), creating duplicate accounts.
2. **No unique source content** — the source adds no row the destination does not
   already have in equivalent form.
3. **19 tables absent from both projects** — there is no Supabase source for them.
4. **Column drift** in `competitions`, `startups`, `investors` against the repository.
5. **Destination-only legacy tables** `pitch_decks` and `profiles` (0 rows).
6. **Repository gaps** — `bookmarks` has no migration and the migrations are not
   idempotent.

### 10.7 Revised source-of-truth decision (supersedes §8.8)

The personal project is **not** ahead of the company project. Both hold the same
13-table baseline and the same five seed rows; the source baseline was applied 13
minutes later. "Company identical to personal" is already true at the data level.

- **Shared tables:** keep the destination rows; do not import the source duplicates.
  If a value ever differs, match by email/slug and update in place — no divergence
  is visible today.
- **Nineteen newer tables:** neither Supabase project has them. Only the repository
  schema describes them; any data they once held lived in the local
  `127.0.0.1:55432` database, which is unrecoverable.
- **Legacy `pitch_decks` / `profiles`:** preserve untouched.

The remaining work is a **schema upgrade of the company project to the repository's
32-table shape**, not a data copy from the personal project.

### 10.8 Not performed

No backup, DDL, INSERT/UPDATE/DELETE, `DATABASE_URL` change or application config
change. `.migration/source.json`, `.migration/dest.json` and
`.migration/comparison.json` hold the inventories; all are gitignored.

## 11. Phase 2 — executed migration and verification (2026-11-05)

Authorized execution order: **backup → forward DDL → schema/data verification →
application tests**. No `DATABASE_URL`, `.env.local`, deployment config,
application code, route or UI was changed.

### 11.1 Backups (verified before any DDL)

| Backup | Tables | Rows | Location |
|---|---|---|---|
| Source (personal) | 13 | 5 | `.migration/backups/source` |
| Destination (company, rollback point) | 15 | 5 | `.migration/backups/dest` |

Each backup contains `schema.json` (columns, constraints, indexes, RLS, policies,
functions, triggers, views, enums), one JSON file per table (bytea base64), and a
`manifest.json` with per-table SHA-256 and counts. Both backups were re-read and
verified (`files verified: YES`). `.migration/` is gitignored and outside Git.

### 11.2 Forward migration

`.migration/forward.sql` was generated from migrations `0002`–`0008` by
`scripts/migration/build-forward.cjs` and executed by
`scripts/migration/apply-forward.cjs` in one transaction with `lock_timeout`,
`statement_timeout` and an advisory transaction lock. A full dry-run ran all 181
statements and rolled back; the committed run then applied all 181 in 95 s.

- 19 missing tables created, 37 columns added, 53 constraints added, 47 indexes
  created, 4 RLS policies created; no `DROP TABLE`, `TRUNCATE`, `DELETE` or
  destructive column change.
- Existing tables (`competitions`, `startups`, `investors`, `notifications`) were
  altered additively. `competitions.prize` and every other legacy column were kept.
- The only data statement is `UPDATE competitions SET status='completed' WHERE
  status IS NULL` (0 rows; required before `SET NOT NULL`).
- The `0002` backfill `INSERT ... SELECT` from `interests` was skipped because the
  destination has 0 interests; it would have inserted 0 rows.
- `bookmarks` was not recreated: it already exists with the repository shape
  (4 columns, both FKs, `unique_user_startup_bookmark`). The repository gap is
  fixed by new migration `db/migrations/0009_bookmarks.sql` plus its journal entry.
- No migration-ledger table was added (it would be an extra schema object).
  `.migration/forward.applied.json` records the applied-at timestamp, statement
  count and SQL SHA-256; the SQL itself is idempotent.

### 11.3 Source-of-truth conflict report (§6A Rule 6)

| Table | Source rows | Destination rows | Decision |
|---|---|---|---|
| `users` | 3 | 3 | Same emails/names/roles/password hashes. Keep destination UUIDs; no import. |
| `startups` | 1 | 1 | `testing-labs` equivalent. Keep destination UUID/owner; no import. |
| `investors` | 1 | 1 | "Test Investor" equivalent. Keep destination UUID/owner; no import. |
| other 10 shared tables | 0 | 0 | Nothing to replace. |

No source-only row exists and no destination value is stale, so **no row was
replaced and no ID mapping was needed**. The five source rows are independent
seeds of the same data; importing them by UUID would have violated
`users_email_unique`, `startups_slug_unique` and `unique_investor_startup`.
Destination-only `pitch_decks` and `profiles` were left untouched (0 rows).

### 11.4 Schema and data verification

`scripts/migration/verify-dest.cjs` passed every check:

- 34 public tables = 32 repository tables + legacy `pitch_decks` + `profiles`.
- 351 repository columns checked for existence and type; nullability checked
  against the current migrations (including `ALTER COLUMN` changes).
- 135 constraints, 73 foreign keys (21 pre-existing + 52 added, no duplicate
  column sets), 101 indexes, 4 owner policies, RLS enabled on 25 tables.
- `bookmarks` still has its unique index and both FKs.
- Every pre-existing row was compared per-column against the backup; all 15
  backed-up tables are identical, including UUIDs and password hashes. Rows only
  gained the new columns and their defaults (`sdg_goals`, `sdg_preferences`, etc.).
- `pitch_decks` / `profiles` still have their original columns and 0 rows.

### 11.5 Application verification

- `npm run test:matchmaking|test:sdg|test:roadmap|test:reminders|test:saved-resources`:
  29/29 tests pass.
- `npm run build` against the migrated database: TypeScript clean, 55 routes,
  production bundle created.
- `next start` + credentials login: `POST /api/auth/callback/credentials` returns
  302 to `/dashboard`, sets `authjs.session-token`; `/api/auth/session` returns the
  founder id and role.
- Authenticated APIs 200: bookmarks, messages, notifications, recommendations,
  competitions, startups, reminders, saved-resources. Unauthenticated bookmarks and
  messages return 401; recommendations returns 403 for a non-startup/anonymous
  caller. `/api/roadmap` is POST-only (GET 405, as designed).
- Bookmark create → list → delete round-trip succeeded and left 0 rows.
- Dashboard rendered for the seeded founder with "Testing Labs", score 58 and the
  new navigation (Roadmap, Saved Resources, Reminders).
- RLS behavior with the real `authenticated` role: owner sees own saved resource and
  reminder, a different JWT `sub` sees 0, and a cross-user insert is denied with
  `42501`. Test rows were rolled back.

### 11.6 Remaining caveat (pre-existing, resolved in §12)

`startups` already had RLS enabled with **no policy** before this migration, and the
repository defines no `startups` policy. Consequently, when queried as the
`authenticated` Supabase role, the `roadmap_tasks_owner_all` policy's `EXISTS
(SELECT 1 FROM startups ...)` sees 0 startups and returns no roadmap rows. The
application is unaffected because it connects with the privileged `postgres` role
(RLS bypass), and saved-resources/reminders owner policies work. No broader policy
was invented here because it would be a security-sensitive, repository-external
change.

### 11.7 Rollback and blockers

Rollback point: `.migration/backups/dest` (outside Git). The migration is additive;
if needed, the 19 new tables and 37 added columns can be dropped without touching
legacy data, or the backup can be restored. No blocker remains. Google OAuth was
not tested because its credentials are empty in this environment (pre-existing).

## 12. Roadmap RLS ownership fix (2026-11-05)

### 12.1 Root cause

The company database's original Supabase baseline enabled RLS on `startups` and
left it with **no policies**. Both roadmap policies check ownership with:

```sql
EXISTS (
  SELECT 1 FROM public.startups s
  WHERE s.id = roadmap_tasks.startup_id
    AND s.user_id = public.vx_current_user_id()
)
```

When evaluated as `authenticated`, the subquery on `startups` is itself subject to
RLS and returns zero rows, so the `EXISTS` is always false. The roadmap tables
therefore denied even their owner. The application avoided this because it
connects through the privileged `postgres` role, but the intended owner policies
were non-functional for Supabase/PostgREST callers. The repository migrations do
not enable RLS on `startups`; the setting came from the pre-existing baseline, and
RLS must not be disabled.

### 12.2 Correction

New migration `db/migrations/0010_startups_owner_select.sql` adds one policy:

```sql
CREATE POLICY "startups_owner_select" ON public.startups
  FOR SELECT
  USING (user_id = public.vx_current_user_id());
```

The policy is deliberately minimal:

- **SELECT only** — no INSERT, UPDATE or DELETE policy is added.
- **Own row only** — no `is_public`, anonymous, or cross-user clause; a caller with
  no JWT subject resolves to NULL and sees nothing.
- No new table grants were needed (`authenticated` already had SELECT privilege;
  RLS filters the rows). Existing grants and roles are unchanged.
- No other table, application feature or record was changed.

### 12.3 Two-user verification

Inside one transaction (rolled back afterwards), a second startup owner was created
and both owners' roadmap rows were inserted as the privileged role. Tests then ran
as the real `authenticated` role with different `request.jwt.claims.sub` values:

- Owner A saw exactly startup A, task A and milestone A; 0 rows belonging to B.
- Owner B saw exactly startup B, task B and milestone B; 0 rows belonging to A.
- Owner A could insert/update their own roadmap rows.
- Owner A's attempt to update B's task affected 0 rows; the row was unchanged.
- Cross-owner INSERTs failed with `42501` (RLS `WITH CHECK` violation).
- No temporary user, startup, task or milestone survived the rollback.

### 12.4 Application verification

The application path is unchanged because it uses the `postgres` connection:
production build, 29/29 unit tests, login/session, dashboard and roadmap page were
rechecked after the policy was applied. The `startups` table still has RLS enabled
and no public read access was introduced.
