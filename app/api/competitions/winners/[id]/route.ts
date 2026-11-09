import { NextResponse } from "next/server";
import {
  competitionErrorPayload,
  getCompetitionActor,
  removeWinner,
} from "@/features/competitions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCompetitionActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const result = await removeWinner(actor, id);
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
