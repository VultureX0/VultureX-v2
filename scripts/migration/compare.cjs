#!/usr/bin/env node
/* Three-way comparison: source DB vs destination DB vs repository schema.
 * Reads .migration/source.json, .migration/dest.json and db/schema.ts + migrations.
 * Writes .migration/comparison.json. No database access, no writes to either DB.
 */
const fs = require('fs');

const src = JSON.parse(fs.readFileSync('.migration/source.json', 'utf8'));
const dst = JSON.parse(fs.readFileSync('.migration/dest.json', 'utf8'));

const repoTables = [...fs.readFileSync('db/schema.ts', 'utf8').matchAll(/pgTable\(\s*"([a-z_]+)"/g)].map((m) => m[1]);
const repo = {};
for (const f of fs.readdirSync('db/migrations').filter((x) => x.endsWith('.sql'))) {
  const sql = fs.readFileSync('db/migrations/' + f, 'utf8');
  for (const m of sql.matchAll(/CREATE TABLE "?([a-z_]+)"? \(([\s\S]*?)\n\);/g)) {
    const cols = new Set();
    for (const line of m[2].split('\n')) {
      const c = line.match(/^\s*"?([a-z_][a-z0-9_]*)"?\s+"?([a-z][a-z0-9_]*)"?/);
      if (!c) continue;
      if (/^(constraint|primary|unique|foreign|check|exclude)$/i.test(c[1])) continue;
      if (!/^(uuid|text|integer|int|bigint|numeric|boolean|bool|jsonb|json|timestamp|timestamptz|date|bytea|serial|smallint|real|double|varchar|time)$/i.test(c[2])) continue;
      cols.add(c[1]);
    }
    repo[m[1]] = cols;
  }
  for (const m of sql.matchAll(/ALTER TABLE "?([a-z_]+)"? ADD COLUMN (?:IF NOT EXISTS )?"?([a-z_]+)"?/g)) {
    if (repo[m[1]]) repo[m[1]].add(m[2]);
  }
}

const pub = (r) => r.tables.filter((t) => t.schema === 'public');
const colsOf = (r, table) =>
  new Set(r.columns.filter((c) => c.schema === 'public' && c.name === table).map((c) => c.column));
const rowsOf = (r, table) => {
  const v = r.rowCounts['public.' + table];
  return typeof v === 'number' ? v : v ? 'ERR' : '-';
};
const mask = (e) => String(e || '').replace(/^(.)[^@]*(@.*)$/, '$1***$2');

const S = pub(src);
const D = pub(dst);
const srcNames = new Set(S.map((t) => t.name));
const dstNames = new Set(D.map((t) => t.name));
const allNames = [...new Set([...srcNames, ...dstNames, ...repoTables])].sort();

const report = {
  capturedAt: new Date().toISOString(),
  source: {
    server: src.server.version,
    db: src.server.db,
    size: src.server.size,
    tables: S.length,
    rows: S.reduce((a, t) => a + (typeof src.rowCounts['public.' + t.name] === 'number' ? src.rowCounts['public.' + t.name] : 0), 0),
    users: Array.isArray(src.users) ? src.users.length : null,
    rls: src.rls.filter((r) => r.rls).length,
    policies: src.policies.length,
    migrations: src.migrations,
  },
  dest: {
    server: dst.server.version,
    db: dst.server.db,
    size: dst.server.size,
    tables: D.length,
    rows: D.reduce((a, t) => a + (typeof dst.rowCounts['public.' + t.name] === 'number' ? dst.rowCounts['public.' + t.name] : 0), 0),
    users: Array.isArray(dst.users) ? dst.users.length : null,
    rls: dst.rls.filter((r) => r.rls).length,
    policies: dst.policies.length,
    migrations: dst.migrations,
  },
  matrix: [],
  drift: [],
  conflicts: [],
};

console.log('=== SERVER SUMMARY ===');
for (const [label, r] of [['source', report.source], ['dest', report.dest]]) {
  console.log(
    `${label}: ${r.tables} tables / ${r.rows} rows | users ${r.users} | RLS ${r.rls} | policies ${r.policies} | ` +
      `drizzle ${r.migrations.drizzle ? r.migrations.drizzle.count : 'absent'} | supabase ${r.migrations.supabase ? r.migrations.supabase.count : 'absent'}`
  );
  console.log('  ', String(r.server).slice(0, 65));
}

console.log('\n=== TABLE MATRIX (src rows / dst rows / src cols / dst cols / repo cols) ===');
for (const t of allNames) {
  const sRows = srcNames.has(t) ? rowsOf(src, t) : '-';
  const dRows = dstNames.has(t) ? rowsOf(dst, t) : '-';
  const sCols = srcNames.has(t) ? colsOf(src, t).size : '-';
  const dCols = dstNames.has(t) ? colsOf(dst, t).size : '-';
  const rCols = repo[t] ? repo[t].size : repoTables.includes(t) ? '?' : '-';
  report.matrix.push({ table: t, srcRows: sRows, dstRows: dRows, srcCols: sCols, dstCols: dCols, repoCols: rCols });
  console.log(
    '  ' + t.padEnd(30) + String(sRows).padStart(9) + String(dRows).padStart(9) + String(sCols).padStart(9) + String(dCols).padStart(9) + String(rCols).padStart(9)
  );
}

console.log('\n=== COLUMN DRIFT ===');
let driftCount = 0;
for (const t of allNames) {
  if (!repo[t] && !srcNames.has(t) && !dstNames.has(t)) continue;
  const R = repo[t] || new Set();
  const Sset = srcNames.has(t) ? colsOf(src, t) : null;
  const Dset = dstNames.has(t) ? colsOf(dst, t) : null;
  const diff = (A, B, label) => {
    if (!A || !B) return;
    const miss = [...B].filter((c) => !A.has(c));
    const extra = [...A].filter((c) => !B.has(c));
    if (miss.length || extra.length) {
      driftCount++;
      const line = `  ${t} ${label}: missing[${miss.join(',')}] extra[${extra.join(',')}]`;
      console.log(line);
      report.drift.push({ table: t, vs: label, missing: miss, extra });
    }
  };
  diff(Sset, R, 'src-vs-repo');
  diff(Dset, R, 'dst-vs-repo');
  diff(Sset, Dset, 'src-vs-dst');
}
if (!driftCount) console.log('  none');

console.log('\n=== USERS ===');
const sUsers = Array.isArray(src.users) ? src.users : [];
const dUsers = Array.isArray(dst.users) ? dst.users : [];
const norm = (e) => String(e || '').trim().toLowerCase();
const sMap = new Map(sUsers.filter((u) => u.email).map((u) => [norm(u.email), u]));
const dMap = new Map(dUsers.filter((u) => u.email).map((u) => [norm(u.email), u]));
const collisions = [...sMap.keys()].filter((e) => dMap.has(e));
report.users = {
  source: sUsers.length,
  dest: dUsers.length,
  collisions: collisions.length,
  collisionEmails: collisions.map(mask),
  sourceOnly: [...sMap.keys()].filter((e) => !dMap.has(e)).length,
  destOnly: [...dMap.keys()].filter((e) => !sMap.has(e)).length,
  sourceRoles: sUsers.reduce((a, u) => ((a[u.role] = (a[u.role] || 0) + 1), a), {}),
  destRoles: dUsers.reduce((a, u) => ((a[u.role] = (a[u.role] || 0) + 1), a), {}),
};
console.log('source users:', report.users.source, JSON.stringify(report.users.sourceRoles));
console.log('dest users:', report.users.dest, JSON.stringify(report.users.destRoles));
console.log('email collisions:', report.users.collisions, collisions.map(mask).join(', '));
console.log('source-only:', report.users.sourceOnly, '| dest-only:', report.users.destOnly);

console.log('\n=== FOREIGN-KEY COMPATIBILITY ===');
const sFks = (src.constraints || []).filter((c) => c.schema === 'public' && c.type === 'f');
const dFks = (dst.constraints || []).filter((c) => c.schema === 'public' && c.type === 'f');
const danglingInDest = sFks.filter((f) => f.ref_table && !dstNames.has(f.ref_table));
const danglingInSrc = dFks.filter((f) => f.ref_table && !srcNames.has(f.ref_table));
console.log('source FKs:', sFks.length, '| dest FKs:', dFks.length);
console.log('source FKs targeting tables absent in dest:', danglingInDest.length);
for (const f of danglingInDest.slice(0, 20)) console.log('  ', f.table + '.' + f.name + ' -> ' + f.ref_table);
console.log('dest FKs targeting tables absent in source:', danglingInSrc.length);
for (const f of danglingInSrc.slice(0, 20)) console.log('  ', f.table + '.' + f.name + ' -> ' + f.ref_table);
report.fk = { source: sFks.length, dest: dFks.length, danglingInDest: danglingInDest.length, danglingInSrc: danglingInSrc.length };

console.log('\n=== RLS / OBJECTS ===');
console.log('source RLS:', src.rls.filter((r) => r.rls).length, '| policies:', src.policies.length, src.policies.map((p) => p.table + ':' + p.name).join(', ') || '(none)');
console.log('dest RLS:', dst.rls.filter((r) => r.rls).length, '| policies:', dst.policies.length);
console.log('source public functions:', src.functions.length, '| triggers:', src.triggers.filter((t) => t.schema === 'public').length);
console.log('source enums (all schemas):', src.enums.length, '| views (all):', src.views.length);
console.log('dest enums (all):', dst.enums.length, '| views (all):', dst.views.length);

console.log('\n=== MIGRATION HISTORY ===');
for (const [label, r] of [['source', src], ['dest', dst]]) {
  console.log(
    label,
    '| drizzle:',
    r.migrations.drizzle ? `${r.migrations.drizzle.count} last ${r.migrations.drizzle.last}` : 'absent',
    '| supabase:',
    r.migrations.supabase ? `${r.migrations.supabase.count} ${r.migrations.supabase.rows.map((x) => x.version + ':' + x.name).join(', ')}` : 'absent'
  );
}

console.log('\n=== CONFLICT SUMMARY ===');
const conflicts = [];
const onlySrc = [...srcNames].filter((t) => !dstNames.has(t));
const onlyDst = [...dstNames].filter((t) => !srcNames.has(t));
const onlyRepo = repoTables.filter((t) => !srcNames.has(t) || !dstNames.has(t));
if (onlySrc.length) conflicts.push('tables only in source: ' + onlySrc.join(','));
if (onlyDst.length) conflicts.push('tables only in destination: ' + onlyDst.join(','));
if (onlyRepo.length) conflicts.push('repo tables missing from one side: ' + onlyRepo.join(','));
if (report.users.collisions) conflicts.push('email collisions: ' + report.users.collisions);
if (danglingInDest.length) conflicts.push('source FKs referencing tables absent in destination: ' + danglingInDest.length);
if (danglingInSrc.length) conflicts.push('destination FKs referencing tables absent in source: ' + danglingInSrc.length);
if (report.drift.length) conflicts.push('column drift entries: ' + report.drift.length);
for (const c of conflicts) console.log(' -', c);
report.conflicts = conflicts;

const srcOnlyRows = [...srcNames].filter((t) => !dstNames.has(t)).reduce((a, t) => a + (typeof src.rowCounts['public.' + t.name] === 'number' ? src.rowCounts['public.' + t.name] : 0), 0);
console.log('\nrows in source tables that do not exist in destination:', srcOnlyRows);
report.srcOnlyRows = srcOnlyRows;

fs.writeFileSync('.migration/comparison.json', JSON.stringify(report, null, 2));
console.log('\nwrote .migration/comparison.json');
