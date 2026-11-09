import { NextResponse } from "next/server";
import {
  errorPayload,
  getSessionUser,
  getUnreadSummary,
  listConversations,
} from "@/features/connections";

// GET /api/messages -> conversations sorted by activity + unread summary
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [conversations, unread] = await Promise.all([
      listConversations(user.id),
      getUnreadSummary(user.id),
    ]);
    return NextResponse.json(
      { conversations, unread },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}
