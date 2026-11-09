import { notFound, redirect } from "next/navigation";
import { getActor, loadRequestForActor, type Answers } from "@/features/pitch-deck";
import { QuestionnaireForm } from "@/components/pitch-deck/QuestionnaireForm";

export const metadata = { title: "Pitch Deck Questionnaire" };

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const { id } = await params;

  const found = await loadRequestForActor(id, actor);
  if (!found || actor.role !== "startup") notFound();
  const { request } = found;

  // Submitted questionnaires are read-only; the summary is where corrections happen.
  const readOnlyStatus = request.status === "incomplete" ? "incomplete" : request.status;

  return (
    <QuestionnaireForm
      requestId={request.id}
      initialAnswers={(request.answers ?? {}) as Answers}
      initialBatch={request.currentBatch}
      status={readOnlyStatus}
    />
  );
}
