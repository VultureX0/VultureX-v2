import { NextResponse } from "next/server";
import {
  applyToCompetition,
  competitionErrorPayload,
  getCompetitionActor,
} from "@/features/competitions";

// POST /api/competitions/[id]/apply { coverNote? }
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
    const body = (await request.json().catch(() => ({}))) as {
      coverNote?: unknown;
    };
    const result = await applyToCompetition(
      actor,
      id,
      typeof body.coverNote === "string" ? body.coverNote : null
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
