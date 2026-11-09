import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * True only for a well-formed UUID.
 * Querying a uuid column with anything else makes Postgres throw 22P02, which
 * would surface as a 500 for what is really a bad request. Guard untrusted ids
 * (path params, request bodies) with this before they reach the database.
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * The Postgres SQLSTATE behind an error thrown by Drizzle.
 *
 * Drizzle wraps driver failures in a DrizzleQueryError whose own `code` is
 * undefined — the SQLSTATE sits on `cause`. Unwrapping the chain lets callers
 * tell a unique violation (23505) from a foreign key violation (23503) instead
 * of treating every failure the same way.
 */
export function sqlStateOf(error: unknown): string | undefined {
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (typeof current === "object" && current !== null && !seen.has(current)) {
    seen.add(current);
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }

  return undefined;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
