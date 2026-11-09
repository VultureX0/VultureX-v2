import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { investors, users } from "@/db/schema";
import { auth } from "@/features/auth";
import { getInterestStatuses } from "@/features/connections";
import { InvestorsClient } from "./investors-client";

export const metadata = { title: "Investors" };

export default async function InvestorsPage() {
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const viewerRole = (session?.user as { role?: string } | undefined)?.role;
  const canSendInterest = viewerRole === "startup";

  const rows = await db
    .select({
      userId: investors.userId,
      fullName: investors.fullName,
      investorType: investors.investorType,
      firmName: investors.firmName,
      location: investors.location,
      checkSizeMin: investors.checkSizeMin,
      checkSizeMax: investors.checkSizeMax,
      stageFocus: investors.stageFocus,
      sectorFocus: investors.sectorFocus,
      investmentThesis: investors.investmentThesis,
      linkedin: investors.linkedin,
      avatarUrl: users.avatarUrl,
    })
    .from(investors)
    .innerJoin(users, eq(users.id, investors.userId))
    .orderBy(asc(investors.fullName))
    .limit(100);

  const list = rows
    .filter((row): row is typeof row & { userId: string } => !!row.userId)
    .map((row) => ({
      userId: row.userId,
      fullName: row.fullName,
      investorType: row.investorType,
      firmName: row.firmName,
      location: row.location,
      checkSizeMin: row.checkSizeMin ?? 0,
      checkSizeMax: row.checkSizeMax ?? 0,
      stageFocus: row.stageFocus ?? [],
      sectorFocus: row.sectorFocus ?? [],
      investmentThesis: row.investmentThesis,
      avatarUrl: row.avatarUrl,
    }));

  const statuses =
    viewerId && canSendInterest
      ? await getInterestStatuses(
          viewerId,
          list.map((investor) => investor.userId)
        )
      : {};

  return (
    <InvestorsClient
      investors={list}
      statuses={statuses}
      viewerId={viewerId}
      canSendInterest={canSendInterest}
    />
  );
}
