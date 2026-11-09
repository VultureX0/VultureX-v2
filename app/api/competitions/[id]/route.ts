import { NextResponse } from "next/server";
import {
  competitionErrorPayload,
  getCompetitionActor,
  getCompetitionDetail,
  updateCompetition,
} from "@/features/competitions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const actor = await getCompetitionActor();
    const detail = await getCompetitionDetail(id, actor);
    if (!detail) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(detail, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}

// PATCH /api/competitions/[id] -> save a draft, or submit it for review
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
    const payload = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const submit = payload.submit === true;
    const result = await updateCompetition(actor, id, payload, submit);
    if (result.problems.length > 0) {
      return NextResponse.json(
        {
          error: result.problems[0],
          problems: result.problems,
          code: "INCOMPLETE",
        },
        { status: 422 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
