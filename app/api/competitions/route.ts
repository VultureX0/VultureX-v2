import { NextResponse } from "next/server";
import {
  competitionErrorPayload,
  createCompetitionDraft,
  getCompetitionActor,
  getDiscovery,
} from "@/features/competitions";

// GET /api/competitions -> published competitions (active, upcoming, winners)
export async function GET() {
  try {
    const data = await getDiscovery();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/competitions -> create an investor draft
export async function POST(request: Request) {
  const actor = await getCompetitionActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json().catch(() => ({}));
    const draft = await createCompetitionDraft(actor, payload);
    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    const { status, body } = competitionErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
