import { NextResponse } from "next/server";
import { db } from "@/db";
import { profileViews, deckViews } from "@/db/schema";
import { auth } from "@/features/auth";

// Records a profile or deck view, optionally linking the authenticated viewer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, startupId, deckId } = body;

    if (!type || (type !== "profile" && type !== "deck")) {
      return NextResponse.json(
        { error: "type must be 'profile' or 'deck'" },
        { status: 400 }
      );
    }

    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    if (type === "profile") {
      if (!startupId) {
        return NextResponse.json(
          { error: "startupId is required for profile views" },
          { status: 400 }
        );
      }

      await db.insert(profileViews).values({
        startupId,
        viewerId,
      });

      return NextResponse.json({ tracked: true, type: "profile" });
    }

    if (type === "deck") {
      if (!deckId) {
        return NextResponse.json(
          { error: "deckId is required for deck views" },
          { status: 400 }
        );
      }

      await db.insert(deckViews).values({
        deckId,
        viewerEmail: session?.user?.email ?? null,
      });

      return NextResponse.json({ tracked: true, type: "deck" });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Failed to track view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
