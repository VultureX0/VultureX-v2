import { NextResponse } from "next/server";
import {
  errorPayload,
  getNotifications,
  getSessionUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/connections";
import { syncReminderNotifications } from "@/features/reminders";

// GET /api/notifications -> latest notifications + unread count
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate due/overdue reminder alerts before reading; the dedupe key makes
    // this safe to run on every poll.
    await syncReminderNotifications(user.id).catch((error) => {
      console.error("Failed to sync reminder notifications:", error);
    });
    const data = await getNotifications(user.id);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}

// PATCH /api/notifications { id } or { all: true }
export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.all === true) {
      await markAllNotificationsRead(user.id);
      return NextResponse.json({ ok: true });
    }
    if (typeof body?.id === "string") {
      await markNotificationRead(user.id, body.id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "Provide a notification id or all: true", code: "INVALID_BODY" },
      { status: 400 }
    );
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}
