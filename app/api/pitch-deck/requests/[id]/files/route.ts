import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckFiles, pitchDeckRequests } from "@/db/schema";
import {
  buildDeckSummary,
  getActor,
  loadRequestForActor,
  validateScreenshot,
  type DeckSummary,
} from "@/features/pitch-deck";

export const runtime = "nodejs";

/**
 * POST — the owning startup uploads the optional Q7 product screenshot.
 * Stored privately in Postgres; only the owner and admins can stream it.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const found = await loadRequestForActor(id, actor);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Attachments are founder-owned: admins may read but not write them.
  if (actor.role !== "startup" || found.request.userId !== actor.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (found.request.status === "completed") {
    return NextResponse.json(
      { error: "This request is already completed. Start a revision to change the files." },
      { status: 409 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const invalid = validateScreenshot({ name: file.name, type: file.type, size: file.size });
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // One screenshot per request — replace any previous upload.
  await db
    .delete(pitchDeckFiles)
    .where(
      and(
        eq(pitchDeckFiles.requestId, found.request.id),
        eq(pitchDeckFiles.kind, "product_screenshot"),
      ),
    );

  const [stored] = await db
    .insert(pitchDeckFiles)
    .values({
      requestId: found.request.id,
      startupId: found.request.startupId,
      kind: "product_screenshot",
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      content: buffer,
      uploadedBy: actor.userId,
    })
    .returning({ id: pitchDeckFiles.id });

  const answers = { ...(found.request.answers as Record<string, unknown>), Q7_SCREENSHOT: stored.id };
  const summary = buildDeckSummary({
    startup: found.startup,
    answers,
    screenshotFileId: stored.id,
    previousSummary: (found.request.summary as DeckSummary | null) ?? null,
  });

  await db
    .update(pitchDeckRequests)
    .set({ answers, summary, updatedAt: new Date() })
    .where(eq(pitchDeckRequests.id, found.request.id));

  return NextResponse.json({ fileId: stored.id, fileName: file.name });
}
