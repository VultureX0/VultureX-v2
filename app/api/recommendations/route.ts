import { NextResponse } from "next/server";
import {
  getStartupActor,
} from "@/features/matchmaking/access";
import {
  getRecommendationsForStartup,
  matchErrorPayload,
  setRecommendationState,
  type RecommendationStateAction,
  type RecommendationView,
} from "@/features/matchmaking";
import type { MatchStrength } from "@/features/matchmaking/types";

const VIEWS: RecommendationView[] = ["all", "saved", "dismissed"];
const STRENGTHS: MatchStrength[] = ["high", "good", "possible"];
const ACTIONS: RecommendationStateAction[] = ["dismiss", "restore", "save", "unsave"];

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

// GET /api/recommendations?view=&strength=&type=&sector=&page=&limit=
export async function GET(request: Request) {
  const actor = await getStartupActor();
  if (!actor) {
    return NextResponse.json(
      { error: "Only startup accounts can discover business connections." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const viewParam = searchParams.get("view") as RecommendationView | null;
  const strengthParam = searchParams.get("strength") as MatchStrength | null;

  const data = await getRecommendationsForStartup(actor.startup.id, {
    view: viewParam && VIEWS.includes(viewParam) ? viewParam : "all",
    strength:
      strengthParam && STRENGTHS.includes(strengthParam) ? strengthParam : "all",
    relationshipType: searchParams.get("type") ?? "all",
    sector: searchParams.get("sector") ?? "all",
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "12") || 12,
  });

  return NextResponse.json(data, { headers: PRIVATE_HEADERS });
}

// POST /api/recommendations { targetStartupId, action }
// Only dismiss/save state can be written from the client. Recommendations
// themselves are created exclusively by the server-side engine.
export async function POST(request: Request) {
  const actor = await getStartupActor();
  if (!actor) {
    return NextResponse.json(
      { error: "Only startup accounts can manage recommendations." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetStartupId =
      typeof body.targetStartupId === "string" ? body.targetStartupId : "";
    const action = body.action as RecommendationStateAction;

    if (!ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "Unknown recommendation action.", code: "INVALID_ACTION" },
        { status: 400 }
      );
    }

    const state = await setRecommendationState(
      actor.startup.id,
      targetStartupId,
      action
    );
    return NextResponse.json({ ok: true, state }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const { status, body } = matchErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
