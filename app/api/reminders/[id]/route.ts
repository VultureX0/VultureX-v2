import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/features/auth";
import {
  deleteReminder,
  normalizeReminderUpdateInput,
  ReminderError,
  syncReminderNotifications,
  updateReminder,
} from "@/features/reminders";
import { isUuid } from "@/lib/utils";

export const dynamic = "force-dynamic";

function revalidateReminderViews() {
  revalidatePath("/knowledge-hub/for-you/reminders");
  revalidatePath("/knowledge-hub/for-you");
  revalidatePath("/knowledge-hub/roadmap");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid reminder id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const input = normalizeReminderUpdateInput(body);
    const reminder = await updateReminder(session.user.id, id, input);
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }
    await syncReminderNotifications(session.user.id).catch((error) => {
      console.error("Failed to sync reminder notification:", error);
    });
    revalidateReminderViews();
    return NextResponse.json({ reminder });
  } catch (error) {
    if (error instanceof ReminderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update reminder:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid reminder id" }, { status: 400 });
  }

  try {
    const removed = await deleteReminder(session.user.id, id);
    if (!removed) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }
    revalidateReminderViews();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
