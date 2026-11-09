import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/features/auth";
import {
  createReminder,
  getReminderFormOptions,
  getReminderSummary,
  listReminders,
  normalizeReminderCreateInput,
  ReminderError,
  syncReminderNotifications,
} from "@/features/reminders";

export const dynamic = "force-dynamic";

function revalidateReminderViews() {
  revalidatePath("/knowledge-hub/for-you/reminders");
  revalidatePath("/knowledge-hub/for-you");
  revalidatePath("/knowledge-hub/roadmap");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [reminders, summary, options] = await Promise.all([
      listReminders(session.user.id),
      getReminderSummary(session.user.id),
      getReminderFormOptions(session.user.id),
    ]);
    return NextResponse.json(
      { reminders, summary, ...options },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Failed to load reminders:", error);
    return NextResponse.json({ error: "Failed to load reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const input = normalizeReminderCreateInput(body);
    const reminder = await createReminder(session.user.id, input);
    await syncReminderNotifications(session.user.id).catch((error) => {
      console.error("Failed to sync reminder notification:", error);
    });
    revalidateReminderViews();
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    if (error instanceof ReminderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create reminder:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
