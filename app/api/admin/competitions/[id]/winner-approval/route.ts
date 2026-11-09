import { NextResponse } from "next/server";
import {
  adminDecideWinnerAnnouncement,
  competitionErrorPayload,
  requireAdmin,
} from "@/features/competitions";

// PATCH /api/admin/competitions/[id]/winner-approval
//   { action: "approve" | "request_changes", note? }
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
    const action = payload.action;
    if (action !== "approve" && action !== "request_changes") {
      return NextResponse.json(
        { error: "Unknown action.", code: "INVALID_ACTION" },
        { status: 400 }
      );
    }
    const result = await adminDecideWinnerAnnouncement(
      actor,
      id,
      action,
      typeof payload.note === "string" ? payload.note : null
    );
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
