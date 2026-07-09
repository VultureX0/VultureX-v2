import { db } from "@/db";
import { decks, startups } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { DecksClient } from "./decks-client";

export default async function DecksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [startup] = await db.select().from(startups).where(eq(startups.userId, session.user.id)).limit(1);

  if (!startup) {
    return <DecksClient decks={[]} noProfile />;
  }

  const userDecks = await db.select().from(decks).where(eq(decks.startupId, startup.id)).orderBy(desc(decks.createdAt));

  const mapped = userDecks.map(d => ({
    id: d.id,
    title: d.title,
    shareToken: d.shareToken,
    slideCount: (d.slides as unknown[])?.length || 0,
    createdAt: d.createdAt?.toISOString() || "",
  }));

  return <DecksClient decks={mapped} />;
}
