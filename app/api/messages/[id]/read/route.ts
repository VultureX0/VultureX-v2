import { NextResponse } from "next/server";
import {
  errorPayload,
  getSessionUser,
  markConversationRead,
} from "@/features/connections";

// POST /api/messages/:conversationId/read -> move the read cursor
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await markConversationRead(user.id, id);
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}
