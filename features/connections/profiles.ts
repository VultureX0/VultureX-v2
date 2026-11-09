import { inArray, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, startups, investors } from "@/db/schema";

// Public-facing identity of a platform user, used by request cards, the
// notification bell and the conversation list. All values come from the
// database — never from the client — so a sender cannot spoof who they are.
export type ProfileSummary = {
  userId: string;
  role: "startup" | "investor" | "admin";
  name: string;
  subtitle: string | null;
  avatarUrl: string | null;
  href: string | null;
  initials: string;
};

const UUID_LIKE = /^[0-9a-f-]{36}$/i;

export function pairKeyFor(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function normalizePair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Resolve display identities for a set of user ids in a single query.
 * Startup accounts are represented by their company, investors by their
 * personal profile — the same conventions the rest of the dashboard uses.
 */
export async function getProfiles(
  userIds: string[]
): Promise<Map<string, ProfileSummary>> {
  const ids = [...new Set(userIds)].filter((id) => UUID_LIKE.test(id));
  const result = new Map<string, ProfileSummary>();
  if (ids.length === 0) return result;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      startupName: startups.name,
      startupSlug: startups.slug,
      startupSector: startups.sector,
      startupStage: startups.stage,
      startupLogo: startups.logoUrl,
      investorName: investors.fullName,
      investorFirm: investors.firmName,
      investorType: investors.investorType,
    })
    .from(users)
    .leftJoin(startups, eq(startups.userId, users.id))
    .leftJoin(investors, eq(investors.userId, users.id))
    .where(inArray(users.id, ids));

  for (const row of rows) {
    const isStartup = row.role === "startup" && !!row.startupName;
    const isInvestor = row.role === "investor" && !!row.investorName;
    const name = isStartup
      ? row.startupName!
      : isInvestor
        ? row.investorName!
        : row.name || row.email.split("@")[0];

    result.set(row.id, {
      userId: row.id,
      role: row.role,
      name,
      subtitle: isStartup
        ? [row.startupSector, row.startupStage].filter(Boolean).join(" · ")
        : isInvestor
          ? row.investorFirm || formatInvestorType(row.investorType)
          : null,
      avatarUrl: isStartup ? row.startupLogo : row.avatarUrl,
      href: isStartup
        ? `/explore/${row.startupSlug}`
        : isInvestor
          ? `/investors/${row.id}`
          : null,
      initials: name.charAt(0).toUpperCase(),
    });
  }

  return result;
}

export async function getProfile(userId: string): Promise<ProfileSummary | null> {
  const map = await getProfiles([userId]);
  return map.get(userId) ?? null;
}

export function formatInvestorType(type: string | null | undefined): string {
  switch (type) {
    case "vc":
      return "Venture Capital";
    case "angel":
      return "Angel Investor";
    case "family_office":
      return "Family Office";
    case "corporate_vc":
      return "Corporate VC";
    default:
      return "Investor";
  }
}
