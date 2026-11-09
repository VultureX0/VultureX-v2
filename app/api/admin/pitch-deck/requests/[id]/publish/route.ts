import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckEvents, pitchDeckFiles, pitchDeckRequests } from "@/db/schema";
import { requireAdmin } from "@/features/pitch-deck";
import { isUuid } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * POST — the single, explicit publication action.
 * Requires a `fileId` chosen by the admin, so an upload alone never publishes.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { fileId?: string };
  if (!isUuid(body.fileId)) {
    return NextResponse.json({ error: "Choose an uploaded deck file to publish." }, { status: 400 });
  }

  const [record] = await db
    .select()
    .from(pitchDeckRequests)
    .where(eq(pitchDeckRequests.id, id))
    .limit(1);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only an approved summary may be turned into a published deck.
  if (!record.approvedSummary && record.status !== "in_progress" && record.status !== "completed") {
    return NextResponse.json(
      { error: "This request has not been approved by the founder yet." },
      { status: 409 },
    );
  }

  const [file] = await db
    .select()
    .from(pitchDeckFiles)
    .where(
      and(
        eq(pitchDeckFiles.id, body.fileId),
        eq(pitchDeckFiles.requestId, record.id),
        eq(pitchDeckFiles.kind, "deck"),
      ),
    )
    .limit(1);

  if (!file) {
    return NextResponse.json(
      { error: "Choose an uploaded deck file to publish." },
      { status: 400 },
    );
  }

  const now = new Date();

  // Exactly one published deck per request.
  await db
    .update(pitchDeckFiles)
    .set({ isPublished: false })
    .where(and(eq(pitchDeckFiles.requestId, record.id), eq(pitchDeckFiles.kind, "deck")));

  await db
    .update(pitchDeckFiles)
    .set({ isPublished: true, publishedAt: now })
    .where(eq(pitchDeckFiles.id, file.id));

  const [updated] = await db
    .update(pitchDeckRequests)
    .set({ status: "completed", publishedAt: now, updatedAt: now })
    .where(eq(pitchDeckRequests.id, record.id))
    .returning();

  await db.insert(pitchDeckEvents).values({
    requestId: record.id,
    actorId: admin.userId,
    actorRole: "admin",
    type: "published",
    message: `Published ${file.fileName} — now visible to the startup`,
  });

  return NextResponse.json({ request: updated, fileId: file.id });
}
