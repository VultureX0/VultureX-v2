import { eq } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { investors, startups, users } from "@/db/schema";
import { CompetitionError } from "./errors";

export type Role = "startup" | "investor" | "admin";

export type CompetitionActor = {
  userId: string;
  role: Role;
  email: string | null;
  name: string | null;
  /** Populated for startup accounts with a profile. */
  startupId: string | null;
  startup: typeof startups.$inferSelect | null;
  /** Populated for investor accounts with a profile. */
  investorId: string | null;
  investor: typeof investors.$inferSelect | null;
};

/**
 * Resolves the signed-in user's role and profile links from the database.
 * Role claims in the session are only a hint — the authoritative role is read
 * from `users.role`, which is what every authorization check below uses.
 */
export async function getCompetitionActor(): Promise<CompetitionActor | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [row] = await db
    .select({
      role: users.role,
      email: users.email,
      name: users.name,
      startup: startups,
      investor: investors,
    })
    .from(users)
    .leftJoin(startups, eq(startups.userId, users.id))
    .leftJoin(investors, eq(investors.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row) return null;

  return {
    userId: session.user.id,
    role: row.role,
    email: row.email,
    name: row.name,
    startupId: row.startup?.id ?? null,
    startup: row.startup ?? null,
    investorId: row.investor?.id ?? null,
    investor: row.investor ?? null,
  };
}

export async function requireActor(): Promise<CompetitionActor> {
  const actor = await getCompetitionActor();
  if (!actor) {
    throw new CompetitionError("Sign in to continue.", 401, "UNAUTHORIZED");
  }
  return actor;
}

export async function requireInvestor(): Promise<
  CompetitionActor & { investorId: string }
> {
  const actor = await requireActor();
  if (actor.role !== "investor") {
    throw new CompetitionError(
      "Only investor accounts can host competitions.",
      403,
      "ROLE_NOT_ALLOWED"
    );
  }
  if (!actor.investorId) {
    throw new CompetitionError(
      "Complete your investor profile before hosting a competition.",
      409,
      "PROFILE_REQUIRED"
    );
  }
  return actor as CompetitionActor & { investorId: string };
}

export async function requireAdmin(): Promise<CompetitionActor> {
  const actor = await requireActor();
  if (actor.role !== "admin") {
    throw new CompetitionError(
      "Admin access is required for this action.",
      403,
      "ADMIN_ONLY"
    );
  }
  return actor;
}

export async function requireStartup(): Promise<
  CompetitionActor & { startupId: string }
> {
  const actor = await requireActor();
  if (actor.role !== "startup") {
    throw new CompetitionError(
      "Only startup accounts can apply to competitions.",
      403,
      "ROLE_NOT_ALLOWED"
    );
  }
  if (!actor.startupId) {
    throw new CompetitionError(
      "Create your startup profile before applying.",
      409,
      "PROFILE_REQUIRED"
    );
  }
  return actor as CompetitionActor & { startupId: string };
}
