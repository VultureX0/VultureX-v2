import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, startups, investors, startupImpactClaims } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  effectiveImpactStatus,
  successFeeEligibility,
} from "@/features/sdg/verification";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;
  const role = (session.user as { role?: string }).role;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  let startup = null;
  let investor = null;
  let impact: {
    status: ReturnType<typeof effectiveImpactStatus>;
    reviewNote: string | null;
    submittedAt: string | null;
    successFee: ReturnType<typeof successFeeEligibility>;
  } | null = null;

  if (role === "startup") {
    const [s] = await db.select().from(startups).where(eq(startups.userId, userId)).limit(1);
    startup = s ?? null;

    if (s) {
      const [claim] = await db
        .select()
        .from(startupImpactClaims)
        .where(eq(startupImpactClaims.startupId, s.id))
        .limit(1);
      impact = {
        status: effectiveImpactStatus(s, claim),
        reviewNote: claim?.reviewNote ?? null,
        submittedAt: claim?.submittedAt?.toISOString() ?? null,
        successFee: successFeeEligibility(s, claim),
      };
    }
  } else if (role === "investor") {
    const [i] = await db.select().from(investors).where(eq(investors.userId, userId)).limit(1);
    investor = i ?? null;
  }

  return (
    <SettingsClient
      user={{ id: user.id, email: user.email, name: user.name, role: user.role }}
      startup={startup ? {
        name: startup.name, tagline: startup.tagline, sector: startup.sector, stage: startup.stage,
        location: startup.location, website: startup.website, founderName: startup.founderName,
        founderRole: startup.founderRole, founderBio: startup.founderBio, founderLinkedin: startup.founderLinkedin,
        tags: startup.tags,
        offerings: startup.offerings, needs: startup.needs, targetCustomers: startup.targetCustomers,
        sdgGoals: startup.sdgGoals ?? [], sdgPrimary: startup.sdgPrimary,
        impactDescription: startup.impactDescription,
      } : null}
      impact={impact}
      investor={investor ? {
        fullName: investor.fullName, firmName: investor.firmName, investorType: investor.investorType,
        location: investor.location, linkedin: investor.linkedin, sectorFocus: investor.sectorFocus,
        stageFocus: investor.stageFocus, investmentThesis: investor.investmentThesis,
        sdgPreferences: investor.sdgPreferences ?? [],
      } : null}
    />
  );
}
