import { NextResponse } from "next/server";
import {
  errorPayload,
  getSessionUser,
  getThread,
  sendMessage,
} from "@/features/connections";

// GET /api/messages/:conversationId -> thread (participants only)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const thread = await getThread(user.id, id);
    return NextResponse.json(thread, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/messages/:conversationId { body } -> send a text message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payload = await request.json().catch(() => ({}));
    const body = typeof payload?.body === "string" ? payload.body : "";
    const message = await sendMessage(user.id, id, body);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}
