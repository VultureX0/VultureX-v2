import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { interests, investors, startups, users } from "@/db/schema";
import { sendInterestNotification } from "@/features/notifications";

// GET: Fetch interests (investor sees sent, startup sees received)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;

  if (role === "investor") {
    const [investor] = await db.select().from(investors).where(eq(investors.userId, session.user.id)).limit(1);
    if (!investor) return NextResponse.json({ interests: [] });

    const sent = await db.select({
      id: interests.id,
      startupId: interests.startupId,
      startupName: startups.name,
      startupSlug: startups.slug,
      startupSector: startups.sector,
      message: interests.message,
      status: interests.status,
      createdAt: interests.createdAt,
    })
      .from(interests)
      .leftJoin(startups, eq(startups.id, interests.startupId))
      .where(eq(interests.investorId, investor.id))
      .orderBy(desc(interests.createdAt));

    return NextResponse.json({ interests: sent });
  }

  if (role === "startup") {
    const [startup] = await db.select().from(startups).where(eq(startups.userId, session.user.id)).limit(1);
    if (!startup) return NextResponse.json({ interests: [] });

    const received = await db.select({
      id: interests.id,
      investorName: investors.fullName,
      investorFirm: investors.firmName,
      investorType: investors.investorType,
      investorLinkedin: investors.linkedin,
      message: interests.message,
      status: interests.status,
      createdAt: interests.createdAt,
    })
      .from(interests)
      .leftJoin(investors, eq(investors.id, interests.investorId))
      .where(eq(interests.startupId, startup.id))
      .orderBy(desc(interests.createdAt));

    return NextResponse.json({ interests: received });
  }

  return NextResponse.json({ interests: [] });
}

// POST: Express interest (investor → startup)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { startupId, message } = await request.json();
  if (!startupId) {
    return NextResponse.json({ error: "startupId required" }, { status: 400 });
  }

  const [investor] = await db.select().from(investors).where(eq(investors.userId, session.user.id)).limit(1);
  if (!investor) return NextResponse.json({ error: "Investor profile not found" }, { status: 404 });

  const [startup] = await db.select().from(startups).where(eq(startups.id, startupId)).limit(1);
  if (!startup) return NextResponse.json({ error: "Startup not found" }, { status: 404 });

  try {
    await db.insert(interests).values({ investorId: investor.id, startupId, message: message || null });
  } catch {
    return NextResponse.json({ message: "Interest already expressed" });
  }

  // Email notification
  if (startup.userId) {
    const [founder] = await db.select().from(users).where(eq(users.id, startup.userId)).limit(1);
    if (founder?.email) {
      await sendInterestNotification({
        toEmail: founder.email, startupName: startup.name,
        investorName: investor.fullName, investorFirm: investor.firmName, message,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ success: true });
}

// PATCH: Accept or decline interest (startup action)
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interestId, status } = await request.json();
  if (!interestId || !["accepted", "declined"].includes(status)) {
    return NextResponse.json({ error: "interestId and status (accepted/declined) required" }, { status: 400 });
  }

  // Verify this interest belongs to the user's startup
  const [startup] = await db.select().from(startups).where(eq(startups.userId, session.user.id)).limit(1);
  if (!startup) return NextResponse.json({ error: "Startup not found" }, { status: 404 });

  const [interest] = await db.select().from(interests)
    .where(and(eq(interests.id, interestId), eq(interests.startupId, startup.id))).limit(1);
  if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });

  const [updated] = await db.update(interests).set({ status }).where(eq(interests.id, interestId)).returning();
  return NextResponse.json({ interest: updated });
}
