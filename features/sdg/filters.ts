import { sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Database-side SDG filters.
 *
 * Filtering happens in Postgres (array overlap / containment) so Explore,
 * rankings and the public API never load the whole startup table to filter in
 * memory.
 */

export type SdgMatchMode = "any" | "all";

export function parseSdgMatchMode(value: unknown): SdgMatchMode {
  return value === "all" ? "all" : "any";
}

/**
 * `any` -> at least one selected goal (default, matches the filter UX)
 * `all` -> every selected goal must be present
 */
export function startupSdgCondition(
  column: PgColumn,
  ids: readonly number[],
  mode: SdgMatchMode = "any"
): SQL {
  const list = sql.join(
    ids.map((id) => sql`${id}::integer`),
    sql`, `
  );

  return mode === "all"
    ? sql`${column} @> ARRAY[${list}]::integer[]`
    : sql`${column} && ARRAY[${list}]::integer[]`;
}

/** Competition focus goals are stored as a jsonb array of numbers. */
export function competitionSdgCondition(
  column: PgColumn,
  ids: readonly number[]
): SQL {
  const payload = JSON.stringify(ids);
  return sql`${column} @> ${payload}::jsonb`;
}
