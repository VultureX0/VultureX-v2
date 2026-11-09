# Schema and migration validation

`scripts/ci/validate-schema.cjs` runs in CI (`.github/workflows/schema-check.yml`)
on every pull request targeting `main` and every push to `main`. It is a
**static** check: it reads repository files only and never opens a database
connection. No `DATABASE_URL` is needed, and CI never talks to production
Supabase.

## What CI proves — and what it does not

Static checks catch history drift and accidental data loss in review:

| Check | What it catches |
| --- | --- |
| Journal coverage | A `.sql` file committed without a journal entry (Drizzle would never apply it), or a journal entry whose `.sql` file is missing. |
| Journal integrity | Duplicate tags or `idx` values, non-contiguous `idx` sequence, tags whose numeric prefix disagrees with `idx`, non-increasing or out-of-range `when` timestamps, mismatched `version`, wrong dialect. |
| SQL body | Empty migration files, unterminated string/identifier/dollar-quoted blocks or comments, unbalanced parentheses, files with only comments. |
| Schema ↔ migration parity | Tables or columns declared in `db/schema.ts` with no `CREATE TABLE` / `ADD COLUMN` in the migrations, and the reverse. |
| Required history | That `0009_bookmarks` (table, unique index) and `0010_startups_owner_select` (SELECT-only policy scoped to `public.vx_current_user_id()`) are present and intact. |
| Destructive SQL | `DROP TABLE`, `TRUNCATE`, `DROP COLUMN`, `ALTER COLUMN … TYPE`, `DROP SCHEMA/DATABASE`, `DROP INDEX`, `DROP CONSTRAINT`, `DROP VIEW/FUNCTION/TYPE/SEQUENCE`, `DELETE FROM`. |

It does **not** prove that a live database matches `db/schema.ts`. It cannot see
tables, columns, constraints, indexes, grants, row-level security policies, or
data that exist only in a database, and it cannot detect drift introduced
outside this repository. Live parity requires a real connection; see
`scripts/migration/verify-dest.cjs` and `scripts/migration/compare.cjs`, which
are run manually against a verified target and are intentionally not wired to
CI.

`pnpm exec drizzle-kit check` runs alongside the script as Drizzle's own
validation of the migration chain. It also only inspects files.

## Approving a destructive change

A destructive statement fails the job. When the change is intentional and
reviewed, add a single-line comment to the same `.sql` file:

```sql
-- destructive-change-approved: DROP legacy draft column, shipped in #412
ALTER TABLE "startups" DROP COLUMN "legacy_draft";
```

Rules:

- The marker must be an SQL line comment (`--`), not a block comment.
- The reason must be at least 8 characters. A shorter reason fails the job as an
  invalid approval, so a placeholder such as `-- destructive-change-approved:`
  cannot pass.
- The approval applies to the whole file. Keep one destructive change per
  migration file where possible.
- The reviewer must confirm the reason names the real intent. The check cannot
  judge whether dropping data is safe, only that someone wrote down why.

`DROP POLICY IF EXISTS` is not flagged: it is the reversible idiom used to make
policy migrations idempotent.

## Running locally

From `VultureX-v2-main/`:

```bash
pnpm run check:schema                 # validates this repository
pnpm exec drizzle-kit check           # Drizzle's own chain check
node scripts/ci/validate-schema.cjs --root /path/to/fixture
```

`--root` points the checker at another directory containing `db/schema.ts` and
`db/migrations/`, which is how the negative tests are exercised without touching
real migration history. The exit code is `0` on success, `1` on a validation
failure, and `2` when the migration directory is missing or arguments are
invalid.

## Adding a migration

1. `pnpm db:generate` writes the `.sql` file and the journal entry together.
2. Hand-authored migrations (like `0009` and `0010`) must be added to
   `db/migrations/meta/_journal.json` with the next contiguous `idx`, a matching
   `000N_` tag prefix, and a `when` timestamp greater than the previous entry.
3. Run `pnpm run check:schema` before committing. A failure names the file and
   the rule that broke.
