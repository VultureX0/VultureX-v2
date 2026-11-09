import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckFiles, startups } from "@/db/schema";
import { canReadFile, getActor, safeFileName } from "@/features/pitch-deck";
import { isUuid } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Streams a private pitch deck file (deck or screenshot).
 *
 * There is no public URL for stored files. Access rules:
 *   - admins: everything
 *   - owning startup: its own screenshots, and decks only after publication
 *   - everyone else: 403 (so changing a URL/id can never leak another startup's deck)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [file] = await db
    .select()
    .from(pitchDeckFiles)
    .where(eq(pitchDeckFiles.id, id))
    .limit(1);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [owner] = await db
    .select({ userId: startups.userId })
    .from(startups)
    .where(eq(startups.id, file.startupId))
    .limit(1);

  if (!owner?.userId || !canReadFile(file, actor, owner.userId)) {
    // Deliberately identical to "not found" so ids cannot be probed.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const fileName = safeFileName(file.fileName);

  return new Response(new Uint8Array(file.content), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Length": String(file.sizeBytes),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      // Private: personalised, must never be cached by a shared proxy.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
