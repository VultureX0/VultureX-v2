#!/usr/bin/env node
/*
 * Static schema and migration integrity checks.
 *
 * This is deliberately database-free: it never reads DATABASE_URL and never
 * connects to a database. It checks the repository's migration history, journal
 * and schema declarations. It does NOT prove live database parity.
 *
 * Destructive statements (DROP TABLE, TRUNCATE, DROP COLUMN, ALTER COLUMN TYPE,
 * DROP SCHEMA/DATABASE, DELETE FROM and DROP of schema objects) fail the check
 * unless the SQL file contains an explicit approval line:
 *
 *   -- destructive-change-approved: <ticket or written reason>
 *
 * The reason must be at least 8 characters. Review it in the pull request.
 *
 * Usage: node scripts/ci/validate-schema.cjs [--root <repository-root>]
 */
"use strict";

const fs = require("fs");
const path = require("path");

const rootFlag = process.argv.indexOf("--root");
if (rootFlag !== -1 && !process.argv[rootFlag + 1]) {
  console.error("--root requires a directory argument");
  process.exit(2);
}
const root =
  rootFlag === -1 ? process.cwd() : path.resolve(process.argv[rootFlag + 1]);
const migrationsDir = path.join(root, "db", "migrations");
const journalFile = path.join(migrationsDir, "meta", "_journal.json");
const schemaFile = path.join(root, "db", "schema.ts");

const errors = [];
const notes = [];
const fail = (message) => errors.push(message);
const note = (message) => notes.push(message);

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    fail(`cannot read ${path.relative(root, file) || file}: ${error.message}`);
    return null;
  }
}

/*
 * Scan SQL and return executable-looking code with comments and quoted literals
 * blanked. This is a lexical sanity check, not a PostgreSQL parser. It verifies
 * quote/dollar-quote/comment closure and balanced parentheses.
 */
function analyzeSql(text) {
  const problems = [];
  let code = "";
  let i = 0;
  let line = 1;
  let parens = 0;
  let single = false;
  let double = false;
  let block = 0;
  let lineComment = false;
  let dollar = null;

  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];

    if (lineComment) {
      if (c === "\n") {
        lineComment = false;
        code += "\n";
        line++;
      }
      i++;
      continue;
    }

    if (block > 0) {
      if (c === "/" && next === "*") {
        block++;
        i += 2;
        continue;
      }
      if (c === "*" && next === "/") {
        block--;
        i += 2;
        continue;
      }
      if (c === "\n") line++;
      i++;
      continue;
    }

    if (single) {
      if (c === "'" && next === "'") {
        i += 2;
        continue;
      }
      if (c === "'") single = false;
      if (c === "\n") line++;
      i++;
      continue;
    }

    if (double) {
      if (c === '"' && next === '"') {
        i += 2;
        continue;
      }
      if (c === '"') double = false;
      if (c === "\n") line++;
      i++;
      continue;
    }

    if (dollar) {
      if (text.startsWith(dollar, i)) {
        i += dollar.length;
        dollar = null;
        continue;
      }
      if (c === "\n") line++;
      i++;
      continue;
    }

    if (c === "-" && next === "-") {
      lineComment = true;
      code += " ";
      i += 2;
      continue;
    }

    if (c === "/" && next === "*") {
      block = 1;
      code += " ";
      i += 2;
      continue;
    }

    if (c === "'") {
      single = true;
      code += " ";
      i++;
      continue;
    }

    if (c === '"') {
      double = true;
      code += " ";
      i++;
      continue;
    }

    if (c === "$") {
      const match = text.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      if (match) {
        dollar = match[0];
        code += " ";
        i += dollar.length;
        continue;
      }
    }

    if (c === "(") {
      parens++;
      code += c;
      i++;
      continue;
    }

    if (c === ")") {
      parens--;
      if (parens < 0) {
        problems.push(`unexpected ')' at line ${line}`);
        parens = 0;
      }
      code += c;
      i++;
      continue;
    }

    code += c;
    if (c === "\n") line++;
    i++;
  }

  if (single) problems.push(`unterminated single-quoted string near line ${line}`);
  if (double) problems.push(`unterminated double-quoted identifier near line ${line}`);
  if (block > 0) problems.push(`unterminated block comment near line ${line}`);
  if (dollar) problems.push(`unterminated dollar-quoted block ${dollar} near line ${line}`);
  if (parens !== 0) problems.push(`unbalanced parentheses (${parens} unclosed)`);

  return { code, problems };
}

function parseJournal() {
  const raw = read(journalFile);
  if (raw === null) return null;
  let journal;
  try {
    journal = JSON.parse(raw);
  } catch (error) {
    fail(`meta/_journal.json is not valid JSON: ${error.message}`);
    return null;
  }
  if (journal.dialect !== "postgresql") {
    fail(`journal dialect must be postgresql, got ${JSON.stringify(journal.dialect)}`);
  }
  if (!Array.isArray(journal.entries) || journal.entries.length === 0) {
    fail("journal must contain a non-empty entries array");
    return null;
  }
  return journal;
}

function validateJournal(journal) {
  const tags = new Map();
  const indexes = new Map();
  const prefixes = new Map();
  let previousWhen = 0;

  journal.entries.forEach((entry, position) => {
    const label = `journal entry ${position}`;
    if (!entry || typeof entry !== "object") {
      fail(`${label} is not an object`);
      return;
    }

    const { idx, tag, when, version } = entry;
    if (!Number.isInteger(idx) || idx < 0) {
      fail(`${label} has an invalid idx ${JSON.stringify(idx)}`);
    } else if (idx !== position) {
      fail(`${label} has idx ${idx}; entries must be ordered and contiguous from 0`);
    }
    if (typeof tag !== "string" || !/^\d{4}_[a-z0-9_]+$/.test(tag)) {
      fail(`${label} has an invalid tag ${JSON.stringify(tag)} (expected 0000_name)`);
    }
    if (!Number.isInteger(when)) {
      fail(`${label} has an invalid timestamp ${JSON.stringify(when)}`);
    } else {
      const min = Date.UTC(2000, 0, 1);
      const max = Date.UTC(2100, 0, 1);
      if (when < min || when > max) {
        fail(`${label} timestamp ${when} is outside the 2000-2100 millisecond range`);
      }
      if (when <= previousWhen) {
        fail(`${label} timestamp ${when} is not strictly after the previous entry`);
      }
      previousWhen = when;
    }
    if (version !== journal.version) {
      fail(`${label} version ${JSON.stringify(version)} does not match journal version ${JSON.stringify(journal.version)}`);
    }

    if (typeof tag === "string") {
      if (tags.has(tag)) fail(`duplicate migration tag ${tag}`);
      tags.set(tag, entry);
      const prefix = tag.slice(0, 4);
      if (prefixes.has(prefix)) fail(`duplicate migration identifier prefix ${prefix}`);
      prefixes.set(prefix, entry);
      if (Number.isInteger(idx) && prefix !== String(idx).padStart(4, "0")) {
        fail(`${label} tag prefix ${prefix} does not match idx ${idx}`);
      }
    }
    if (Number.isInteger(idx)) {
      if (indexes.has(idx)) fail(`duplicate migration idx ${idx}`);
      indexes.set(idx, entry);
    }
  });
}

function validateMigrationFiles(journal) {
  let files = [];
  try {
    files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();
  } catch (error) {
    fail(`cannot list db/migrations: ${error.message}`);
    return { files: [], contents: new Map() };
  }

  const entriesByTag = new Map(journal.entries.map((entry) => [entry.tag, entry]));
  const contents = new Map();

  for (const file of files) {
    const tag = file.slice(0, -4);
    if (!entriesByTag.has(tag)) {
      fail(`${file} has no journal entry`);
      continue;
    }
    const contentsForFile = read(path.join(migrationsDir, file));
    if (contentsForFile === null) continue;
    contents.set(tag, contentsForFile);
    if (!contentsForFile.trim()) fail(`${file} is empty`);
  }

  for (const entry of journal.entries) {
    if (!files.includes(`${entry.tag}.sql`)) {
      fail(`journal entry ${entry.tag} references missing migration ${entry.tag}.sql`);
    }
  }

  return { files, contents };
}

const APPROVAL_MARKER = /^--\s*destructive-change-approved:\s*(.*)$/gim;

/*
 * An approval is a single-line comment marker with a written reason of at least
 * eight characters. Anything shorter is treated as an invalid approval, not as
 * an absent one, so a placeholder marker cannot pass by accident.
 */
function readApproval(sql) {
  let approved = null;
  let invalid = null;
  for (const match of sql.matchAll(APPROVAL_MARKER)) {
    const reason = match[1].trim();
    if (reason.length >= 8) {
      if (approved === null) approved = reason;
    } else {
      invalid = reason;
    }
  }
  return { approved, invalid };
}

function validateSqlFiles(contents) {
  const destructive = [
    ["DROP TABLE", /\bDROP\s+TABLE\b/i],
    ["TRUNCATE", /\bTRUNCATE\b/i],
    ["DROP COLUMN", /\bDROP\s+COLUMN\b/i],
    ["ALTER COLUMN TYPE", /\bALTER\s+COLUMN\b[\s\S]*?\bTYPE\b/i],
    ["DROP SCHEMA/DATABASE", /\bDROP\s+(?:SCHEMA|DATABASE)\b/i],
    ["DELETE FROM", /\bDELETE\s+FROM\b/i],
    ["DROP CONSTRAINT", /\bDROP\s+CONSTRAINT\b/i],
    ["DROP INDEX", /\bDROP\s+INDEX\b/i],
    ["DROP VIEW", /\bDROP\s+VIEW\b/i],
    ["DROP FUNCTION", /\bDROP\s+FUNCTION\b/i],
    ["DROP TYPE", /\bDROP\s+TYPE\b/i],
    ["DROP SEQUENCE", /\bDROP\s+SEQUENCE\b/i],
  ];

  for (const [tag, sql] of contents) {
    const analysis = analyzeSql(sql);
    for (const problem of analysis.problems) fail(`${tag}.sql: ${problem}`);
    if (!analysis.code.trim()) {
      fail(`${tag}.sql contains no executable SQL`);
      continue;
    }

    const { approved, invalid } = readApproval(sql);
    const found = [];

    for (const statement of analysis.code.split(";")) {
      for (const [name, pattern] of destructive) {
        if (pattern.test(statement)) found.push(name);
      }
    }

    const unique = [...new Set(found)];
    if (unique.length === 0) continue;
    if (invalid !== null && !approved) {
      fail(
        `${tag}.sql has a destructive-change-approved marker whose reason is too short ` +
          `(${JSON.stringify(invalid)}); write at least 8 characters explaining the change`
      );
    } else if (approved) {
      note(`${tag}.sql approved destructive change (${unique.join(", ")}): ${approved}`);
    } else {
      fail(
        `${tag}.sql contains destructive SQL (${unique.join(", ")}) without ` +
          "`-- destructive-change-approved: <reason>`"
      );
    }
  }
}

function parseSchema() {
  const source = read(schemaFile);
  if (source === null) return new Map();
  const tables = new Map();
  const regex = /pgTable\(\s*"([a-z_]+)"\s*,\s*\{/g;
  let match;

  while ((match = regex.exec(source))) {
    const table = match[1];
    if (tables.has(table)) fail(`duplicate schema table ${table}`);
    const open = source.indexOf("{", match.index);
    let depth = 0;
    let single = false;
    let double = false;
    let backtick = false;
    let close = -1;

    for (let i = open; i < source.length; i++) {
      const c = source[i];
      if (single) {
        if (c === "'" && source[i + 1] === "'") i++;
        else if (c === "'") single = false;
        continue;
      }
      if (double) {
        if (c === '"' && source[i + 1] === '"') i++;
        else if (c === '"') double = false;
        continue;
      }
      if (backtick) {
        if (c === "`") backtick = false;
        continue;
      }
      if (c === "'") {
        single = true;
        continue;
      }
      if (c === '"') {
        double = true;
        continue;
      }
      if (c === "`") {
        backtick = true;
        continue;
      }
      if (c === "{") depth++;
      if (c === "}") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }

    if (close === -1) {
      fail(`cannot find the end of the ${table} schema definition`);
      continue;
    }

    const body = source.slice(open + 1, close);
    const columns = new Set();
    const columnRegex =
      /\b(?:uuid|text|integer|numeric|boolean|jsonb|json|timestamp|serial|bigint|date|bytea|varchar|doublePrecision|real|smallint|time)\s*\(\s*"([a-z_][a-z0-9_]*)"/g;
    let column;
    while ((column = columnRegex.exec(body))) columns.add(column[1]);
    tables.set(table, columns);
  }

  if (tables.size === 0) fail("schema.ts contains no pgTable definitions");
  return tables;
}

function parseMigrationColumns(contents) {
  const tables = new Map();
  const tableRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-z_]+)"?\s*\(([\s\S]*?)\n\s*\);/gi;

  for (const sql of contents.values()) {
    let match;
    while ((match = tableRegex.exec(sql))) {
      const table = match[1];
      if (!tables.has(table)) tables.set(table, new Set());
      for (const line of match[2].split(/\r?\n/)) {
        const column = line.match(/^\s*"([a-z_][a-z0-9_]*)"\s+/);
        if (column) tables.get(table).add(column[1]);
      }
    }

    const alterRegex =
      /ALTER\s+TABLE\s+"?([a-z_]+)"?\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-z_]+)"?/gi;
    while ((match = alterRegex.exec(sql))) {
      if (!tables.has(match[1])) tables.set(match[1], new Set());
      tables.get(match[1]).add(match[2]);
    }
  }

  return tables;
}

function validateSchema(schemaTables, migrationTables) {
  // Schema/migration parity below is the guard against a dropped table or
  // column; a hardcoded table count would only break on legitimate additions.
  const requiredTables = [
    "users",
    "startups",
    "investors",
    "bookmarks",
    "competitions",
    "roadmap_tasks",
    "roadmap_milestones",
    "saved_resources",
    "reminders",
    "conversations",
    "messages",
    "notifications",
    "competition_applications",
  ];
  for (const table of requiredTables) {
    if (!schemaTables.has(table)) fail(`required schema table ${table} is missing`);
    if (!migrationTables.has(table)) fail(`required table ${table} has no CREATE TABLE migration`);
  }

  for (const table of schemaTables.keys()) {
    if (!migrationTables.has(table)) fail(`schema table ${table} has no CREATE TABLE migration`);
  }
  for (const table of migrationTables.keys()) {
    if (!schemaTables.has(table)) fail(`migration creates table ${table}, which is not in schema.ts`);
  }

  for (const [table, columns] of schemaTables) {
    const migrated = migrationTables.get(table);
    if (!migrated) continue;
    const missing = [...columns].filter((column) => !migrated.has(column));
    const extra = [...migrated].filter((column) => !columns.has(column));
    if (missing.length) fail(`${table} columns missing from migrations: ${missing.join(", ")}`);
    if (extra.length) fail(`${table} columns in migrations but not schema.ts: ${extra.join(", ")}`);
  }
}

function validateRequiredMigrations(contents) {
  const required = ["0009_bookmarks", "0010_startups_owner_select"];
  for (const tag of required) {
    if (!contents.has(tag)) fail(`required migration ${tag}.sql is missing`);
  }

  const bookmarks = contents.get("0009_bookmarks");
  if (bookmarks && !/CREATE\s+TABLE\s+"?bookmarks"?/i.test(bookmarks)) {
    fail("0009_bookmarks.sql does not create the bookmarks table");
  }
  if (bookmarks && !/CREATE\s+UNIQUE\s+INDEX[\s\S]*?unique_user_startup_bookmark/i.test(bookmarks)) {
    fail("0009_bookmarks.sql does not define unique_user_startup_bookmark");
  }

  const rls = contents.get("0010_startups_owner_select");
  if (rls) {
    if (!/CREATE\s+POLICY\s+"?startups_owner_select"?/i.test(rls)) {
      fail("0010_startups_owner_select.sql does not create startups_owner_select");
    }
    if (!/FOR\s+SELECT/i.test(rls)) {
      fail("startups_owner_select must be a SELECT policy");
    }
    if (!/user_id\s*=\s*public\.vx_current_user_id\(\)/i.test(rls)) {
      fail("startups_owner_select must restrict access to user_id = public.vx_current_user_id()");
    }
  }
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migration directory not found: ${migrationsDir}`);
    process.exit(2);
  }

  const journal = parseJournal();
  if (!journal) {
    report();
    return;
  }

  validateJournal(journal);
  const { files, contents } = validateMigrationFiles(journal);
  validateSqlFiles(contents);
  const schemaTables = parseSchema();
  const migrationTables = parseMigrationColumns(contents);
  validateSchema(schemaTables, migrationTables);
  validateRequiredMigrations(contents);

  const schemaColumns = [...schemaTables.values()].reduce((total, columns) => total + columns.size, 0);
  const migrationColumns = [...migrationTables.values()].reduce((total, columns) => total + columns.size, 0);
  note(`migrations: ${files.length}; journal entries: ${journal.entries.length}`);
  note(`schema tables: ${schemaTables.size}; schema columns: ${schemaColumns}`);
  note(`migration tables: ${migrationTables.size}; migration columns: ${migrationColumns}`);

  report();
}

function report() {
  for (const message of notes) console.log(`  ${message}`);
  if (errors.length) {
    console.error(`\nSCHEMA VALIDATION FAILED (${errors.length}):`);
    for (const message of errors) console.error(`  - ${message}`);
    console.error(
      "\nStatic checks only: this does not establish live database parity. " +
        "Use scripts/migration/verify-dest.cjs against a real database for that."
    );
    process.exit(1);
  }
  console.log("\nSCHEMA VALIDATION PASSED");
  console.log(
    "Static checks only: this does not establish live database parity. " +
      "Use scripts/migration/verify-dest.cjs against a real database for that."
  );
}

main();
