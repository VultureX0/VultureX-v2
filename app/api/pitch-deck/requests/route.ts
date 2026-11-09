import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckEvents, pitchDeckRequests } from "@/db/schema";
import { requireStartup, defaultAnswers } from "@/features/pitch-deck";
import { isUuid } from "@/lib/utils";

/**
 * GET  — the authenticated startup's own pitch deck requests.
 * POST — creates a NEW request or a REVISION, and refuses to create duplicates.
 */
export async function GET() {
  const ctx = await requireStartup();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(pitchDeckRequests)
    .where(eq(pitchDeckRequests.startupId, ctx.startup.id))
    .orderBy(desc(pitchDeckRequests.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const ctx = await requireStartup();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { kind?: "new" | "revision"; previousRequestId?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const kind = body.kind === "revision" ? "revision" : "new";
  // Normalise the client-supplied target: anything that is not a real uuid is
  // treated as absent, so it can never reach a uuid column and throw 22P02.
  const previousRequestId = isUuid(body.previousRequestId) ? body.previousRequestId : null;
  const { startup, actor } = ctx;

  // --- Duplicate protection -------------------------------------------------
  // An unfinished draft of the same kind is resumed instead of duplicated.
  const [openDraft] = await db
    .select()
    .from(pitchDeckRequests)
    .where(
      and(
        eq(pitchDeckRequests.startupId, startup.id),
        eq(pitchDeckRequests.status, "incomplete"),
        eq(pitchDeckRequests.kind, kind),
        kind === "revision" && previousRequestId
          ? eq(pitchDeckRequests.previousRequestId, previousRequestId)
          : isNull(pitchDeckRequests.previousRequestId),
      ),
    )
    .orderBy(desc(pitchDeckRequests.createdAt))
    .limit(1);

  if (openDraft) {
    return NextResponse.json({ request: openDraft, resumed: true });
  }

  // --- Validate a revision target ------------------------------------------
  let version = 1;
  if (kind === "revision") {
    if (!previousRequestId) {
      return NextResponse.json(
        { error: "A revision needs the request it improves." },
        { status: 400 },
      );
    }
    const [previous] = await db
      .select()
      .from(pitchDeckRequests)
      .where(
        and(
          eq(pitchDeckRequests.id, previousRequestId),
          eq(pitchDeckRequests.startupId, startup.id),
        ),
      )
      .limit(1);

    if (!previous) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    if (previous.status !== "completed") {
      return NextResponse.json(
        { error: "You can only improve a deck that has already been published." },
        { status: 409 },
      );
    }
    version = previous.version + 1;
  }

  const answers = {
    ...defaultAnswers(),
    Q12: actor.email ?? "",
  };

  const [created] = await db
    .insert(pitchDeckRequests)
    .values({
      startupId: startup.id,
      userId: actor.userId,
      title: kind === "revision" ? `${startup.name} Pitch Deck v${version}` : `${startup.name} Pitch Deck`,
      kind,
      previousRequestId: kind === "revision" ? previousRequestId : null,
      version,
      answers,
    })
    .returning();

  await db.insert(pitchDeckEvents).values({
    requestId: created.id,
    actorId: actor.userId,
    actorRole: "startup",
    type: "created",
    message: kind === "revision" ? `Revision v${version} started` : "Pitch deck request started",
  });

  return NextResponse.json({ request: created, resumed: false }, { status: 201 });
}
