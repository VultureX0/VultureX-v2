#!/usr/bin/env node
/*
 * Post-migration verification of the company database.
 * - every repository table/column/type/constraint/index/policy exists
 * - row content is byte-for-byte identical to .migration/backups/dest
 * - legacy tables pitch_decks/profiles are untouched
 * Exits 1 on any failed check.
 */
const fs = require('fs');
const crypto = require('crypto');
const postgres = require('postgres');

const backupDir = '.migration/backups/dest';
const manifest = JSON.parse(fs.readFileSync(backupDir + '/manifest.json', 'utf8'));

const repo = {};
const repoTables = [...fs.readFileSync('db/schema.ts', 'utf8').matchAll(/pgTable\(\s*"([a-z_]+)"/g)].map((m) => m[1]);
for (const t of repoTables) repo[t] = { cols: new Map(), constraints: new Set(), indexes: new Set(), policies: new Set() };

const TYPE_MAP = {
  uuid: 'uuid', text: 'text', integer: 'int4', int: 'int4', serial: 'int4', bigint: 'int8', numeric: 'numeric',
  boolean: 'bool', bool: 'bool', jsonb: 'jsonb', json: 'json', timestamp: 'timestamptz', timestamptz: 'timestamptz',
  'timestamp with time zone': 'timestamptz', 'timestamp without time zone': 'timestamp', date: 'date', bytea: 'bytea',
  varchar: 'varchar', 'character varying': 'varchar', smallint: 'int2', real: 'float4', 'double precision': 'float8',
  'text[]': '_text', 'integer[]': '_int4', 'uuid[]': '_uuid', 'jsonb[]': '_jsonb',
};
const TYPE_RE = /^(timestamp with time zone|timestamp without time zone|time with time zone|time without time zone|double precision|character varying|(?:uuid|text|integer|int|bigint|numeric|boolean|bool|jsonb|json|timestamp|timestamptz|date|bytea|serial|smallint|real|varchar)(?:\[\])?)/i;
const typeOf = (rest) => {
  rest = rest.replace(/^"/, '');
  const m = rest.match(TYPE_RE);
  if (!m) return null;
  const key = m[1].toLowerCase().replace(/\s*\(\s*\d+\s*(,\s*\d+\s*)?\)$/, '');
  return TYPE_MAP[key] || null;
};

for (const f of fs.readdirSync('db/migrations').filter((x) => x.endsWith('.sql')).sort()) {
  const sql = fs.readFileSync('db/migrations/' + f, 'utf8');
  for (const m of sql.matchAll(/CREATE TABLE "?([a-z_]+)"? \(([\s\S]*?)\n\);/g)) {
    const t = m[1];
    if (!repo[t]) repo[t] = { cols: new Map(), constraints: new Set(), indexes: new Set(), policies: new Set() };
    for (const line of m[2].split('\n')) {
      const c = line.match(/^\s*"([a-z_][a-z0-9_]*)"\s+(.+)$/);
      if (!c) continue;
      const type = typeOf(c[2]);
      if (!type) continue;
      repo[t].cols.set(c[1], { type, notNull: /NOT NULL/i.test(c[2]) });
    }
    for (const c of m[2].matchAll(/CONSTRAINT\s+"([a-z_]+)"\s+(FOREIGN KEY|UNIQUE|CHECK|PRIMARY KEY)/gi)) {
      repo[t].constraints.add(c[1]);
    }
  }
  for (const m of sql.matchAll(/ALTER TABLE "?([a-z_]+)"? ADD COLUMN (?:IF NOT EXISTS )?"?([a-z_]+)"?\s+([^;]+);/gi)) {
    const t = m[1];
    const type = typeOf(m[3]);
    if (repo[t] && type) repo[t].cols.set(m[2], { type, notNull: /NOT NULL/i.test(m[3]) });
  }
  for (const m of sql.matchAll(/ALTER TABLE "?([a-z_]+)"? ALTER COLUMN "?([a-z_]+)"? (DROP NOT NULL|SET NOT NULL)/gi)) {
    const col = repo[m[1]] && repo[m[1]].cols.get(m[2]);
    if (col) col.notNull = /SET NOT NULL/i.test(m[3]);
  }
  for (const m of sql.matchAll(/ALTER TABLE "?([a-z_]+)"? ADD CONSTRAINT "?([a-z_]+)"? (FOREIGN KEY|UNIQUE|CHECK|PRIMARY KEY)/gi)) {
    if (repo[m[1]]) repo[m[1]].constraints.add(m[2]);
  }
  for (const m of sql.matchAll(/CREATE (?:UNIQUE )?INDEX(?: IF NOT EXISTS)? "?([a-z_]+)"? ON "?([a-z_]+)"?/gi)) {
    if (repo[m[2]]) repo[m[2]].indexes.add(m[1]);
  }
  for (const m of sql.matchAll(/CREATE POLICY "?([a-z_]+)"? ON (?:public\.)?"?([a-z_]+)"?/gi)) {
    if (repo[m[2]]) repo[m[2]].policies.add(m[1]);
  }
}

const enc = (v) => {
  if (v instanceof Date) return { __date: v.toISOString() };
  if (Buffer.isBuffer(v)) return { __bytea: v.toString('base64') };
  if (Array.isArray(v)) return v.map(enc);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)]));
  return v;
};
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const qi = (s) => '"' + String(s).replace(/"/g, '""') + '"';

const failures = [];
const warns = [];
const fail = (m) => failures.push(m);
const warn = (m) => warns.push(m);

(async () => {
  const env = fs.readFileSync('.env.migration', 'utf8');
  const url = (env.match(/^DEST_DATABASE_URL=(.*)$/m) || [])[1];
  const sql = postgres(url, { max: 1, ssl: 'require', prepare: false, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
  try {
    const tables = (await sql`select tablename from pg_tables where schemaname='public' order by 1`).map((r) => r.tablename);
    const columns = await sql`select table_name, column_name, udt_name, is_nullable, column_default
      from information_schema.columns where table_schema='public'`;
    const constraints = await sql`select c.relname table, con.conname name, con.contype type
      from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public'`;
    const indexes = await sql`select tablename, indexname from pg_indexes where schemaname='public'`;
    const policies = await sql`select tablename, policyname from pg_policies where schemaname='public'`;
    const rls = await sql`select c.relname table, c.relrowsecurity enabled from pg_class c
      join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'`;
    const functions = (await sql`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'`).map((r) => r.proname);

    const tableSet = new Set(tables);
    const colMap = new Map();
    for (const c of columns) {
      if (!colMap.has(c.table_name)) colMap.set(c.table_name, new Map());
      colMap.get(c.table_name).set(c.column_name, c);
    }
    const conSet = new Set(constraints.map((c) => c.table + '.' + c.name));
    const idxSet = new Set(indexes.map((i) => i.tablename + '.' + i.indexname));
    const polSet = new Set(policies.map((p) => p.tablename + '.' + p.policyname));

    // 1. tables
    for (const t of repoTables) if (!tableSet.has(t)) fail(`missing table ${t}`);
    for (const t of ['pitch_decks', 'profiles']) if (!tableSet.has(t)) fail(`legacy table ${t} missing`);

    // 2. columns / types / nullability
    let checkedCols = 0;
    for (const t of repoTables) {
      if (!tableSet.has(t)) continue;
      const actual = colMap.get(t) || new Map();
      const expected = repo[t].cols;
      for (const [name, e] of expected) {
        const a = actual.get(name);
        if (!a) {
          fail(`${t}.${name} missing`);
          continue;
        }
        checkedCols++;
        if (e.type && a.udt_name !== e.type) fail(`${t}.${name} type ${a.udt_name} != ${e.type}`);
        if (e.notNull && a.is_nullable === 'YES') fail(`${t}.${name} nullable but repo NOT NULL`);
        if (!e.notNull && a.is_nullable === 'NO') warn(`${t}.${name} stricter NOT NULL than repo`);
      }
      const extra = [...actual.keys()].filter((c) => !expected.has(c));
      const repoSchemaCols = t === 'competitions' ? new Set() : new Set();
      if (extra.length) warn(`${t} extra columns: ${extra.join(',')}`);
    }

    // 3. constraints / indexes
    for (const t of Object.keys(repo)) {
      for (const c of repo[t].constraints) {
        const pgName = c.length <= 63 ? c : c.slice(0, 63);
        if (!conSet.has(t + '.' + pgName)) fail(`missing constraint ${t}.${c}`);
      }
      for (const i of repo[t].indexes) if (!idxSet.has(t + '.' + i)) fail(`missing index ${t}.${i}`);
    }
    const fks = constraints.filter((c) => c.type === 'f');
    const fkCount = fks.length;
    const expectedFkCount = Number(manifest.tables.users ? 21 : 21); // baseline count recorded in the audit
    console.log('foreign keys:', fkCount, '(baseline 21 + added)');

    // duplicate FKs on the same column set
    const dup = await sql`select conrelid::regclass::text t, conkey::text cols, count(*) n
      from pg_constraint where contype='f' group by 1,2 having count(*) > 1`;
    for (const d of dup) fail(`duplicate FK on ${d.t} (${d.cols}) x${d.n}`);

    // 4. policies / RLS
    for (const t of Object.keys(repo)) for (const p of repo[t].policies) if (!polSet.has(t + '.' + p)) fail(`missing policy ${t}.${p}`);
    const rlsMap = new Map(rls.map((r) => [r.table, r.enabled]));
    const mustRls = ['competitions', 'competition_applications', 'competition_evaluations', 'competition_winners', 'competition_events',
      'startup_recommendations', 'recommendation_states', 'roadmap_tasks', 'roadmap_milestones', 'saved_resources', 'reminders',
      'startups', 'pitch_decks', 'profiles'];
    for (const t of mustRls) if (!rlsMap.get(t)) fail(`RLS not enabled on ${t}`);
    for (const [t, enabled] of rlsMap) {
      const before = (JSON.parse(fs.readFileSync(backupDir + '/schema.json', 'utf8')).rls || []).find((r) => r.table === t);
      if (before && before.rls && !enabled) fail(`RLS was disabled on ${t}`);
    }
    if (!functions.includes('vx_current_user_id')) fail('missing function vx_current_user_id');

    // 5. explicit defaults
    const expectedDefaults = {
      'competitions.status': { value: "'draft'::text", notNull: true },
      'competitions.prize_currency': { value: "'USD'::text", notNull: false },
      'competitions.winner_announcement_status': { value: "'none'::text", notNull: true },
      'startups.sdg_goals': { value: "'{}'::integer[]", notNull: true },
      'investors.sdg_preferences': { value: "'{}'::integer[]", notNull: true },
    };
    for (const [k, e] of Object.entries(expectedDefaults)) {
      const [t, c] = k.split('.');
      const a = (colMap.get(t) || new Map()).get(c);
      if (!a) fail(`missing column ${k}`);
      else {
        if (e.notNull && a.is_nullable === 'YES') fail(`${k} must be NOT NULL`);
        if (String(a.column_default) !== e.value) warn(`${k} default ${a.column_default} != ${e.value}`);
      }
    }

    // 6. data identity vs backup (per-row hashes, order-independent)
    let compared = 0;
    for (const [t, info] of Object.entries(manifest.tables)) {
      if (!tableSet.has(t)) {
        fail(`backed-up table ${t} disappeared`);
        continue;
      }
      const beforeRows = JSON.parse(fs.readFileSync(`${backupDir}/data/${t}.json`, 'utf8'));
      const afterRowsRaw = await sql.unsafe(`select * from public.${qi(t)}`);
      // Only compare columns that existed at backup time; new columns (with
      // defaults) are expected additions, not data changes.
      const beforeCols = beforeRows.length ? Object.keys(beforeRows[0]) : [];
      const afterRows = beforeCols.length
        ? afterRowsRaw.map((r) => Object.fromEntries(beforeCols.map((c) => [c, r[c]])))
        : afterRowsRaw;
      // postgres numeric comes back as string, timestamps as Date; same enc() as backup
      const mapOf = (rows) => new Map(rows.map((r) => [r.id || sha(JSON.stringify(enc(r))), sha(JSON.stringify(enc(r)))]));
      const b = mapOf(beforeRows);
      const a = mapOf(afterRows);
      if (a.size !== b.size) fail(`${t} row count ${a.size} != ${b.size}`);
      for (const [id, h] of b) {
        if (!a.has(id)) fail(`${t} row ${id} missing`);
        else if (a.get(id) !== h) fail(`${t} row ${id} changed`);
      }
      compared++;
    }

    // 7. legacy tables untouched (0 rows and original columns)
    const legacy = JSON.parse(fs.readFileSync(backupDir + '/schema.json', 'utf8'));
    for (const t of ['pitch_decks', 'profiles']) {
      const n = Number((await sql.unsafe(`select count(*)::text n from public.${qi(t)}`))[0].n);
      if (n !== 0) fail(`legacy ${t} gained ${n} rows`);
      const before = new Set(legacy.columns.filter((c) => c.table_name === t).map((c) => c.column_name));
      const now = new Set(columns.filter((c) => c.table_name === t).map((c) => c.column_name));
      for (const c of before) if (!now.has(c)) fail(`legacy ${t}.${c} removed`);
    }

    for (const [t, info] of Object.entries(manifest.tables)) {
      const n = Number((await sql.unsafe(`select count(*)::text n from public.${qi(t)}`))[0].n);
      if (n !== info.dbCount) fail(`${t} rows ${n} != backup ${info.dbCount}`);
    }

    console.log('tables:', tables.length, '| repo tables:', repoTables.length, '| columns checked:', checkedCols);
    console.log('constraints:', constraints.length, '| indexes:', indexes.length, '| policies:', policies.length, '| RLS tables:', [...rlsMap.values()].filter(Boolean).length);
    console.log('data tables compared:', compared);
    if (warns.length) {
      console.log('\nWARNINGS (' + warns.length + '):');
      for (const w of warns) console.log('  -', w);
    }
    if (failures.length) {
      console.log('\nFAILED CHECKS (' + failures.length + '):');
      for (const f of failures) console.log('  -', f);
      process.exitCode = 1;
    } else {
      console.log('\nALL CHECKS PASSED');
    }
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
})();
