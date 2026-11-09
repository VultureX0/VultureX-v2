import { NextResponse } from "next/server";
import {
  errorPayload,
  getInterestStatus,
  getInterestStatuses,
  getRequestsOverview,
  getSessionUser,
  sendRequest,
} from "@/features/connections";

// GET /api/connections            -> incoming/sent requests + connections
// GET /api/connections?userId=... -> Interest+ state for one member
// GET /api/connections?ids=a,b    -> bulk state for cards
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("userId");
  const ids = searchParams.get("ids");

  try {
    if (targetId) {
      const status = await getInterestStatus(user.id, targetId);
      return NextResponse.json(status, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    if (ids) {
      const targets = ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 50);
      const statuses = await getInterestStatuses(user.id, targets);
      return NextResponse.json(
        { statuses },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const overview = await getRequestsOverview(user.id);
    return NextResponse.json(overview, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/connections { userId, message? } -> send an Interest+ request
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetId = typeof body.userId === "string" ? body.userId : "";
    const message = typeof body.message === "string" ? body.message : null;
    const created = await sendRequest(user.id, targetId, message);
    return NextResponse.json(
      { request: created, status: "pending_sent" },
      { status: 201 }
    );
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}
