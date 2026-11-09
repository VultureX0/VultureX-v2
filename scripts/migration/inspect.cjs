#!/usr/bin/env node
/*
 * Read-only inspection of two Postgres/Supabase databases.
 * Writes: .env.migration (gitignored), .migration/source.json, .migration/dest.json
 * Never prints credentials. Performs SELECTs only.
 *
 * Usage: node scripts/migration/inspect.cjs [dir-with-credentials-txt]
 */
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const EXT = process.argv[2] || 'D:/Horizon-2.0-main/Horizon-2.0-main';
const OUT = '.migration';
const SRC_REF = 'dvgtgrpmwkvdinlecmrj';
const DST_REF = 'beawfhpyatxhaoghbnhj';

fs.mkdirSync(OUT, { recursive: true });
const schemaTables = new Set(
  [...fs.readFileSync('db/schema.ts', 'utf8').matchAll(/pgTable\(\s*"([a-z_]+)"/g)].map((m) => m[1])
);

const norm = (u) => {
  const x = new URL(u.replace(/^postgres:\/\//, 'postgresql://'));
  ['sslmode', 'ssl', 'pgbouncer', 'connection_limit', 'pool_mode', 'options'].forEach((k) =>
    x.searchParams.delete(k)
  );
  return x.toString();
};
const describe = (u) => {
  try {
    const x = new URL(u.replace(/^postgres:\/\//, 'postgresql://'));
    return `${x.hostname}:${x.port || 5432}/${x.pathname.replace(/^\//, '')} user=${x.username} password=${
      x.password ? 'set' : 'MISSING'
    }`;
  } catch {
    return '(unparseable url)';
  }
};
const redact = (s) => String(s || '').replace(/postgres(ql)?:\/\/\S+/g, 'postgresql://***');
const qi = (s) => '"' + String(s).replace(/"/g, '""') + '"';

function readEnvFile(p) {
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function resolveCredentials() {
  // 1) already normalized?
  if (fs.existsSync('.env.migration')) {
    const e = readEnvFile('.env.migration');
    if (e.SOURCE_DATABASE_URL && e.DEST_DATABASE_URL) {
      return { src: e.SOURCE_DATABASE_URL, dst: e.DEST_DATABASE_URL, origin: '.env.migration' };
    }
  }
  // 2) scan the externally provided directory for a txt/env file with two URLs
  let names = [];
  try {
    names = fs
      .readdirSync(EXT, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((n) => /env|migration|database|credential/i.test(n) || /\.txt$/i.test(n));
  } catch (e) {
    throw new Error(`cannot list ${EXT}: ${e.code || e.message}`);
  }
  console.log('candidate files in', EXT + ':', names.join(', ') || '(none)');
  for (const n of names) {
    const p = path.join(EXT, n);
    let raw;
    try {
      if (fs.statSync(p).size > 50000) continue;
      raw = fs.readFileSync(p, 'utf8');
    } catch {
      continue;
    }
    const urls = [
      ...new Set((raw.match(/postgres(?:ql)?:\/\/[^\s"'<>)]+/g) || []).map((u) => u.replace(/[;,]+$/, ''))),
    ];
    if (!urls.length) continue;
    const e = readEnvFile(p);
    let src = e.SOURCE_DATABASE_URL || e.DATABASE_URL_SOURCE || urls.find((u) => u.includes(SRC_REF));
    let dst = e.DEST_DATABASE_URL || e.DATABASE_URL_DEST || urls.find((u) => u.includes(DST_REF));
    if (!src || !dst) continue;
    fs.writeFileSync(
      '.env.migration',
      `# generated from ${n} - do not commit\nSOURCE_DATABASE_URL=${norm(src)}\nDEST_DATABASE_URL=${norm(dst)}\n`
    );
    return { src: norm(src), dst: norm(dst), origin: n, keys: Object.keys(e).join(',') };
  }
  throw new Error('no file with two usable postgres URLs (source + destination) was found');
}

async function inspect(label, url) {
  const sql = postgres(norm(url), {
    max: 1,
    ssl: 'require',
    prepare: false,
    connect_timeout: 25,
    idle_timeout: 5,
    onnotice: () => {},
  });
  const res = { label, capturedAt: new Date().toISOString() };
  try {
    const m = await sql`select version() v, current_database() db, current_user usr, pg_database_size(current_database())::text size`;
    res.server = { version: String(m[0].v), db: m[0].db, user: m[0].usr, size: Number(m[0].size) };

    res.tables = await sql`
      select n.nspname schema, c.relname name
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind in ('r','p')
        and n.nspname not in ('pg_catalog','information_schema','pg_toast')
        and n.nspname not like 'pg_temp%' and n.nspname not like 'pg_toast_temp%'
      order by 1,2`;

    res.columns = await sql`
      select table_schema schema, table_name name, column_name column, data_type, udt_name,
             is_nullable, column_default
      from information_schema.columns
      where table_schema not in ('pg_catalog','information_schema')
      order by 1,2,ordinal_position`;

    res.constraints = await sql`
      select n.nspname schema, c.relname table, con.conname name, con.contype type,
             pg_get_constraintdef(con.oid) def, fn.nspname ref_schema, fc.relname ref_table
      from pg_constraint con
      join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      left join pg_class fc on fc.oid = con.confrelid
      left join pg_namespace fn on fn.oid = fc.relnamespace
      where n.nspname not in ('pg_catalog','information_schema')
      order by 1,2,3`;

    res.indexes = await sql`
      select schemaname schema, tablename table, indexname name
      from pg_indexes
      where schemaname not in ('pg_catalog','information_schema')
      order by 1,2,3`;

    res.rls = await sql`
      select n.nspname schema, c.relname table, c.relrowsecurity rls, c.relforcerowsecurity force
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r' and n.nspname = 'public'
      order by 2`;

    res.policies = await sql`
      select schemaname schema, tablename table, policyname name, cmd, roles::text roles
      from pg_policies order by 1,2,3`;

    res.functions = await sql`
      select n.nspname schema, p.proname name, pg_get_function_identity_arguments(p.oid) args,
             pg_get_function_result(p.oid) returns, p.prosecdef secdef, l.lanname lang
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      join pg_language l on l.oid = p.prolang
      where n.nspname = 'public'
      order by 2`;

    res.triggers = await sql`
      select n.nspname schema, c.relname table, t.tgname name
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where not t.tgisinternal and n.nspname not in ('pg_catalog','information_schema')
      order by 1,2,3`;

    res.enums = await sql`
      select n.nspname schema, t.typname name, array_agg(e.enumlabel order by e.enumsortorder) labels
      from pg_type t
      join pg_enum e on e.enumtypid = t.oid
      join pg_namespace n on n.oid = t.typnamespace
      group by 1,2 order by 2`;

    res.views = await sql`
      select n.nspname schema, c.relname name, c.relkind kind
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind in ('v','m') and n.nspname not in ('pg_catalog','information_schema')
      order by 1,2`;

    res.extensions = await sql`select extname name, extversion version from pg_extension order by 1`;

    res.rowCounts = {};
    for (const t of res.tables) {
      const key = t.schema + '.' + t.name;
      try {
        const r = await sql.unsafe(`select count(*)::text n from ${qi(t.schema)}.${qi(t.name)}`);
        res.rowCounts[key] = Number(r[0].n);
      } catch (e) {
        res.rowCounts[key] = { error: e.code || 'ERR' };
      }
    }

    res.migrations = { drizzle: null, supabase: null };
    try {
      const d = await sql`select to_regclass('drizzle.__drizzle_migrations') t`;
      if (d[0].t) {
        const rows = await sql`select id, hash, created_at from drizzle.__drizzle_migrations order by id`;
        res.migrations.drizzle = {
          count: rows.length,
          last: rows.length ? new Date(Number(rows[rows.length - 1].created_at)).toISOString() : null,
          rows,
        };
      }
    } catch {}
    try {
      const s = await sql`select to_regclass('supabase_migrations.schema_migrations') t`;
      if (s[0].t) {
        const rows = await sql`select version, name from supabase_migrations.schema_migrations order by version`;
        res.migrations.supabase = {
          count: rows.length,
          last: rows.length ? rows[rows.length - 1] : null,
          rows,
        };
      }
    } catch {}

    res.users = null;
    try {
      const u = await sql`select to_regclass('public.users') t`;
      if (u[0].t) {
        try {
          res.users = await sql`select id, email, role, created_at, (password_hash is not null) has_password
            from public.users order by created_at`;
        } catch {
          res.users = await sql`select id, email, role, created_at from public.users order by created_at`;
        }
      }
    } catch (e) {
      res.users = { error: e.code || 'ERR' };
    }

    res.coreCounts = {};
    for (const t of ['startups', 'investors', 'founder_profiles', 'interests', 'decks', 'bookmarks']) {
      try {
        const r = await sql.unsafe(`select count(*)::text n from public.${qi(t)}`);
        res.coreCounts[t] = Number(r[0].n);
      } catch {
        res.coreCounts[t] = null;
      }
    }
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
  fs.writeFileSync(path.join(OUT, label + '.json'), JSON.stringify(res, null, 2));
  return res;
}

(async () => {
  let creds;
  try {
    creds = resolveCredentials();
    console.log('credentials source:', creds.origin);
    console.log('SOURCE:', describe(creds.src));
    console.log('DEST  :', describe(creds.dst));
  } catch (e) {
    console.log('CREDENTIALS ERROR:', redact(e.message));
    process.exit(2);
  }

  const out = {};
  for (const [label, url] of [
    ['source', creds.src],
    ['dest', creds.dst],
  ]) {
    try {
      out[label] = await inspect(label, url);
      console.log(`\n### ${label.toUpperCase()} CONNECTED`);
    } catch (e) {
      console.log(`\n### ${label.toUpperCase()} FAILED:`, redact(e.message));
    }
  }

  for (const label of ['source', 'dest']) {
    const r = out[label];
    if (!r) continue;
    const pub = r.tables.filter((t) => t.schema === 'public');
    const bySchema = (s) => r.tables.filter((t) => t.schema === s);
    const sumRows = (s) =>
      bySchema(s).reduce((a, t) => {
        const v = r.rowCounts[t.schema + '.' + t.name];
        return a + (typeof v === 'number' ? v : 0);
      }, 0);
    console.log(`\n--- ${label.toUpperCase()} ---`);
    console.log('server:', r.server.version.slice(0, 70));
    console.log('database:', r.server.db, '| role:', r.server.user, '| size:', r.server.size, 'bytes');
    console.log(
      'public tables:',
      pub.length,
      '| public rows:',
      sumRows('public'),
      '| schemas:',
      [...new Set(r.tables.map((t) => t.schema))].join(', ')
    );
    for (const s of ['auth', 'storage', 'realtime', 'vault', 'extensions', 'graphql', 'graphql_public']) {
      if (bySchema(s).length) console.log(`  ${s} schema: ${bySchema(s).length} tables, ${sumRows(s)} rows`);
    }
    console.log(
      'drizzle migrations:',
      r.migrations.drizzle ? `${r.migrations.drizzle.count} (last ${r.migrations.drizzle.last})` : 'absent'
    );
    console.log(
      'supabase migrations:',
      r.migrations.supabase
        ? `${r.migrations.supabase.count} (last ${r.migrations.supabase.last && r.migrations.supabase.last.version})`
        : 'absent'
    );
    console.log(
      'functions:',
      r.functions.length,
      '| triggers:',
      r.triggers.length,
      '| enums:',
      r.enums.length,
      '| views:',
      r.views.length,
      '| extensions:',
      r.extensions.map((e) => e.name).join(',')
    );
    console.log('RLS tables:', r.rls.filter((x) => x.rls).length, '| policies:', r.policies.length);
    if (r.users && !r.users.error) {
      const roles = {};
      for (const u of r.users) roles[u.role] = (roles[u.role] || 0) + 1;
      console.log(
        'users:',
        r.users.length,
        '| roles:',
        JSON.stringify(roles),
        '| with password:',
        r.users.filter((u) => u.has_password).length
      );
    }
    console.log('core counts:', JSON.stringify(r.coreCounts));
    console.log('bookmarks table:', pub.some((t) => t.name === 'bookmarks') ? 'present' : 'MISSING');
    const extra = pub.filter((t) => !schemaTables.has(t.name)).map((t) => t.name);
    const missing = [...schemaTables].filter((t) => !pub.some((x) => x.name === t));
    console.log('tables not in schema.ts:', extra.join(',') || '(none)');
    console.log('schema.ts tables missing here:', missing.join(',') || '(none)');
  }

  if (out.source && out.dest) {
    const map = (r) => {
      const m = {};
      for (const t of r.tables.filter((x) => x.schema === 'public')) {
        m[t.name] = {
          rows: r.rowCounts['public.' + t.name],
          cols: r.columns.filter((c) => c.schema === 'public' && c.name === t.name).length,
        };
      }
      return m;
    };
    const A = map(out.source);
    const B = map(out.dest);
    const all = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
    console.log('\n--- PUBLIC TABLE MATRIX (source | dest) ---');
    console.log(
      'table'.padEnd(30) + 'src_rows'.padStart(10) + 'dst_rows'.padStart(10) + 'src_cols'.padStart(10) + 'dst_cols'.padStart(10)
    );
    for (const t of all) {
      const a = A[t];
      const b = B[t];
      console.log(
        t.padEnd(30) +
          String(a ? a.rows : '-').padStart(10) +
          String(b ? b.rows : '-').padStart(10) +
          String(a ? a.cols : '-').padStart(10) +
          String(b ? b.cols : '-').padStart(10)
      );
    }
    const normEmail = (e) => String(e || '').trim().toLowerCase();
    const srcMap = new Map((out.source.users || []).filter((u) => u && u.email).map((u) => [normEmail(u.email), u]));
    const dstMap = new Map((out.dest.users || []).filter((u) => u && u.email).map((u) => [normEmail(u.email), u]));
    const collisions = [...srcMap.keys()].filter((e) => dstMap.has(e));
    const mask = (e) => e.replace(/^(.)[^@]*(@.*)$/, '$1***$2');
    console.log('\nemail collisions:', collisions.length, collisions.slice(0, 20).map(mask).join(', '));
    console.log(
      'source-only emails:',
      [...srcMap.keys()].filter((e) => !dstMap.has(e)).length,
      '| dest-only emails:',
      [...dstMap.keys()].filter((e) => !srcMap.has(e)).length
    );
    console.log('\nartifacts: .migration/source.json .migration/dest.json');
  }
})();
