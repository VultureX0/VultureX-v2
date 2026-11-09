import { eq } from "drizzle-orm";
import { db } from "@/db";
import { startups } from "@/db/schema";
import { auth } from "@/features/auth";

export type StartupActor = {
  userId: string;
  startup: typeof startups.$inferSelect;
};

/**
 * Resolves the authenticated startup and its owned profile. Returns null for
 * anonymous users, investors, admins and startups without a saved profile, so
 * every caller can answer 401/403 without trusting client input.
 */
export async function getStartupActor(): Promise<StartupActor | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const role = (session.user as { role?: string }).role;
  if (role !== "startup") return null;

  const [startup] = await db
    .select()
    .from(startups)
    .where(eq(startups.userId, userId))
    .limit(1);

  if (!startup) return null;
  return { userId, startup };
}
