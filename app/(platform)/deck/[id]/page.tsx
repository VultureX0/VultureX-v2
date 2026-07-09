import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { auth } from "@/features/auth";
import { DeckEditor } from "@/components/deck/DeckEditor";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeckEditPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [deck] = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  if (!deck) notFound();

  const slides = deck.slides as {
    type: string;
    headline: string;
    body: string;
    bullets?: string[];
    metric?: { value: string; label: string };
  }[];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{deck.title}</h1>
        <Link
          href={`/deck/view/${deck.shareToken}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Share Link <ExternalLink size={14} />
        </Link>
      </div>

      <DeckEditor deckId={deck.id} initialSlides={slides} />
    </div>
  );
}
