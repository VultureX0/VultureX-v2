import { NextResponse } from "next/server";
import {
  competitionErrorPayload,
  getCompetitionActor,
  proposeWinner,
} from "@/features/competitions";

// POST /api/competitions/[id]/winners
//   { applicationId, placement, awardLabel?, prizeNote? }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getCompetitionActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const result = await proposeWinner(
      actor,
      id,
      String(body.applicationId ?? ""),
      Number(body.placement ?? 1),
      typeof body.awardLabel === "string" ? body.awardLabel : null,
      typeof body.prizeNote === "string" ? body.prizeNote : null
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
