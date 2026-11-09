/**
 * Ownership-scoped saved Knowledge Hub resources.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { savedResources } from "@/db/schema";
import { getSavedResourceCatalogEntry } from "./catalog";

export class SavedResourceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "SavedResourceError";
    this.status = status;
  }
}

export type SavedResourceView = {
  id: string;
  resourceKey: string;
  title: string;
  category: string;
  description: string | null;
  href: string;
  savedAt: string;
};

function toView(row: typeof savedResources.$inferSelect): SavedResourceView {
  return {
    id: row.id,
    resourceKey: row.resourceKey,
    title: row.title,
    category: row.category,
    description: row.description,
    href: row.href,
    savedAt: row.createdAt.toISOString(),
  };
}

export async function listSavedResources(userId: string): Promise<SavedResourceView[]> {
  const rows = await db
    .select()
    .from(savedResources)
    .where(eq(savedResources.userId, userId))
    .orderBy(desc(savedResources.createdAt));
  return rows.map(toView);
}

export async function getSavedResourceCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(savedResources)
    .where(eq(savedResources.userId, userId));
  return Number(row?.count ?? 0);
}

export async function saveResource(
  userId: string,
  key: unknown
): Promise<{ resource: SavedResourceView; created: boolean }> {
  const entry = getSavedResourceCatalogEntry(key);
  if (!entry) {
    throw new SavedResourceError("That Knowledge Hub resource cannot be saved");
  }

  const inserted = await db
    .insert(savedResources)
    .values({
      userId,
      resourceKey: entry.key,
      title: entry.title,
      category: entry.category,
      description: entry.description,
      href: entry.href,
    })
    .onConflictDoNothing({
      target: [savedResources.userId, savedResources.resourceKey],
    })
    .returning();

  if (inserted.length > 0) {
    return { resource: toView(inserted[0]), created: true };
  }

  // Duplicate save: return the existing row so the client stays idempotent.
  const [existing] = await db
    .select()
    .from(savedResources)
    .where(
      and(
        eq(savedResources.userId, userId),
        eq(savedResources.resourceKey, entry.key)
      )
    )
    .limit(1);

  if (!existing) {
    throw new SavedResourceError("Could not save that resource", 500);
  }

  return { resource: toView(existing), created: false };
}

export async function removeSavedResource(
  userId: string,
  key: unknown
): Promise<{ removed: boolean }> {
  if (typeof key !== "string" || !key) {
    throw new SavedResourceError("A resource key is required");
  }

  const removed = await db
    .delete(savedResources)
    .where(
      and(eq(savedResources.userId, userId), eq(savedResources.resourceKey, key))
    )
    .returning({ id: savedResources.id });

  return { removed: removed.length > 0 };
}
