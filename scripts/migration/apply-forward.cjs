#!/usr/bin/env node
/*
 * Executes .migration/forward.sql against the company database.
 *   node scripts/migration/apply-forward.cjs --dry-run   (runs everything, rolls back)
 *   node scripts/migration/apply-forward.cjs --commit    (runs everything, commits)
 *
 * All statements run in ONE transaction with lock_timeout, so a failure leaves
 * the database untouched. Credentials are read from .env.migration and never printed.
 */
const fs = require('fs');
const postgres = require('postgres');

const commit = process.argv.includes('--commit');
const dryRun = process.argv.includes('--dry-run');
if (!commit && !dryRun) {
  console.error('usage: node scripts/migration/apply-forward.cjs --dry-run|--commit');
  process.exit(2);
}

const env = fs.readFileSync('.env.migration', 'utf8');
const url = (env.match(/^DEST_DATABASE_URL=(.*)$/m) || [])[1];
if (!url) {
  console.error('missing DEST_DATABASE_URL in .env.migration');
  process.exit(2);
}
const script = fs.readFileSync('.migration/forward.sql', 'utf8');

/** Split SQL on top-level semicolons, respecting dollar-quotes, strings and line comments. */
function splitSql(text) {
  const out = [];
  let buf = '';
  let dollar = null;
  let inString = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (dollar) {
      if (text.startsWith(dollar, i)) {
        buf += dollar;
        i += dollar.length;
        dollar = null;
      } else {
        buf += ch;
        i++;
      }
      continue;
    }
    if (inString) {
      buf += ch;
      if (ch === "'") {
        if (text[i + 1] === "'") {
          buf += "'";
          i += 2;
          continue;
        }
        inString = false;
      }
      i++;
      continue;
    }
    if (ch === "'") {
      inString = true;
      buf += ch;
      i++;
      continue;
    }
    if (ch === '$') {
      const m = text.slice(i).match(/^\$[a-zA-Z_]*\$/);
      if (m) {
        dollar = m[0];
        buf += dollar;
        i += dollar.length;
        continue;
      }
    }
    if (ch === '-' && text[i + 1] === '-') {
      const nl = text.indexOf('\n', i);
      const end = nl === -1 ? text.length : nl;
      buf += text.slice(i, end);
      i = end;
      continue;
    }
    if (ch === ';') {
      const s = buf.trim();
      const code = s
        .split('\n')
        .filter((l) => !l.trim().startsWith('--'))
        .join('')
        .trim();
      if (code) out.push(s);
      buf = '';
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

const statements = splitSql(script);
console.log(`mode: ${commit ? 'COMMIT' : 'DRY-RUN (rollback)'}`);
console.log('statements to execute:', statements.length);

class DryRunRollback extends Error {}
const started = Date.now();

(async () => {
  const sql = postgres(url, { max: 1, ssl: 'require', prepare: false, connect_timeout: 20, idle_timeout: 5, onnotice: () => {} });
  let applied = 0;
  try {
    await sql.begin(async (tx) => {
      await tx.unsafe('set local lock_timeout = \'20s\'');
      await tx.unsafe('set local statement_timeout = \'180s\'');
      await tx.unsafe("select pg_advisory_xact_lock(hashtext('vulturex_schema_upgrade'))");
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await tx.unsafe(stmt);
          applied++;
        } catch (e) {
          console.error(`\nFAILED at statement ${i + 1}/${statements.length}`);
          console.error(stmt.slice(0, 400));
          console.error('error:', e.message, '| code:', e.code || '-');
          throw e;
        }
        if ((i + 1) % 25 === 0) console.log('  applied', i + 1);
      }
      if (!commit) throw new DryRunRollback('dry-run');
    });
    console.log(`COMMITTED ${applied} statements in ${Date.now() - started}ms`);
  } catch (e) {
    if (e instanceof DryRunRollback) {
      console.log(`DRY-RUN OK: ${applied} statements executed, transaction rolled back (no changes kept).`);
    } else {
      console.error('transaction rolled back; database unchanged.');
      process.exitCode = 1;
    }
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
})();
