#!/usr/bin/env node
/*
 * Verified logical backup of one database.
 * Usage: node scripts/migration/backup.cjs <source|dest>
 *
 * Writes .migration/backups/<label>/ :
 *   schema.json      columns, constraints, indexes, RLS, policies, functions, triggers, views, enums
 *   data/<table>.json  every row (bytea base64-encoded)
 *   manifest.json    per-table row count + SHA-256, server info
 *
 * Verification re-reads every file, recomputes hashes and row counts.
 * Read-only against the database. Never prints credentials.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const postgres = require('postgres');

const label = process.argv[2];
if (!['source', 'dest'].includes(label)) {
  console.error('usage: node scripts/migration/backup.cjs <source|dest>');
  process.exit(2);
}

const env = fs.readFileSync('.env.migration', 'utf8');
const url = (env.match(new RegExp('^' + (label === 'source' ? 'SOURCE' : 'DEST') + '_DATABASE_URL=(.*)$', 'm')) || [])[1];
if (!url) {
  console.error('missing URL in .env.migration');
  process.exit(2);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join('.migration', 'backups', label);
const dataDir = path.join(dir, 'data');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dataDir, { recursive: true });

const enc = (v) => {
  if (v instanceof Date) return { __date: v.toISOString() };
  if (Buffer.isBuffer(v)) return { __bytea: v.toString('base64') };
  if (Array.isArray(v)) return v.map(enc);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)]));
  return v;
};
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const qi = (s) => '"' + String(s).replace(/"/g, '""') + '"';

(async () => {
  const sql = postgres(url, {
    max: 1,
    ssl: 'require',
    prepare: false,
    connect_timeout: 20,
    idle_timeout: 5,
    onnotice: () => {},
  });
  try {
    const meta = await sql`select version() v, current_database() db, current_user usr, pg_database_size(current_database())::text size`;
    const tables = await sql`
      select n.nspname schema, c.relname name
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind in ('r','p') and n.nspname = 'public'
      order by 2`;

    const schema = {
      capturedAt: new Date().toISOString(),
      server: meta[0].v,
      database: meta[0].db,
      columns: await sql`select table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
        from information_schema.columns where table_schema='public' order by 1,3`,
      constraints: await sql`
        select c.relname table, con.conname name, con.contype type, pg_get_constraintdef(con.oid) def
        from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' order by 1,2`,
      indexes: await sql`select tablename table, indexname name, indexdef def from pg_indexes where schemaname='public' order by 1,2`,
      rls: await sql`select c.relname table, c.relrowsecurity rls, c.relforcerowsecurity force
        from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by 1`,
      policies: await sql`select tablename table, policyname name, cmd, roles::text roles, qual, with_check
        from pg_policies where schemaname='public' order by 1,2`,
      functions: await sql`select p.proname name, pg_get_functiondef(p.oid) def from pg_proc p
        join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by 1`,
      triggers: await sql`select c.relname table, t.tgname name, pg_get_triggerdef(t.oid) def
        from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
        where not t.tgisinternal and n.nspname='public' order by 1,2`,
      views: await sql`select c.relname name, pg_get_viewdef(c.oid) def from pg_class c
        join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('v','m') order by 1`,
      enums: await sql`select t.typname name, array_agg(e.enumlabel order by e.enumsortorder) labels
        from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace
        where n.nspname='public' group by 1 order by 1`,
      extensions: await sql`select extname name, extversion version from pg_extension order by 1`,
    };
    fs.writeFileSync(path.join(dir, 'schema.json'), JSON.stringify(schema, null, 2));

    const manifest = {
      label,
      capturedAt: new Date().toISOString(),
      server: meta[0].v,
      database: meta[0].db,
      sizeBytes: Number(meta[0].size),
      tables: {},
    };

    for (const t of tables) {
      const rows = await sql.unsafe(`select * from ${qi(t.schema)}.${qi(t.name)}`);
      const payload = JSON.stringify(rows.map(enc));
      const file = path.join(dataDir, t.name + '.json');
      fs.writeFileSync(file, payload);
      const count = Number((await sql.unsafe(`select count(*)::text n from ${qi(t.schema)}.${qi(t.name)}`))[0].n);
      manifest.tables[t.name] = { rows: rows.length, dbCount: count, sha256: sha(payload), bytes: Buffer.byteLength(payload) };
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // verification
    let ok = true;
    const problems = [];
    for (const [name, info] of Object.entries(manifest.tables)) {
      const file = path.join(dataDir, name + '.json');
      const payload = fs.readFileSync(file, 'utf8');
      if (sha(payload) !== info.sha256) problems.push(name + ': hash mismatch');
      const parsed = JSON.parse(payload);
      if (parsed.length !== info.rows || parsed.length !== info.dbCount) problems.push(name + ': count mismatch');
    }
    if (problems.length) ok = false;
    console.log('backup dir:', dir);
    console.log('server:', String(meta[0].v).slice(0, 60), '| db:', meta[0].db);
    console.log('tables:', tables.length, '| rows:', Object.values(manifest.tables).reduce((a, x) => a + x.rows, 0));
    console.log('files verified:', ok ? 'YES' : 'NO');
    for (const p of problems) console.log('  PROBLEM:', p);
    if (!ok) process.exit(1);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
})();
