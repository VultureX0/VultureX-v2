import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckFiles } from "@/db/schema";
import {
  buildDeckSummary,
  getActor,
  loadRequestForActor,
  type Answers,
  type DeckSummary,
} from "@/features/pitch-deck";
import { SummaryEditor } from "@/components/pitch-deck/SummaryEditor";

export const metadata = { title: "Pitch Deck Summary" };

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const { id } = await params;

  const found = await loadRequestForActor(id, actor);
  if (!found || actor.role !== "startup") notFound();
  const { request, startup } = found;

  // The summary only exists after the questionnaire is submitted.
  if (request.status === "incomplete") {
    redirect(`/pitch-decks/${request.id}/questionnaire`);
  }

  const [screenshot] = await db
    .select({ id: pitchDeckFiles.id })
    .from(pitchDeckFiles)
    .where(eq(pitchDeckFiles.requestId, request.id))
    .limit(1);

  // Self-healing: if a summary was never stored, build it from profile + answers.
  const summary =
    (request.summary as DeckSummary | null) ??
    buildDeckSummary({
      startup,
      answers: (request.answers ?? {}) as Answers,
      screenshotFileId: screenshot?.id ?? null,
    });

  return (
    <SummaryEditor
      requestId={request.id}
      requestTitle={request.title}
      startupName={startup.name}
      initialSummary={summary}
      approvedSummary={(request.approvedSummary as DeckSummary | null) ?? null}
      status={request.status}
      changedSinceApproval={request.summaryChangedSinceApproval}
      approvedAt={request.approvedAt ? request.approvedAt.toISOString() : null}
    />
  );
}
