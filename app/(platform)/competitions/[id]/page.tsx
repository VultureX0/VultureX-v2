import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { competitions, competitionEntries, startups, decks } from "@/db/schema";
import { auth } from "@/features/auth";
import { Trophy, Clock, Users } from "lucide-react";
import { ScoreBadge } from "@/components/startup/ScoreBadge";
import { EnterCompetitionButton } from "@/components/competition/EnterButton";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;

  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id))
    .limit(1);

  if (!competition) notFound();

  // Get entries with startup data
  const entries = await db
    .select({
      entry: competitionEntries,
      startup: startups,
      deck: decks,
    })
    .from(competitionEntries)
    .innerJoin(startups, eq(startups.id, competitionEntries.startupId))
    .leftJoin(decks, eq(decks.id, competitionEntries.deckId))
    .where(eq(competitionEntries.competitionId, id))
    .orderBy(desc(startups.score));

  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = session?.user?.id;

  // Check if user's startup is already entered
  let userStartup = null;
  let alreadyEntered = false;
  if (role === "startup" && userId) {
    const [s] = await db
      .select()
      .from(startups)
      .where(eq(startups.userId, userId))
      .limit(1);
    userStartup = s || null;
    if (userStartup) {
      alreadyEntered = entries.some((e) => e.startup.id === userStartup!.id);
    }
  }

  const deadline = new Date(competition.deadline);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isActive = competition.status === "active" && daysLeft > 0;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-[var(--amber)]" />
          <h1 className="text-xl font-semibold">{competition.title}</h1>
        </div>
        {competition.description && (
          <p className="text-xs text-[var(--text-muted)] mb-4">{competition.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--text-muted)]">
          {competition.prize && (
            <span className="px-3 py-1 font-semibold bg-[var(--amber-muted)] text-[var(--amber)] rounded-full">
              Prize: {competition.prize}
            </span>
          )}
          {competition.sector && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-xs font-medium">
              {competition.sector}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} /> {entries.length} entries
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {isActive ? `${daysLeft} days left` : "Completed"}
          </span>
        </div>
      </div>

      {/* Enter button */}
      {isActive && role === "startup" && userStartup && !alreadyEntered && (
        <div className="mb-8">
          <EnterCompetitionButton
            competitionId={competition.id}
            startupId={userStartup.id}
          />
        </div>
      )}
      {alreadyEntered && (
        <div className="mb-8 px-4 py-3 bg-[var(--green-muted)] text-[var(--green)] text-sm font-medium rounded-md">
          You&apos;re in this competition! Your live VultureScore determines your rank.
        </div>
      )}

      {/* Leaderboard */}
      <h2 className="text-lg font-semibold mb-4">Leaderboard</h2>
      {entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          No entries yet. Be the first to enter!
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(({ startup: s, deck: d }, i) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
            >
              {/* Rank */}
              <div className="w-8 text-center">
                <span className={`text-lg font-bold ${i < 3 ? "text-[var(--amber)]" : "text-[var(--text-muted)]"}`}>
                  #{i + 1}
                </span>
              </div>

              {/* Logo */}
              <div className="w-10 h-10 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-lg font-bold shrink-0">
                {s.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/explore/${s.slug}`} className="font-semibold hover:text-[var(--accent)]">
                  {s.name}
                </Link>
                <p className="text-xs text-[var(--text-muted)]">
                  {s.stage} • {s.location || "Remote"}
                </p>
              </div>

              {/* Deck link */}
              {d?.shareToken && (
                <Link
                  href={`/deck/view/${d.shareToken}`}
                  className="text-xs text-[var(--accent)] hover:underline hidden sm:block"
                >
                  View Deck
                </Link>
              )}

              {/* Score */}
              <ScoreBadge score={parseFloat(s.score || "0")} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
