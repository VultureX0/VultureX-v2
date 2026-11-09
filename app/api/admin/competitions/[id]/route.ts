import { NextResponse } from "next/server";
import {
  adminAdvanceCompetition,
  adminReviewCompetition,
  competitionErrorPayload,
  publishCompetition,
  requireAdmin,
} from "@/features/competitions";

// PATCH /api/admin/competitions/[id]
//   { action: "approve" | "reject" | "request_changes", note? }
//   { action: "publish" }
//   { action: "start_evaluation" | "complete" }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }

  const { id } = await params;
  try {
    const payload = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const note = typeof payload.note === "string" ? payload.note : null;

    switch (payload.action) {
      case "approve":
      case "reject":
      case "request_changes":
        return NextResponse.json(
          await adminReviewCompetition(
            actor,
            id,
            payload.action,
            note
          )
        );
      case "publish":
        return NextResponse.json(await publishCompetition(actor, id));
      case "start_evaluation":
      case "complete":
        return NextResponse.json(
          await adminAdvanceCompetition(actor, id, payload.action)
        );
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
