import { NextResponse } from "next/server";
import {
  competitionErrorPayload,
  evaluateApplication,
  getCompetitionActor,
  setApplicationStatus,
  withdrawApplication,
} from "@/features/competitions";

// PATCH /api/competitions/applications/[id]
//   { action: "withdraw" }                        -> startup
//   { action: "evaluate", scores, notes }         -> hosting investor
//   { action: "status", status }                  -> hosting investor
export async function PATCH(
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

    switch (body.action) {
      case "withdraw": {
        const result = await withdrawApplication(actor, id);
        return NextResponse.json(result);
      }
      case "evaluate": {
        const result = await evaluateApplication(
          actor,
          id,
          body.scores,
          typeof body.notes === "string" ? body.notes : null
        );
        return NextResponse.json(result);
      }
      case "status": {
        const result = await setApplicationStatus(
          actor,
          id,
          String(body.status ?? "")
        );
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json(
          { error: "Unknown action.", code: "INVALID_ACTION" },
          { status: 400 }
        );
    }
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
