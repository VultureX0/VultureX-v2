import { NextResponse } from "next/server";
import { auth } from "@/features/auth";
import { getOwnedStartup } from "./index";

/**
 * Resolves the authenticated founder and their startup. Route handlers return
 * `context.error` directly, so ownership is checked before any write.
 */
export async function roadmapRequestContext() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  const startup = await getOwnedStartup(session.user.id);
  if (!startup) {
    return {
      error: NextResponse.json(
        { error: "A startup profile is required for the founder roadmap" },
        { status: 404 }
      ),
    } as const;
  }

  return { userId: session.user.id, startup } as const;
}
