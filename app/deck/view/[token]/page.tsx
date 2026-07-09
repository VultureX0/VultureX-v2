import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { decks, startups, deckViews } from "@/db/schema";
import { SlideCard } from "@/components/deck/SlideCard";
import Link from "next/link";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function PublicDeckPage({ params }: Props) {
  const { token } = await params;

  const [deck] = await db
    .select()
    .from(decks)
    .where(eq(decks.shareToken, token))
    .limit(1);

  if (!deck) notFound();

  // Get startup info
  const [startup] = await db
    .select()
    .from(startups)
    .where(eq(startups.id, deck.startupId))
    .limit(1);

  // Track view
  await db.insert(deckViews).values({
    deckId: deck.id,
    viewerEmail: null,
  });

  const slides = deck.slides as {
    type: string;
    headline: string;
    body: string;
    bullets?: string[];
    metric?: { value: string; label: string };
  }[];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold">{deck.title}</h1>
            {startup && (
              <p className="text-xs text-[var(--text-secondary)]">
                by {startup.name} • {startup.sector} • {startup.stage}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            Made with Vulture<span className="text-[var(--accent)]">X</span>
          </Link>
        </div>
      </header>

      {/* Slides */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {slides.map((slide, i) => (
          <div key={i}>
            <SlideCard slide={slide} />
          </div>
        ))}
      </main>

      {/* CTA */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[var(--text-secondary)] mb-3">
            Want to generate a pitch deck like this for your startup?
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Get Started on VultureX
          </Link>
        </div>
      </footer>
    </div>
  );
}
